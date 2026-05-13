import { and, asc, desc, eq, gte, inArray, lte } from 'drizzle-orm'

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
    ROASTER_STATUS,
    rosterCyclePlayers,
    rosterCycles,
    rulesets,
    type RulesetConfig
} from '@/core'
import { DatabaseConnection } from '@/core/db/service/database.service'
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '@/util'
import {
    GetCurrentRosterCycleResponse,
    GetFixtureLineupResponse,
    GetFranchiseOverviewResponse,
    GetUpcomingFixturesResponse
} from './franchise.types'
import { logger } from '@/config'

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

type FranchiseRecord = typeof fantasyFranchises.$inferSelect
type MatchRecord = typeof matches.$inferSelect
type FixtureRecord = typeof fixtures.$inferSelect
type RosterCycleRecord = typeof rosterCycles.$inferSelect
type FixtureLineupRecord = typeof fixtureLineups.$inferSelect
type RosterCyclePlayerRecord = Pick<
    typeof players.$inferSelect,
    'id' | 'name' | 'role' | 'iplTeam' | 'isOverseas' | 'cost' | 'profileImageUrl'
> & {
    purchasePrice: number
}

type CreateFranchiseInput = {
    teamName: string
    teamLogo: string
}

type SaveSquadInput = {
    matchId: string
    playerIds: string[]
}

type SaveFixtureLineupInput = {
    fixtureId: string
    playingPlayerIds: string[]
    substitutePlayerIds: string[]
    captainId: string
    viceCaptainId: string
    impactPlayerId: string
}

export interface IFranchiseService {
    createFranchise(userId: string, data: CreateFranchiseInput): Promise<void>
    updateFranchise(userId: string, data: CreateFranchiseInput): Promise<void>
    getFranchiseOverview(userId: string): Promise<unknown>
    getCurrentRosterCycle(userId: string): Promise<unknown>
    saveSquad(userId: string, isDraft: boolean, data: SaveSquadInput): Promise<void>
    getUpcomingFixtures(userId: string): Promise<GetUpcomingFixturesResponse>
    getFixtureLineup(userId: string, fixtureId: string): Promise<unknown>
    saveFixtureLineup(userId: string, data: SaveFixtureLineupInput): Promise<void>
}

export class FranchiseService implements IFranchiseService {
    constructor(private readonly db: DatabaseConnection) {}

    /**
     * Creates a new franchise for the user. Each user can only have one franchise, so if a franchise already exists for the user, a ConflictError is thrown.
     *
     * @param userId - The ID of the user creating the franchise
     * @param data - The franchise creation data, including team name and logo URL
     */
    async createFranchise(userId: string, data: CreateFranchiseInput): Promise<void> {
        const [existingFranchise] = await this.db
            .select()
            .from(fantasyFranchises)
            .where(eq(fantasyFranchises.userId, userId))

        if (existingFranchise) {
            throw new ConflictError('Franchise already exists for this user')
        }

        await this.db.insert(fantasyFranchises).values({
            userId,
            teamName: data.teamName,
            teamLogo: data.teamLogo
        })
    }

    async updateFranchise(userId: string, data: CreateFranchiseInput): Promise<void> {
        const franchise = await this.requireFranchise(userId)

        await this.db
            .update(fantasyFranchises)
            .set({
                teamName: data.teamName,
                teamLogo: data.teamLogo,
                updatedAt: new Date()
            })
            .where(eq(fantasyFranchises.id, franchise.id))
    }

    /**
     * Fetches an overview of the user's franchise, including franchise details, active match cycle, and current roster cycle with players. If no franchise exists for the user, franchise will be null but active cycle and roster cycle may still be returned if there is an active match.
     *
     * @param userId - The ID of the user whose franchise overview is being fetched
     * @returns  - An object containing the franchise details, active match cycle, and roster cycle with players. Franchise will be null if the user has not created a franchise yet.
     */

    async getFranchiseOverview(userId: string): Promise<GetFranchiseOverviewResponse> {
        const [franchise] = await this.db
            .select()
            .from(fantasyFranchises)
            .where(eq(fantasyFranchises.userId, userId))

        const activeMatch = await this.getActiveMatchWindow()

        if (!franchise) {
            return {
                franchise: null,
                activeCycle: activeMatch,
                rosterCycle: null
            }
        }

        const rosterCycle = activeMatch
            ? await this.getRosterCycleByFranchiseAndMatch(franchise.id, activeMatch.id)
            : null

        const cyclePlayers = rosterCycle ? await this.getRosterCyclePlayers(rosterCycle.id) : []

        return {
            franchise,
            activeCycle: activeMatch,
            rosterCycle: rosterCycle ? cyclePlayers : null
        }
    }

    async getCurrentRosterCycle(userId: string): Promise<GetCurrentRosterCycleResponse> {
        const franchise = await this.requireFranchise(userId)
        const activeMatch = await this.getActiveMatchWindow()

        if (!activeMatch) {
            return {
                cycle: null,
                players: []
            }
        }

        const rosterCycle = await this.getRosterCycleByFranchiseAndMatch(
            franchise.id,
            activeMatch.id
        )

        const cyclePlayers = rosterCycle ? await this.getRosterCyclePlayers(rosterCycle.id) : []

        return {
            cycle: rosterCycle,
            players: cyclePlayers,
            match: activeMatch
        }
    }

    async saveSquad(userId: string, isDraft: boolean, data: SaveSquadInput): Promise<void> {
        const franchise = await this.requireFranchise(userId)
        const match = await this.requireMatch(data.matchId)

        this.ensureUniqueIds(data.playerIds, 'Squad player IDs must be unique')
        this.ensureWithinBuyWindow(match)

        const selectedPlayers = await this.db
            .select()
            .from(players)
            .where(inArray(players.id, data.playerIds))

        // Enforce exactly 25 players for published squads to ensure users are selecting a complete squad within the constraints, but allow draft squads to be saved with less than 25 players to enable gradual squad building and flexibility during the buy window
        if (!isDraft && selectedPlayers.length !== 25) {
            throw new BadRequestError('One or more selected squad players are invalid')
        }

        // Allow saving draft squads with less than 25 players to enable gradual squad building, but enforce a maximum of 25 players to prevent overspending and ensure users are building towards a valid squad
        if (selectedPlayers.length !== data.playerIds.length) {
            throw new BadRequestError('Draft squads cannot contain more than 25 players')
        }

        const totalCost = selectedPlayers.reduce((sum, player) => sum + player.cost, 0)

        // Enfore budget limit on both draft and published squads to prevent overspending in drafts and ensure published squads are always within budget
        if (totalCost > 2000) {
            throw new BadRequestError('Total squad cost cannot exceed 2000 credits')
        }

        await this.db.transaction(async (tx) => {
            let rosterCycle = await this.getRosterCycleByFranchiseAndMatch(
                franchise.id,
                match.id,
                tx
            )
            let removedPlayerIds: string[] = []

            if (!rosterCycle) {
                const [createdCycle] = await tx
                    .insert(rosterCycles)
                    .values({
                        franchiseId: franchise.id,
                        matchId: match.id,
                        budgetTotal: 2000,
                        status: isDraft ? ROASTER_STATUS.DRAFT : ROASTER_STATUS.PUBLISHED,
                        budgetUsed: totalCost,
                        walletResetAmount: 2000
                    })
                    .returning()
                rosterCycle = createdCycle
            } else {
                await tx
                    .update(rosterCycles)
                    .set({
                        budgetUsed: totalCost,
                        status: isDraft ? ROASTER_STATUS.DRAFT : ROASTER_STATUS.PUBLISHED,
                        updatedAt: new Date()
                    })
                    .where(eq(rosterCycles.id, rosterCycle.id))

                const existingRosterPlayers = await tx
                    .select({ playerId: rosterCyclePlayers.playerId })
                    .from(rosterCyclePlayers)
                    .where(eq(rosterCyclePlayers.rosterCycleId, rosterCycle.id))

                const selectedPlayerIds = new Set(selectedPlayers.map((player) => player.id))
                removedPlayerIds = existingRosterPlayers
                    .map((player) => player.playerId)
                    .filter((playerId) => !selectedPlayerIds.has(playerId))

                await this.deleteLineupsWithRemovedPlayingPlayers(
                    rosterCycle.id,
                    removedPlayerIds,
                    tx
                )

                await tx
                    .delete(rosterCyclePlayers)
                    .where(eq(rosterCyclePlayers.rosterCycleId, rosterCycle.id))
            }

            await tx.insert(rosterCyclePlayers).values(
                selectedPlayers.map((player) => ({
                    rosterCycleId: rosterCycle.id,
                    playerId: player.id,
                    purchasePrice: player.cost
                }))
            )
        })
    }

    private async deleteLineupsWithRemovedPlayingPlayers(
        rosterCycleId: string,
        removedPlayerIds: string[],
        executor: DatabaseConnection = this.db
    ) {
        if (removedPlayerIds.length === 0) {
            return
        }

        const invalidLineups = await executor
            .select({ id: fixtureLineups.id })
            .from(fixtureLineups)
            .innerJoin(fixtures, eq(fixtureLineups.fixtureId, fixtures.id))
            .innerJoin(
                fixtureLineupPlayers,
                eq(fixtureLineupPlayers.fixtureLineupId, fixtureLineups.id)
            )
            .where(
                and(
                    eq(fixtureLineups.rosterCycleId, rosterCycleId),
                    eq(fixtureLineupPlayers.selectionType, lineupSelectionTypes[0]),
                    inArray(fixtureLineupPlayers.playerId, removedPlayerIds),
                    eq(fixtures.isProcessed, false)
                )
            )

        const invalidLineupIds = [...new Set(invalidLineups.map((lineup) => lineup.id))]

        if (invalidLineupIds.length === 0) {
            return
        }

        await executor.delete(fixtureLineups).where(inArray(fixtureLineups.id, invalidLineupIds))
    }

    async getUpcomingFixtures(userId: string): Promise<GetUpcomingFixturesResponse> {
        const franchise = await this.requireFranchise(userId)
        const activeMatch = await this.getActiveMatchWindow()
        // logger.info(`Franchise ${franchise.id} fetching upcoming fixtures for active match ${activeMatch?.id}`)
        if (!activeMatch) {
            return { fixtures: [] }
        }

        const rosterCycle = await this.getRosterCycleByFranchiseAndMatch(
            franchise.id,
            activeMatch.id
        )

        if (!rosterCycle) {
            logger.info(
                `Franchise ${franchise.id} has no roster cycle for active match ${activeMatch.id}`
            )
            return { fixtures: [] }
        }

        const cycleFixtures = await this.db
            .select()
            .from(fixtures)
            .where(eq(fixtures.matchId, activeMatch.id))
            .orderBy(asc(fixtures.startTime))

        return {
            fixtures: cycleFixtures
        }
    }

    async getFixtureLineup(userId: string, fixtureId: string): Promise<GetFixtureLineupResponse> {
        const franchise = await this.requireFranchise(userId)
        const fixture = await this.requireFixture(fixtureId)
        const rosterCycle = await this.requireRosterCycleForFixture(franchise.id, fixture)

        let lineup: FixtureLineupRecord | null = await this.getFixtureLineupRecord(
            rosterCycle.id,
            fixture.id
        )

        if (!lineup && this.isFixtureLocked(fixture)) {
            lineup = await this.autoApplyPreviousLineupIfAvailable(
                rosterCycle.id,
                fixture.id,
                fixture
            )
        }

        const lineupPlayers = lineup ? await this.getFixtureLineupPlayers(lineup.id) : []

        // Fetch overall match points for the user
        const [matchPoints] = lineup
            ? await this.db
                  .select()
                  .from(fixtureUserPoints)
                  .where(eq(fixtureUserPoints.lineupId, lineup.id))
            : []

        return {
            fixture,
            lineup,
            lineupPlayers,
            matchPoints: matchPoints ?? null
        }
    }

    async saveFixtureLineup(userId: string, data: SaveFixtureLineupInput): Promise<void> {
        const franchise = await this.requireFranchise(userId)
        const fixture = await this.requireFixture(data.fixtureId)
        const rosterCycle = await this.requireRosterCycleForFixture(franchise.id, fixture)

        if (this.isFixtureLocked(fixture)) {
            throw new ForbiddenError('Lineup changes are closed for this fixture')
        }

        this.ensureUniqueIds(data.playingPlayerIds, 'Playing player IDs must be unique')
        this.ensureUniqueIds(data.substitutePlayerIds, 'Substitute player IDs must be unique')

        const combinedIds = [...data.playingPlayerIds, ...data.substitutePlayerIds]
        this.ensureUniqueIds(combinedIds, 'Playing and substitute players cannot overlap')

        if (
            !data.playingPlayerIds.includes(data.captainId) ||
            !data.playingPlayerIds.includes(data.viceCaptainId) ||
            !data.playingPlayerIds.includes(data.impactPlayerId)
        ) {
            throw new BadRequestError(
                'Captain, vice-captain, and impact player must be selected from the playing 12'
            )
        }

        if (new Set([data.captainId, data.viceCaptainId, data.impactPlayerId]).size !== 3) {
            throw new BadRequestError(
                'Captain, vice-captain, and impact player must be assigned to different players'
            )
        }

        const squadPlayers = await this.getRosterCyclePlayers(rosterCycle.id)
        const squadPlayerIds = new Set(squadPlayers.map((player) => player.id))

        if (
            combinedIds.length !== squadPlayers.length ||
            combinedIds.some((playerId) => !squadPlayerIds.has(playerId))
        ) {
            throw new BadRequestError(
                'Fixture lineup must use the exact 25 players from the saved squad'
            )
        }

        await this.validatePlayingCombination(squadPlayers, data.playingPlayerIds)

        const activeRuleset = await this.getActiveRuleset()
        const lockAt =
            fixture.lineupLockAt ?? new Date(fixture.startTime.getTime() - 60 * 60 * 1000)

        await this.db.transaction(async (tx) => {
            let lineup = await this.getFixtureLineupRecord(rosterCycle.id, fixture.id, tx)

            if (!lineup) {
                const [createdLineup] = await tx
                    .insert(fixtureLineups)
                    .values({
                        rosterCycleId: rosterCycle.id,
                        fixtureId: fixture.id,
                        rulesetId: activeRuleset?.id,
                        captainId: data.captainId,
                        viceCaptainId: data.viceCaptainId,
                        impactPlayerId: data.impactPlayerId,
                        lineupLockAt: lockAt,
                        submittedAt: new Date(),
                        status: 'draft'
                    })
                    .returning()
                lineup = createdLineup
            } else {
                await tx
                    .update(fixtureLineups)
                    .set({
                        rulesetId: activeRuleset?.id ?? lineup.rulesetId,
                        captainId: data.captainId,
                        viceCaptainId: data.viceCaptainId,
                        impactPlayerId: data.impactPlayerId,
                        lineupLockAt: lockAt,
                        submittedAt: new Date(),
                        updatedAt: new Date()
                    })
                    .where(eq(fixtureLineups.id, lineup.id))

                await tx
                    .delete(fixtureLineupPlayers)
                    .where(eq(fixtureLineupPlayers.fixtureLineupId, lineup.id))
            }

            await tx.insert(fixtureLineupPlayers).values([
                ...data.playingPlayerIds.map((playerId) => ({
                    fixtureLineupId: lineup.id,
                    playerId,
                    selectionType: lineupSelectionTypes[0]
                })),
                ...data.substitutePlayerIds.map((playerId) => ({
                    fixtureLineupId: lineup.id,
                    playerId,
                    selectionType: lineupSelectionTypes[1]
                }))
            ])
        })
    }

    private async requireFranchise(userId: string): Promise<FranchiseRecord> {
        const [franchise] = await this.db
            .select()
            .from(fantasyFranchises)
            .where(eq(fantasyFranchises.userId, userId))

        if (!franchise) {
            throw new NotFoundError('Franchise not found for this user')
        }

        return franchise
    }

    private async requireMatch(matchId: string): Promise<MatchRecord> {
        const [match] = await this.db.select().from(matches).where(eq(matches.id, matchId))

        if (!match) {
            throw new NotFoundError('Roster cycle match window not found')
        }

        return match
    }

    private async requireFixture(fixtureId: string): Promise<FixtureRecord> {
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))

        if (!fixture) {
            throw new NotFoundError('Fixture not found')
        }

        return fixture
    }

    private async requireRosterCycleForFixture(
        franchiseId: string,
        fixture: FixtureRecord
    ): Promise<RosterCycleRecord> {
        const rosterCycle = await this.getRosterCycleByFranchiseAndMatch(
            franchiseId,
            fixture.matchId
        )

        if (!rosterCycle) {
            throw new NotFoundError('Roster cycle not found for this fixture')
        }

        return rosterCycle
    }

    private async getActiveMatchWindow() {
        const now = new Date()
        const [activeMatch] = await this.db
            .select()
            .from(matches)
            .where(and(lte(matches.startTime, now), gte(matches.endTime, now)))
            .orderBy(desc(matches.startTime))
        return activeMatch ?? null
    }

    private async getRosterCycleByFranchiseAndMatch(
        franchiseId: string,
        matchId: string,
        executor: DatabaseConnection = this.db
    ): Promise<RosterCycleRecord | null> {
        const [rosterCycle] = await executor
            .select()
            .from(rosterCycles)
            .where(
                and(eq(rosterCycles.franchiseId, franchiseId), eq(rosterCycles.matchId, matchId))
            )

        return rosterCycle ?? null
    }

    private async getRosterCyclePlayers(rosterCycleId: string): Promise<RosterCyclePlayerRecord[]> {
        const cyclePlayers = await this.db
            .select({
                id: players.id,
                name: players.name,
                role: players.role,
                iplTeam: players.iplTeam,
                isOverseas: players.isOverseas,
                cost: players.cost,
                profileImageUrl: players.profileImageUrl,
                purchasePrice: rosterCyclePlayers.purchasePrice
            })
            .from(rosterCyclePlayers)
            .innerJoin(players, eq(rosterCyclePlayers.playerId, players.id))
            .where(eq(rosterCyclePlayers.rosterCycleId, rosterCycleId))

        return cyclePlayers
    }

    private async getFixtureLineupRecord(
        rosterCycleId: string,
        fixtureId: string,
        executor: DatabaseConnection = this.db
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
                // Joined point data
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
                    // Use a subquery to correctly link to the fixtureUserPoints associated with this lineup
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

    private ensureWithinBuyWindow(match: MatchRecord) {
        const now = new Date()
        const windowOpenAt = match.buyWindowOpenAt ?? match.startTime
        const windowCloseAt = match.buyWindowCloseAt ?? match.endTime

        if (match.isLocked || (match.squadLockAt && now > match.squadLockAt)) {
            throw new ForbiddenError('Squad selection is locked for this cycle')
        }

        if (now < windowOpenAt || now > windowCloseAt) {
            throw new ForbiddenError('Squad changes are outside the active buy window')
        }
    }

    private isFixtureLocked(fixture: FixtureRecord) {
        const now = new Date()
        const lockAt =
            fixture.lineupLockAt ?? new Date(fixture.startTime.getTime() - 60 * 60 * 1000)
        return now > lockAt
    }

    private ensureUniqueIds(ids: string[], message: string) {
        if (new Set(ids).size !== ids.length) {
            throw new BadRequestError(message)
        }
    }

    private async getActiveRuleset() {
        const [activeRuleset] = await this.db
            .select()
            .from(rulesets)
            .where(and(eq(rulesets.scope, 'global'), eq(rulesets.isActive, true)))
            .orderBy(desc(rulesets.createdAt))

        return activeRuleset ?? null
    }

    private async validatePlayingCombination(
        squadPlayers: Awaited<ReturnType<FranchiseService['getRosterCyclePlayers']>>,
        playingPlayerIds: string[]
    ) {
        const playingPlayers = squadPlayers.filter((player) => playingPlayerIds.includes(player.id))
        const rules = (await this.getActiveRuleset())?.config ?? DEFAULT_RULESET

        if (playingPlayers.length !== rules.totalPlayers) {
            throw new BadRequestError(
                `Exactly ${rules.totalPlayers} players must be selected in the playing lineup`
            )
        }

        const roleCount = {
            batsman: 0,
            bowler: 0,
            wicketKeeper: 0,
            allRounder: 0,
            overseas: 0
        }

        for (const player of playingPlayers) {
            if (player.isOverseas) {
                roleCount.overseas += 1
            }

            switch (player.role) {
                case 'Batsman':
                    roleCount.batsman += 1
                    break
                case 'Bowler':
                    roleCount.bowler += 1
                    break
                case 'Wicket-Keeper':
                    roleCount.wicketKeeper += 1
                    break
                case 'All-Rounder':
                    roleCount.allRounder += 1
                    break
                default:
                    break
            }
        }

        if (roleCount.batsman < rules.roles.batsman.min) {
            throw new BadRequestError(
                `Playing lineup must contain at least ${rules.roles.batsman.min} batsmen`
            )
        }

        if (roleCount.bowler < rules.roles.bowler.min) {
            throw new BadRequestError(
                `Playing lineup must contain at least ${rules.roles.bowler.min} bowlers`
            )
        }

        if (roleCount.wicketKeeper < rules.roles.wicketKeeper.min) {
            throw new BadRequestError(
                `Playing lineup must contain at least ${rules.roles.wicketKeeper.min} wicketkeeper`
            )
        }

        if (roleCount.allRounder < rules.roles.allRounder.min) {
            throw new BadRequestError(
                `Playing lineup must contain at least ${rules.roles.allRounder.min} all-rounders`
            )
        }

        if (roleCount.overseas > rules.overseas.max) {
            throw new BadRequestError(
                `Playing lineup can contain a maximum of ${rules.overseas.max} overseas players`
            )
        }
    }

    private async autoApplyPreviousLineupIfAvailable(
        rosterCycleId: string,
        fixtureId: string,
        fixture: FixtureRecord
    ): Promise<FixtureLineupRecord | null> {
        const [previousLineup] = await this.db
            .select({
                id: fixtureLineups.id,
                rosterCycleId: fixtureLineups.rosterCycleId,
                fixtureId: fixtureLineups.fixtureId,
                rulesetId: fixtureLineups.rulesetId,
                captainId: fixtureLineups.captainId,
                viceCaptainId: fixtureLineups.viceCaptainId,
                impactPlayerId: fixtureLineups.impactPlayerId,
                submittedAt: fixtureLineups.submittedAt,
                lockedAt: fixtureLineups.lockedAt,
                lineupLockAt: fixtureLineups.lineupLockAt,
                autoAppliedFromLineupId: fixtureLineups.autoAppliedFromLineupId,
                createdAt: fixtureLineups.createdAt,
                updatedAt: fixtureLineups.updatedAt,
                fixtureStartTime: fixtures.startTime
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

        if (!previousLineup || previousLineup.fixtureId === fixtureId) {
            return null
        }

        const previousPlayers = await this.getFixtureLineupPlayers(previousLineup.id)
        const lockAt =
            fixture.lineupLockAt ?? new Date(fixture.startTime.getTime() - 60 * 60 * 1000)

        const [createdLineup] = await this.db
            .insert(fixtureLineups)
            .values({
                rosterCycleId,
                fixtureId,
                rulesetId: previousLineup.rulesetId,
                captainId: previousLineup.captainId,
                viceCaptainId: previousLineup.viceCaptainId,
                impactPlayerId: previousLineup.impactPlayerId,
                submittedAt: new Date(),
                lockedAt: new Date(),
                lineupLockAt: lockAt,
                autoAppliedFromLineupId: previousLineup.id,
                status: 'locked'
            })
            .returning()

        await this.db.insert(fixtureLineupPlayers).values(
            previousPlayers.map((player) => ({
                fixtureLineupId: createdLineup.id,
                playerId: player.id,
                selectionType: player.selectionType
            }))
        )

        return createdLineup
    }
}
