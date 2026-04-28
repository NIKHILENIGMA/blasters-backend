import { and, desc, eq, inArray, lte, sql } from 'drizzle-orm'

import {
    fantasyFranchises,
    fixtureBoosterAwards,
    fixtureLineupPlayers,
    fixtureLineups,
    fixtureUserPlayerPoints,
    fixtureUserPoints,
    fixtures,
    lineupSelectionTypes,
    matches,
    players,
    rosterCycles,
    rulesets,
    users
} from '@/core'
import { RulesetConfig } from '@/core/db/schema/rulesets'
import { DatabaseConnection } from '@/core/db/service/database.service'
import { BadRequestError, NotFoundError } from '@/util'

import { CalculateFantasyPointsPayload, Fixture, Match, PlayerStats } from './admin.types'
import { matchStats } from '@/core/db/schema/match-stats'
import { CreateFixture, CreateMatch } from '../team/team.types'

const DEFAULT_RULESET: RulesetConfig = {
    totalPlayers: 12,
    roles: {
        batsman: { min: 4 },
        bowler: { min: 5 },
        wicketKeeper: { min: 1 },
        allRounder: { min: 2 }
    },
    overseas: { max: 4 },
    multipliers: {
        captain: 4,
        viceCaptain: 3,
        impactPlayer: 2.5
    }
}

type FixtureRecord = typeof fixtures.$inferSelect
type FixtureLineupRecord = typeof fixtureLineups.$inferSelect

export interface IAdminService {
    calculateFantasyPoints(matchId: string, data: CalculateFantasyPointsPayload): Promise<void>
    lockMatch(matchId: string, isLocked: boolean): Promise<void>
    createMatch(data: CreateMatch): Promise<void>
    updateMatch(matchId: string, data: Partial<Match>): Promise<void>
    getMatchById(matchId: string): Promise<Match>
    getMatches(): Promise<Match[]>
    createFixture(data: CreateFixture): Promise<void>
    updateFixture(fixtureId: string, data: Partial<Fixture>): Promise<void>
    getFixtureById(fixtureId: string): Promise<Fixture>
    getFixtures(): Promise<Fixture[]>
}

export class AdminService implements IAdminService {
    constructor(private readonly db: DatabaseConnection) {}

    async calculateFantasyPoints(
        matchId: string,
        data: CalculateFantasyPointsPayload
    ): Promise<void> {
        const { playerPerformances, fixtureId, matchResult } = data

        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))

        if (!fixture) {
            throw new BadRequestError('Invalid fixture ID provided.')
        }

        if (fixture.matchId !== matchId) {
            throw new BadRequestError('Fixture does not belong to the provided match session.')
        }

        if (fixture.isProcessed) {
            throw new BadRequestError('This match has already been processed.')
        }

        const playerIds = playerPerformances.map((performance) => performance.playerId)
        const existingPlayers = await this.db
            .select({ id: players.id })
            .from(players)
            .where(inArray(players.id, playerIds))

        if (existingPlayers.length !== playerIds.length) {
            throw new BadRequestError(
                'One or more player performances reference invalid player IDs.'
            )
        }

        const basePointsMap = new Map<string, number>()
        for (const performance of playerPerformances) {
            basePointsMap.set(performance.playerId, this.calculateBasePoints(performance.stats))
        }

        await this.db.transaction(async (tx) => {
            const rosterCycleEntries = await tx
                .select({
                    rosterCycleId: rosterCycles.id,
                    userId: fantasyFranchises.userId
                })
                .from(rosterCycles)
                .innerJoin(fantasyFranchises, eq(rosterCycles.franchiseId, fantasyFranchises.id))
                .where(eq(rosterCycles.matchId, matchId))

            const scoringTargets: Array<{
                lineup: FixtureLineupRecord
                rosterCycleId: string
                userId: string
            }> = []

            for (const entry of rosterCycleEntries) {
                let lineup = await this.getFixtureLineupForCycle(
                    tx,
                    entry.rosterCycleId,
                    fixture.id
                )

                if (!lineup) {
                    lineup = await this.autoApplyPreviousLineupIfAvailable(
                        tx,
                        entry.rosterCycleId,
                        fixture
                    )
                }

                if (!lineup) {
                    continue
                }

                scoringTargets.push({
                    lineup,
                    rosterCycleId: entry.rosterCycleId,
                    userId: entry.userId
                })
            }

            await tx.insert(matchStats).values(
                playerPerformances.map((performance) => ({
                    fixtureId,
                    playerId: performance.playerId,
                    runs: performance.stats.runs,
                    fours: performance.stats.fours,
                    sixes: performance.stats.sixes,
                    wickets: performance.stats.wickets,
                    catches: performance.stats.catches,
                    runouts: performance.stats.runouts,
                    finalPoints: basePointsMap.get(performance.playerId) ?? 0
                }))
            )

            const fixtureUserPointRows: Array<{
                id: string
                userId: string
                totalPoints: number
            }> = []

            for (const target of scoringTargets) {
                const lineupPlayers = await tx
                    .select({
                        playerId: fixtureLineupPlayers.playerId,
                        selectionType: fixtureLineupPlayers.selectionType
                    })
                    .from(fixtureLineupPlayers)
                    .where(eq(fixtureLineupPlayers.fixtureLineupId, target.lineup.id))

                const rules =
                    (target.lineup.rulesetId
                        ? await this.getRulesetConfigById(tx, target.lineup.rulesetId)
                        : null) ??
                    (await this.getActiveGlobalRuleset(tx)) ??
                    DEFAULT_RULESET

                const boosterContext = await this.getBoosterContext(
                    tx,
                    target.rosterCycleId,
                    fixture.id
                )

                let totalPoints = boosterContext.fixtureLevelBonus

                const [userPointsRow] = await tx
                    .insert(fixtureUserPoints)
                    .values({
                        rosterCycleId: target.rosterCycleId,
                        fixtureId: fixture.id,
                        lineupId: target.lineup.id,
                        totalPoints: 0
                    })
                    .returning()

                const playerBreakdownRows = lineupPlayers.map((lineupPlayer) => {
                    const isPlaying = lineupPlayer.selectionType === lineupSelectionTypes[0]
                    const isCaptain = target.lineup.captainId === lineupPlayer.playerId
                    const isViceCaptain = target.lineup.viceCaptainId === lineupPlayer.playerId
                    const isImpactPlayer = target.lineup.impactPlayerId === lineupPlayer.playerId
                    const basePoints = basePointsMap.get(lineupPlayer.playerId) ?? 0
                    const bonusPoints =
                        boosterContext.playerBonusMap.get(lineupPlayer.playerId) ?? 0
                    const multiplier = isPlaying
                        ? this.resolveLineupMultiplier(
                              {
                                  isCaptain,
                                  isViceCaptain,
                                  isImpactPlayer
                              },
                              rules
                          )
                        : 0

                    const finalPoints = (isPlaying ? basePoints * multiplier : 0) + bonusPoints
                    totalPoints += finalPoints

                    return {
                        fixtureUserPointsId: userPointsRow.id,
                        playerId: lineupPlayer.playerId,
                        selectionType: lineupPlayer.selectionType,
                        isCaptain,
                        isViceCaptain,
                        isImpactPlayer,
                        basePoints,
                        multiplier,
                        bonusPoints,
                        finalPoints,
                        breakdown: {
                            selectedInPlayingTwelve: isPlaying,
                            playerBasePoints: basePoints,
                            appliedMultiplier: multiplier,
                            playerBoosterBonus: bonusPoints
                        }
                    }
                })

                await tx.insert(fixtureUserPlayerPoints).values(playerBreakdownRows)

                await tx
                    .update(fixtureUserPoints)
                    .set({
                        totalPoints,
                        updatedAt: new Date()
                    })
                    .where(eq(fixtureUserPoints.id, userPointsRow.id))

                await tx
                    .update(fixtureLineups)
                    .set({
                        status: 'scored',
                        lockedAt: target.lineup.lockedAt ?? new Date(),
                        updatedAt: new Date()
                    })
                    .where(eq(fixtureLineups.id, target.lineup.id))

                fixtureUserPointRows.push({
                    id: userPointsRow.id,
                    userId: target.userId,
                    totalPoints
                })
            }

            const rankedRows = [...fixtureUserPointRows].sort(
                (a, b) => b.totalPoints - a.totalPoints
            )

            for (let index = 0; index < rankedRows.length; index++) {
                await tx
                    .update(fixtureUserPoints)
                    .set({
                        rankSnapshot: index + 1,
                        updatedAt: new Date()
                    })
                    .where(eq(fixtureUserPoints.id, rankedRows[index].id))
            }

            const userScoreMap = new Map<string, number>()
            for (const row of fixtureUserPointRows) {
                userScoreMap.set(row.userId, (userScoreMap.get(row.userId) ?? 0) + row.totalPoints)
            }

            for (const [userId, score] of userScoreMap.entries()) {
                await tx
                    .update(users)
                    .set({
                        totalScore: sql`${users.totalScore} + ${score}`,
                        matchesPlayed: sql`${users.matchesPlayed} + 1`
                    })
                    .where(eq(users.id, userId))
            }

            await tx
                .update(fixtures)
                .set({
                    isProcessed: true,
                    matchStatus: 'completed',
                    matchResult
                })
                .where(eq(fixtures.id, fixtureId))
        })
    }

    async lockMatch(matchId: string, isLocked: boolean): Promise<void> {
        const [targetSession] = await this.db.select().from(matches).where(eq(matches.id, matchId))

        if (!targetSession) throw new NotFoundError('Session not found')

        await this.db.update(matches).set({ isLocked: isLocked }).where(eq(matches.id, matchId))
    }

    async createFixture(data: CreateFixture): Promise<void> {
        const [match] = await this.db.select().from(matches).where(eq(matches.id, data.matchId))

        if (!match) {
            throw new NotFoundError('Match session not found for this fixture')
        }

        await this.db.insert(fixtures).values({
            ...data,
            lineupLockAt: data.lineupLockAt ?? new Date(data.startTime.getTime() - 60 * 60 * 1000),
            matchStatus: data.matchStatus ?? 'scheduled'
        })
    }

    async updateFixture(fixtureId: string, data: Partial<Fixture>): Promise<void> {
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))
        if (!fixture) {
            throw new NotFoundError('Fixture not found for this match session')
        }

        await this.db.update(fixtures).set(data).where(eq(fixtures.id, fixtureId))
    }

    async getFixtureById(fixtureId: string): Promise<Fixture> {
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))

        if (!fixture) {
            throw new NotFoundError('Fixture not found')
        }
        return fixture
    }

    async getFixtures(): Promise<Fixture[]> {
        return await this.db.select().from(fixtures)
    }

    async createMatch(data: CreateMatch): Promise<void> {
        await this.db.insert(matches).values(data)
    }

    async updateMatch(matchId: string, data: Partial<Match>): Promise<void> {
        const [match] = await this.db.select().from(matches).where(eq(matches.id, matchId))
        if (!match) {
            throw new NotFoundError('Match session not found')
        }

        await this.db.update(matches).set(data).where(eq(matches.id, matchId))
    }

    async getMatchById(matchId: string): Promise<Match> {
        const [match] = await this.db.select().from(matches).where(eq(matches.id, matchId))

        if (!match) {
            throw new NotFoundError('Match not found')
        }

        return match
    }

    async getMatches(): Promise<Match[]> {
        return await this.db.select().from(matches)
    }

    private async getFixtureLineupForCycle(
        executor: DatabaseConnection,
        rosterCycleId: string,
        fixtureId: string
    ): Promise<FixtureLineupRecord | null> {
        const [lineup] = await executor
            .select()
            .from(fixtureLineups)
            .where(
                and(
                    eq(fixtureLineups.rosterCycleId, rosterCycleId),
                    eq(fixtureLineups.fixtureId, fixtureId)
                )
            )

        return lineup ?? null
    }

    private async autoApplyPreviousLineupIfAvailable(
        executor: DatabaseConnection,
        rosterCycleId: string,
        fixture: FixtureRecord
    ): Promise<FixtureLineupRecord | null> {
        const previousLineups = await executor
            .select({
                id: fixtureLineups.id,
                rosterCycleId: fixtureLineups.rosterCycleId,
                fixtureId: fixtureLineups.fixtureId,
                rulesetId: fixtureLineups.rulesetId,
                status: fixtureLineups.status,
                captainId: fixtureLineups.captainId,
                viceCaptainId: fixtureLineups.viceCaptainId,
                impactPlayerId: fixtureLineups.impactPlayerId,
                submittedAt: fixtureLineups.submittedAt,
                lockedAt: fixtureLineups.lockedAt,
                lineupLockAt: fixtureLineups.lineupLockAt,
                autoAppliedFromLineupId: fixtureLineups.autoAppliedFromLineupId,
                createdAt: fixtureLineups.createdAt,
                updatedAt: fixtureLineups.updatedAt
            })
            .from(fixtureLineups)
            .innerJoin(fixtures, eq(fixtureLineups.fixtureId, fixtures.id))
            .where(
                and(
                    eq(fixtureLineups.rosterCycleId, rosterCycleId),
                    lte(fixtures.startTime, fixture.startTime)
                )
            )
            .orderBy(desc(fixtures.startTime))

        const previousLineup = previousLineups.find(
            (lineup: (typeof previousLineups)[number]) => lineup.fixtureId !== fixture.id
        )

        if (!previousLineup) {
            return null
        }

        const previousPlayers = await executor
            .select({
                playerId: fixtureLineupPlayers.playerId,
                selectionType: fixtureLineupPlayers.selectionType
            })
            .from(fixtureLineupPlayers)
            .where(eq(fixtureLineupPlayers.fixtureLineupId, previousLineup.id))

        const [createdLineup] = await executor
            .insert(fixtureLineups)
            .values({
                rosterCycleId,
                fixtureId: fixture.id,
                rulesetId: previousLineup.rulesetId,
                status: 'locked',
                captainId: previousLineup.captainId,
                viceCaptainId: previousLineup.viceCaptainId,
                impactPlayerId: previousLineup.impactPlayerId,
                submittedAt: new Date(),
                lockedAt: new Date(),
                lineupLockAt:
                    fixture.lineupLockAt ?? new Date(fixture.startTime.getTime() - 60 * 60 * 1000),
                autoAppliedFromLineupId: previousLineup.id
            })
            .returning()

        await executor.insert(fixtureLineupPlayers).values(
            previousPlayers.map((player: (typeof previousPlayers)[number]) => ({
                fixtureLineupId: createdLineup.id,
                playerId: player.playerId,
                selectionType: player.selectionType
            }))
        )

        return createdLineup
    }

    private async getActiveGlobalRuleset(
        executor: DatabaseConnection
    ): Promise<RulesetConfig | null> {
        const [ruleset] = await executor
            .select()
            .from(rulesets)
            .where(and(eq(rulesets.scope, 'global'), eq(rulesets.isActive, true)))
            .orderBy(desc(rulesets.createdAt))

        return ruleset?.config ?? null
    }

    private async getRulesetConfigById(
        executor: DatabaseConnection,
        rulesetId: string
    ): Promise<RulesetConfig | null> {
        const [ruleset] = await executor.select().from(rulesets).where(eq(rulesets.id, rulesetId))

        return ruleset?.config ?? null
    }

    private async getBoosterContext(
        executor: DatabaseConnection,
        rosterCycleId: string,
        fixtureId: string
    ) {
        const awards = await executor
            .select({
                playerId: fixtureBoosterAwards.playerId,
                pointsAwarded: fixtureBoosterAwards.pointsAwarded
            })
            .from(fixtureBoosterAwards)
            .where(
                and(
                    eq(fixtureBoosterAwards.rosterCycleId, rosterCycleId),
                    eq(fixtureBoosterAwards.fixtureId, fixtureId)
                )
            )

        const playerBonusMap = new Map<string, number>()
        let fixtureLevelBonus = 0

        for (const award of awards) {
            if (!award.playerId) {
                fixtureLevelBonus += award.pointsAwarded
                continue
            }

            playerBonusMap.set(
                award.playerId,
                (playerBonusMap.get(award.playerId) ?? 0) + award.pointsAwarded
            )
        }

        return { playerBonusMap, fixtureLevelBonus }
    }

    private resolveLineupMultiplier(
        roles: { isCaptain: boolean; isViceCaptain: boolean; isImpactPlayer: boolean },
        rules: RulesetConfig
    ): number {
        if (roles.isCaptain) return rules.multipliers.captain
        if (roles.isViceCaptain) return rules.multipliers.viceCaptain
        if (roles.isImpactPlayer) return rules.multipliers.impactPlayer
        return 1
    }

    private calculateBasePoints(stats: PlayerStats): number {
        let points = 0

        points += stats.runs * 1
        points += stats.fours * 6
        points += stats.sixes * 10
        points += stats.catches * 30
        points += stats.runouts * 50

        let wicketPoints = stats.wickets * 15
        if (stats.wickets >= 5) {
            wicketPoints *= 3
        }

        points += wicketPoints

        return points
    }
}
