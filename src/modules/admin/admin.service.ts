import { and, desc, eq, inArray, lte, ne, or, sql } from 'drizzle-orm'

import {
    fantasyFranchises,
    fixtureLineupPlayers,
    fixtureLineups,
    fixtureUserPlayerPoints,
    fixtureUserPoints,
    fixtures,
    lineupSelectionTypes,
    matchStats,
    matches,
    players,
    rosterCycles,
    rulesets,
    users
} from '@/core'
import type { CreateRuleSet, RuleSet } from '@/core'
import { DatabaseConnection } from '@/core/db/service/database.service'
import { BadRequestError, NotFoundError } from '@/util'

import { AdminFixtureTeamsResponse, Fixture, GetFixturesQuery, Match } from './admin.types'
import { CreateFixture, CreateMatch } from '../team/team.types'
import { ScoreService } from './engine/score.service'
import { getMatchDetails, ParsedPlayerStats, processCricbuzzStats } from '@/lib/get-match-stats'
import { EMPTY_BREAKDOWN } from '@/constants/admin.constants'

type FixtureRecord = typeof fixtures.$inferSelect
type FixtureLineupRecord = typeof fixtureLineups.$inferSelect

export interface IAdminService {
    ingestMatchPerformance(fixtureId: string, cricbuzzMatchId: string): Promise<void>
    previewPointsForFixture(fixtureId: string): Promise<{
        fixtureId: string
        isProcessed: boolean
        entries: Array<{
            fixtureUserPointsId: string
            rosterCycleId: string
            lineupId: string
            totalPoints: number
            rankSnapshot: number | null
        }>
    }>
    publishMatchResults(fixtureId: string): Promise<void>
    lockMatch(matchId: string, isLocked: boolean): Promise<void>
    createMatch(data: CreateMatch): Promise<void>
    updateMatch(matchId: string, data: Partial<Match>): Promise<void>
    getMatchById(matchId: string): Promise<Match>
    getMatches(): Promise<Match[]>
    createFixture(data: CreateFixture): Promise<void>
    updateFixture(fixtureId: string, data: Partial<Fixture>): Promise<void>
    getFixtureById(fixtureId: string): Promise<Fixture>
    getFixtures(query: GetFixturesQuery): Promise<Fixture[]>
    getFixtureTeams(fixtureId: string): Promise<AdminFixtureTeamsResponse>
    getRulesets(): Promise<RuleSet[]>
    createRuleset(data: CreateRuleSet): Promise<RuleSet>
    updateRuleset(rulesetId: string, data: Partial<CreateRuleSet>): Promise<RuleSet>
    deleteRuleset(rulesetId: string): Promise<void>
}

export class AdminService implements IAdminService {
    constructor(private readonly db: DatabaseConnection) {}

    /**
     * API 1: Ingest match data from Cricbuzz and calculate sandbox points.
     */
    async ingestMatchPerformance(fixtureId: string, cricbuzzMatchId: string): Promise<void> {
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))
        if (!fixture) throw new NotFoundError('Fixture not found')
        if (fixture.isProcessed) throw new BadRequestError('Match already published')

        const [activeRuleset] = await this.db
            .select()
            .from(rulesets)
            .where(eq(rulesets.isActive, true))
            .orderBy(desc(rulesets.createdAt))
            .limit(1)

        const scoreService = new ScoreService(activeRuleset?.config)

        // 1. Fetch from Cricbuzz
        const rawData = await getMatchDetails(cricbuzzMatchId)
        const statsMap: Map<string, ParsedPlayerStats> = processCricbuzzStats(rawData)

        // 2. Resolve Players from DB (by cricbuzzPlayerId or Name)
        const dbPlayers = await this.db.select().from(players)
        const playerMap = new Map<string, typeof players.$inferSelect>()

        // We build a resolver that prioritizes ID but falls back to exact name matching
        dbPlayers.forEach((p) => {
            if (p.cricbuzzPlayerId) playerMap.set(p.cricbuzzPlayerId, p)
            playerMap.set(p.name.toLowerCase(), p)
        })

        await this.db.transaction(async (tx) => {
            // 3. Clear existing sandbox data for this fixture
            await tx.delete(matchStats).where(eq(matchStats.fixtureId, fixtureId))
            await tx.delete(fixtureUserPoints).where(eq(fixtureUserPoints.fixtureId, fixtureId))

            // 4. Map Cricbuzz stats to our Player objects and calculate Base Points
            const finalPerformances: Array<{
                playerId: string
                stats: ParsedPlayerStats
                basePoints: number
            }> = []

            for (const [nameOrId, stat] of statsMap.entries()) {
                const player = playerMap.get(nameOrId.toLowerCase())
                if (!player) continue // Log missing player if needed

                const battingPoints = scoreService.calculateBattingPoints({
                    ...stat.batting,
                    runs: stat.batting.runs,
                    fours: stat.batting.fours,
                    sixes: stat.batting.sixes,
                    ballsFaced: stat.batting.ballsFaced,
                    isBatsman: player.role === 'Batsman'
                })

                const bowlingPoints = scoreService.calculateBowlingPoints({
                    ...stat.bowling,
                    wickets: stat.bowling.wickets,
                    runsConceded: stat.bowling.runsConceded,
                    oversBowled: stat.bowling.oversBowled,
                    dots: stat.bowling.dots,
                    lbwBowledCount: stat.bowling.lbwBowledCount,
                    maidens: stat.bowling.maidens
                })

                const fieldingPoints = scoreService.calculateFieldingPoints(
                    {
                        ...stat.fielding,
                        catches: stat.fielding.catches,
                        runOutDirect: stat.fielding.runOutDirect,
                        stumpings: stat.fielding.stumpings
                    },

                    player.role === 'Wicket-Keeper'
                )

                const basePoints = battingPoints.total + bowlingPoints.total + fieldingPoints.total

                finalPerformances.push({ playerId: player.id, stats: stat, basePoints })

                // Save to raw match_stats with complete breakdown
                await tx.insert(matchStats).values({
                    fixtureId,
                    playerId: player.id,
                    runs: stat.batting.runs,
                    fours: stat.batting.fours,
                    sixes: stat.batting.sixes,
                    wickets: stat.bowling.wickets,
                    catches: stat.fielding.catches,
                    runouts: stat.fielding.runOutDirect,
                    // Legacy compatibility: this table stores per-player base contribution.
                    finalPoints: basePoints,
                    basePoints: basePoints,
                    breakdown: {
                        batting: {
                            total: battingPoints.total,
                            rawRunsPoints: battingPoints.rawRunsPoints,
                            foursPoints: battingPoints.foursPoints,
                            sixesPoints: battingPoints.sixesPoints,
                            milestonePoints: battingPoints.milestonePoints,
                            strikeRatePoints: battingPoints.strikeRatePoints,
                            duckPenaltyPoints: battingPoints.duckPenaltyPoints
                        },
                        bowling: {
                            total: bowlingPoints.total,
                            wicketsPoints: bowlingPoints.wicketsPoints,
                            dotBallPoints: bowlingPoints.dotBallPoints,
                            milestonePoints: bowlingPoints.milestonePoints,
                            overBonusPoints: bowlingPoints.overBonusPoints,
                            economyPoints: bowlingPoints.economyPoints,
                            maidenPoints: bowlingPoints.maidenPoints,
                            lbwBowledPoints: bowlingPoints.lbwBowledPoints
                        },
                        fielding: {
                            total: fieldingPoints.total,
                            catchesPoints: fieldingPoints.catchesPoints,
                            runOutPoints: fieldingPoints.runOutPoints,
                            stumpingsPoints: fieldingPoints.stumpingsPoints,
                            catchBonusPoints: fieldingPoints.catchBonusPoints,
                            runOutBonusPoints: fieldingPoints.runOutBonusPoints,
                            stumpingBonusPoints: fieldingPoints.stumpingBonusPoints
                        },
                        totalBasePoints: basePoints
                    }
                })
            }

            // 5. Calculate Points for all User Lineups (Sandbox)
            const rosterCycleEntries = await tx
                .select({ rosterCycleId: rosterCycles.id, userId: fantasyFranchises.userId })
                .from(rosterCycles)
                .innerJoin(fantasyFranchises, eq(rosterCycles.franchiseId, fantasyFranchises.id))
                .where(eq(rosterCycles.matchId, fixture.matchId))

            for (const entry of rosterCycleEntries) {
                let lineup = await this.getFixtureLineupForCycle(
                    tx,
                    entry.rosterCycleId,
                    fixture.id
                )
                if (!lineup)
                    lineup = await this.autoApplyPreviousLineupIfAvailable(
                        tx,
                        entry.rosterCycleId,
                        fixture
                    )
                if (!lineup) continue

                const lineupPlayers = await tx
                    .select({
                        playerId: fixtureLineupPlayers.playerId,
                        selectionType: fixtureLineupPlayers.selectionType
                    })
                    .from(fixtureLineupPlayers)
                    .where(eq(fixtureLineupPlayers.fixtureLineupId, lineup.id))

                let userTotal = 0
                const [userPointsRow] = await tx
                    .insert(fixtureUserPoints)
                    .values({
                        rosterCycleId: entry.rosterCycleId,
                        fixtureId: fixture.id,
                        lineupId: lineup.id,
                        totalPoints: 0
                    })
                    .returning()

                const playerPointsBatch = lineupPlayers.map((lp) => {
                    const perf = finalPerformances.find((p) => p.playerId === lp.playerId)
                    const player = dbPlayers.find((p) => p.id === lp.playerId)
                    const isPlaying = lp.selectionType === lineupSelectionTypes[0]

                    let fantasyRole: 'Normal' | 'Captain' | 'ViceCaptain' | 'ImpactPlayer' =
                        'Normal'
                    if (lp.playerId === lineup?.captainId) fantasyRole = 'Captain'
                    else if (lp.playerId === lineup?.viceCaptainId) fantasyRole = 'ViceCaptain'
                    else if (lp.playerId === lineup?.impactPlayerId) fantasyRole = 'ImpactPlayer'

                    // Calculate final points using the comprehensive method
                    const scoreBreakdown =
                        isPlaying && perf
                            ? scoreService.calculateFinalPoints({
                                  batting: perf.stats.batting,
                                  bowling: perf.stats.bowling,
                                  fielding: perf.stats.fielding,
                                  playerRole: player?.role || 'Batsman',
                                  isWicketKeeper: player?.role === 'Wicket-Keeper',
                                  fantasyRole,
                                  isOverseas: player?.isOverseas ?? false
                              })
                            : EMPTY_BREAKDOWN(fantasyRole)

                    const finalPoints = scoreBreakdown?.finalPoints

                    userTotal += finalPoints
                    return {
                        fixtureUserPointsId: userPointsRow.id,
                        playerId: lp.playerId,
                        selectionType: lp.selectionType,
                        isCaptain: fantasyRole === 'Captain',
                        isViceCaptain: fantasyRole === 'ViceCaptain',
                        isImpactPlayer: fantasyRole === 'ImpactPlayer',
                        basePoints: scoreBreakdown.totalBasePoints,
                        multiplier:
                            scoreBreakdown.role.roleMultiplier *
                            scoreBreakdown.role.overseasMultiplier,
                        bonusPoints:
                            scoreBreakdown.role.roleBonusPoints +
                            scoreBreakdown.role.overseasBonusPoints,
                        finalPoints,
                        breakdown: scoreBreakdown
                    }
                })

                await tx.insert(fixtureUserPlayerPoints).values(playerPointsBatch)
                await tx
                    .update(fixtureUserPoints)
                    .set({ totalPoints: userTotal })
                    .where(eq(fixtureUserPoints.id, userPointsRow.id))
            }
        })
    }

    /**
     * API 2: Finalize the leaderboard and publish results.
     */
    async previewPointsForFixture(fixtureId: string): Promise<{
        fixtureId: string
        isProcessed: boolean
        entries: Array<{
            fixtureUserPointsId: string
            rosterCycleId: string
            lineupId: string
            totalPoints: number
            rankSnapshot: number | null
        }>
    }> {
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))
        if (!fixture) throw new NotFoundError('Fixture not found')

        const entries = await this.db
            .select({
                fixtureUserPointsId: fixtureUserPoints.id,
                rosterCycleId: fixtureUserPoints.rosterCycleId,
                lineupId: fixtureUserPoints.lineupId,
                totalPoints: fixtureUserPoints.totalPoints,
                rankSnapshot: fixtureUserPoints.rankSnapshot
            })
            .from(fixtureUserPoints)
            .where(eq(fixtureUserPoints.fixtureId, fixtureId))
            .orderBy(desc(fixtureUserPoints.totalPoints))

        return {
            fixtureId: fixture.id,
            isProcessed: fixture.isProcessed,
            entries
        }
    }

    async publishMatchResults(fixtureId: string): Promise<void> {
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))
        if (!fixture) throw new NotFoundError('Fixture not found')
        if (fixture.isProcessed) throw new BadRequestError('Already published')

        await this.db.transaction(async (tx) => {
            // 1. Calculate Rankings
            const rankedRows = await tx
                .select()
                .from(fixtureUserPoints)
                .where(eq(fixtureUserPoints.fixtureId, fixtureId))
                .orderBy(desc(fixtureUserPoints.totalPoints))

            for (let i = 0; i < rankedRows.length; i++) {
                await tx
                    .update(fixtureUserPoints)
                    .set({ rankSnapshot: i + 1 })
                    .where(eq(fixtureUserPoints.id, rankedRows[i].id))
            }

            // 2. Update Global User Scores
            const pointResults = await tx
                .select({ userId: fantasyFranchises.userId, points: fixtureUserPoints.totalPoints })
                .from(fixtureUserPoints)
                .innerJoin(rosterCycles, eq(fixtureUserPoints.rosterCycleId, rosterCycles.id))
                .innerJoin(fantasyFranchises, eq(rosterCycles.franchiseId, fantasyFranchises.id))
                .where(eq(fixtureUserPoints.fixtureId, fixtureId))

            for (const res of pointResults) {
                await tx
                    .update(users)
                    .set({
                        totalScore: sql`${users.totalScore} + ${res.points}`,
                        matchesPlayed: sql`${users.matchesPlayed} + 1`
                    })
                    .where(eq(users.id, res.userId))
            }

            // 3. Mark as Complete
            await tx
                .update(fixtures)
                .set({ isProcessed: true, matchStatus: 'completed' })
                .where(eq(fixtures.id, fixtureId))
            await tx
                .update(fixtureLineups)
                .set({ status: 'scored' })
                .where(eq(fixtureLineups.fixtureId, fixtureId))
        })
    }

    // ... (rest of the lockMatch, createFixture methods remain similar)
    async lockMatch(matchId: string, isLocked: boolean): Promise<void> {
        await this.db.update(matches).set({ isLocked }).where(eq(matches.id, matchId))
    }

    async createMatch(data: CreateMatch): Promise<void> {
        await this.db.insert(matches).values(data)
    }

    async updateMatch(matchId: string, data: Partial<Match>): Promise<void> {
        const [match] = await this.db
            .update(matches)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(matches.id, matchId))
            .returning({ id: matches.id })

        if (!match) throw new NotFoundError('Match not found')
    }

    async getMatchById(matchId: string): Promise<Match> {
        const [match] = await this.db.select().from(matches).where(eq(matches.id, matchId))
        if (!match) throw new NotFoundError('Match not found')
        return match
    }

    async getRulesets(): Promise<RuleSet[]> {
        return await this.db.select().from(rulesets).orderBy(desc(rulesets.createdAt))
    }

    async createRuleset(data: CreateRuleSet): Promise<RuleSet> {
        return await this.db.transaction(async (tx) => {
            if (data.isActive) {
                await tx
                    .update(rulesets)
                    .set({ isActive: false })
                    .where(eq(rulesets.isActive, true))
            }

            const [ruleset] = await tx.insert(rulesets).values(data).returning()
            return ruleset
        })
    }

    async updateRuleset(rulesetId: string, data: Partial<CreateRuleSet>): Promise<RuleSet> {
        const [existingRuleset] = await this.db
            .select({ id: rulesets.id })
            .from(rulesets)
            .where(eq(rulesets.id, rulesetId))

        if (!existingRuleset) throw new NotFoundError('Ruleset not found')

        return await this.db.transaction(async (tx) => {
            if (data.isActive) {
                await tx
                    .update(rulesets)
                    .set({ isActive: false, updatedAt: new Date() })
                    .where(and(eq(rulesets.isActive, true), ne(rulesets.id, rulesetId)))
            }

            const [ruleset] = await tx
                .update(rulesets)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(rulesets.id, rulesetId))
                .returning()

            return ruleset
        })
    }

    async deleteRuleset(rulesetId: string): Promise<void> {
        const [ruleset] = await this.db
            .select({ id: rulesets.id })
            .from(rulesets)
            .where(eq(rulesets.id, rulesetId))

        if (!ruleset) throw new NotFoundError('Ruleset not found')

        await this.db.transaction(async (tx) => {
            await tx
                .update(fixtureLineups)
                .set({ rulesetId: null })
                .where(eq(fixtureLineups.rulesetId, rulesetId))
            await tx.delete(rulesets).where(eq(rulesets.id, rulesetId))
        })
    }

    async getMatches(): Promise<Match[]> {
        return await this.db.select().from(matches)
    }

    async createFixture(data: CreateFixture): Promise<void> {
        await this.db.insert(fixtures).values({
            ...data,
            lineupLockAt: data.lineupLockAt ?? new Date(data.startTime.getTime() - 60 * 60 * 1000),
            matchStatus: data.matchStatus ?? 'scheduled'
        })
    }

    async updateFixture(fixtureId: string, data: Partial<Fixture>): Promise<void> {
        await this.db.update(fixtures).set(data).where(eq(fixtures.id, fixtureId))
    }

    async getFixtureById(fixtureId: string): Promise<Fixture> {
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))
        if (!fixture) throw new NotFoundError('Fixture not found')
        return fixture as Fixture
    }

    async getFixtureTeams(fixtureId: string): Promise<AdminFixtureTeamsResponse> {
        const fixture = await this.getFixtureById(fixtureId)

        const rosterCycleEntries = await this.db
            .select({
                rosterCycleId: rosterCycles.id,
                franchiseId: fantasyFranchises.id,
                franchiseUserId: fantasyFranchises.userId,
                teamName: fantasyFranchises.teamName,
                teamLogo: fantasyFranchises.teamLogo,
                userId: users.id,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                profileImage: users.profileImage
            })
            .from(rosterCycles)
            .innerJoin(fantasyFranchises, eq(rosterCycles.franchiseId, fantasyFranchises.id))
            .innerJoin(users, eq(fantasyFranchises.userId, users.id))
            .where(eq(rosterCycles.matchId, fixture.matchId))

        const entries = await Promise.all(
            rosterCycleEntries.map(async (entry) => {
                let lineup = await this.getFixtureLineupForCycle(
                    this.db,
                    entry.rosterCycleId,
                    fixture.id
                )

                if (!lineup && this.isFixtureLocked(fixture)) {
                    lineup = await this.autoApplyPreviousLineupIfAvailable(
                        this.db,
                        entry.rosterCycleId,
                        fixture
                    )
                }

                const lineupPlayers = lineup ? await this.getFixtureLineupPlayers(lineup.id) : []

                const [matchPoints] = lineup
                    ? await this.db
                          .select({
                              id: fixtureUserPoints.id,
                              totalPoints: fixtureUserPoints.totalPoints,
                              rankSnapshot: fixtureUserPoints.rankSnapshot
                          })
                          .from(fixtureUserPoints)
                          .where(eq(fixtureUserPoints.lineupId, lineup.id))
                    : []

                return {
                    rosterCycleId: entry.rosterCycleId,
                    franchise: {
                        id: entry.franchiseId,
                        userId: entry.franchiseUserId,
                        teamName: entry.teamName,
                        teamLogo: entry.teamLogo
                    },
                    user: {
                        id: entry.userId,
                        username: entry.username,
                        firstName: entry.firstName,
                        lastName: entry.lastName,
                        email: entry.email,
                        profileImage: entry.profileImage
                    },
                    lineup,
                    lineupPlayers,
                    matchPoints: matchPoints ?? null
                }
            })
        )

        return {
            fixture,
            entries
        }
    }

    async getFixtures(query: GetFixturesQuery): Promise<Fixture[]> {
        const status = query.status ?? query.matchStatus
        const conditions = []

        if (status) conditions.push(eq(fixtures.matchStatus, status))
        if (query.team)
            conditions.push(or(eq(fixtures.teamA, query.team), eq(fixtures.teamB, query.team)))
        if (query.matchId) conditions.push(eq(fixtures.matchId, query.matchId))

        const baseQuery = this.db.select().from(fixtures)
        if (!conditions.length) return await baseQuery

        return await baseQuery.where(and(...conditions))
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
                fixtureId: fixtureLineups.fixtureId,
                captainId: fixtureLineups.captainId,
                viceCaptainId: fixtureLineups.viceCaptainId,
                impactPlayerId: fixtureLineups.impactPlayerId,
                rulesetId: fixtureLineups.rulesetId
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

        const prev = previousLineups.find((l) => l.fixtureId !== fixture.id)
        if (!prev) return null

        const prevPlayers = await executor
            .select()
            .from(fixtureLineupPlayers)
            .where(eq(fixtureLineupPlayers.fixtureLineupId, prev.id))
        const [created] = await executor
            .insert(fixtureLineups)
            .values({
                rosterCycleId,
                fixtureId: fixture.id,
                rulesetId: prev.rulesetId,
                status: 'locked',
                captainId: prev.captainId,
                viceCaptainId: prev.viceCaptainId,
                impactPlayerId: prev.impactPlayerId,
                submittedAt: new Date(),
                lockedAt: new Date(),
                lineupLockAt:
                    fixture.lineupLockAt || new Date(fixture.startTime.getTime() - 3600000)
            })
            .returning()

        await executor.insert(fixtureLineupPlayers).values(
            prevPlayers.map((p) => ({
                fixtureLineupId: created.id,
                playerId: p.playerId,
                selectionType: p.selectionType
            }))
        )
        return created
    }

    private async getFixtureLineupPlayers(fixtureLineupId: string) {
        return this.db
            .select({
                id: players.id,
                name: players.name,
                role: players.role,
                iplTeam: players.iplTeam,
                isOverseas: players.isOverseas,
                cost: players.cost,
                profileImageUrl: players.profileImageUrl,
                selectionType: fixtureLineupPlayers.selectionType,
                runs: matchStats.runs,
                fours: matchStats.fours,
                sixes: matchStats.sixes,
                wickets: matchStats.wickets,
                catches: matchStats.catches,
                runouts: matchStats.runouts,
                basePoints: fixtureUserPlayerPoints.basePoints,
                multiplier: fixtureUserPlayerPoints.multiplier,
                bonusPoints: fixtureUserPlayerPoints.bonusPoints,
                finalPoints: fixtureUserPlayerPoints.finalPoints,
                breakdown: fixtureUserPlayerPoints.breakdown
            })
            .from(fixtureLineupPlayers)
            .innerJoin(players, eq(fixtureLineupPlayers.playerId, players.id))
            .leftJoin(
                matchStats,
                and(
                    eq(matchStats.playerId, players.id),
                    inArray(
                        matchStats.fixtureId,
                        this.db
                            .select({ fixtureId: fixtureLineups.fixtureId })
                            .from(fixtureLineups)
                            .where(eq(fixtureLineups.id, fixtureLineupId))
                    )
                )
            )
            .leftJoin(
                fixtureUserPlayerPoints,
                and(
                    eq(fixtureUserPlayerPoints.playerId, players.id),
                    inArray(
                        fixtureUserPlayerPoints.fixtureUserPointsId,
                        this.db
                            .select({ id: fixtureUserPoints.id })
                            .from(fixtureUserPoints)
                            .where(eq(fixtureUserPoints.lineupId, fixtureLineupId))
                    )
                )
            )
            .where(eq(fixtureLineupPlayers.fixtureLineupId, fixtureLineupId))
    }

    private isFixtureLocked(fixture: FixtureRecord) {
        const now = new Date()
        const lockAt =
            fixture.lineupLockAt ?? new Date(fixture.startTime.getTime() - 60 * 60 * 1000)
        return now > lockAt
    }
}
