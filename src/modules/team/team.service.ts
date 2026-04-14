import { and, asc, desc, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm'

import {
    MAX_OVERSEAS_PLAYERS,
    MAX_TEAM_POINTS,
    TOTAL_NUMBER_OF_PLAYERS
} from '@/constants/team.constant'
import { fixtures, players, users } from '@/core'
import { fantasyTeams } from '@/core/db/schema/fantasy-team'
import { matches } from '@/core/db/schema/matches'
import { DatabaseConnection } from '@/core/db/service/database.service'
import { BadRequestError, ForbiddenError } from '@/util'

import { Match } from './team.types'
import { logger } from '@/config'
import { Player } from '../players/players.types'

interface Team {
    id: string
    userId: string
    matchId: string
    teamName: string | null
    players: {
        id: string
        name: string
        team: 'CSK' | 'MI' | 'RCB' | 'KKR' | 'SRH' | 'DC' | 'PBKS' | 'RR' | 'GT' | 'LSG'
        isOverseas: boolean
        profilePicUrl: string
        role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper'
    }[]
    captainId: string
    viceCaptainId: string
    updatedAt: Date
}

interface FantasyTeam {
    id: string
    name: string
    team: string
    ownerId: string
    isOverseas: boolean
    cost: number
    profilePicUrl: string
    role: string
}

interface GetCurrentTeamResponse {
    hasTeam: boolean
    team: {
        id: string
        ownerId: string
        name: string
        players: Array<Omit<FantasyTeam, 'ownerId'>>
        captainId: string
        viceCaptainId: string
    } | null
    session: {
        id: string
        startTime: Date
        isLocked: boolean
    } | null
}

export interface ITeamService {
    createTeam(
        userId: string,
        data: {
            name: string
            playerIds: string[]
            captainId: string
            viceCaptainId: string
            matchId: string
        }
    ): Promise<void>
    updateTeam(
        userId: string,
        data: {
            teamId: string
            matchId: string
            playerIds: string[]
            captainId: string
            viceCaptainId: string
        }
    ): Promise<void>
    getCurrentTeam(userId: string): Promise<GetCurrentTeamResponse>
    getSession(): Promise<{ isActive: boolean; session: Match | null }>
    updateRoles(
        userId: string,
        data: { teamId: string; fixtureId: string; newCaptainId: string; newViceCaptainId: string }
    ): Promise<void>
    getTodayFixtures(): Promise<{
        id: string
        teamA: string
        teamB: string
        startTime: Date
        isProcessed: boolean
    }>
    getTeamById(userId: string, teamId: string): Promise<Team>
}

export class TeamService implements ITeamService {
    constructor(private readonly db: DatabaseConnection) {}

    // temporary helper function to detect unique constraint violation on team name for the same user and match
    private isTeamNameUniqueViolation(error: unknown): boolean {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Failed query: insert into "fantasy_teams"')) {
            return true
        }

        return false
    }

    private getISTDayRangeInUTC(): { startUTC: Date; endUTC: Date } {
        const now = new Date()

        // Convert current time to IST manually
        const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))

        const startOfDayIST = new Date(istNow)
        startOfDayIST.setHours(0, 0, 0, 0)

        const endOfDayIST = new Date(startOfDayIST)
        endOfDayIST.setDate(endOfDayIST.getDate() + 1)

        // Convert IST → UTC
        const startUTC = new Date(startOfDayIST.getTime() - 5.5 * 60 * 60 * 1000)
        const endUTC = new Date(endOfDayIST.getTime() - 5.5 * 60 * 60 * 1000)

        return { startUTC, endUTC }
    }

    async createTeam(
        userId: string,
        data: {
            name: string
            playerIds: string[]
            captainId: string
            viceCaptainId: string
            matchId: string
        }
    ): Promise<void> {
        // Validate that the captain and vice-captain are not the same and are part of the selected players
        if (data.captainId === data.viceCaptainId) {
            throw new BadRequestError('Captain and Vice-Captain cannot be the same player')
        }

        // Validate that the captain and vice-captain are included in the playerIds array
        if (data.captainId && !data.playerIds.includes(data.captainId)) {
            throw new BadRequestError('Captain must be one of the selected players')
        }
        // Validate that the vice-captain is included in the playerIds array
        if (data.viceCaptainId && !data.playerIds.includes(data.viceCaptainId)) {
            throw new BadRequestError('Vice-Captain must be one of the selected players')
        }

        const [activeSession] = await this.db
            .select()
            .from(matches)
            .where(eq(matches.id, data.matchId))

        if (!activeSession || activeSession.isLocked === true) {
            throw new ForbiddenError('Team selection is locked for this match')
        }

        // --- STEP 3: Fetch Player Data for Rule Checking ---
        // Fetch player details from the database to check for team composition rules
        const selectedPlayers = await this.db
            .select()
            .from(players)
            .where(inArray(players.id, data.playerIds))

        if (selectedPlayers.length !== TOTAL_NUMBER_OF_PLAYERS) {
            logger.error(
                `Invalid player selection. Expected ${TOTAL_NUMBER_OF_PLAYERS} players, but got ${selectedPlayers.length}. Player IDs: ${data.playerIds.join(
                    ','
                )}`
            )
            throw new BadRequestError('One or more selected players are invalid')
        }

        // --- STEP 4: Enforce Fantasy Rules ---
        let overseasCount = 0
        let totalCost = 0

        for (const player of selectedPlayers) {
            // Count overseas players
            if (player.isOverseas) overseasCount++
            // Calculate total cost
            totalCost += player.cost
        }

        // Validate overseas player count
        if (overseasCount > MAX_OVERSEAS_PLAYERS) {
            throw new BadRequestError('You can select a maximum of 4 overseas players')
        }

        // Validate total team cost
        if (totalCost > MAX_TEAM_POINTS) {
            logger.error(
                `Team cost exceeds maximum allowed. Total Cost: ${totalCost}, Max Allowed: ${MAX_TEAM_POINTS}`
            )
            throw new BadRequestError('Total team cost cannot exceed 100 credits')
        }

        // STEP 5: Verify User Wallet Balance (Assuming a function getUserWalletBalance exists)
        const [user] = await this.db.select().from(users).where(eq(users.id, userId))
        if (!user || user.availablePoints < totalCost) {
            logger.error(
                `User ${userId} has insufficient points. Available: ${user?.availablePoints}, Required: ${totalCost}`
            )
            throw new BadRequestError('Insufficient points in wallet to create this team')
        }

        // STEP 6: Create the Fantasy Team (Assuming a function createFantasyTeam exists)

        try {
            await this.db.transaction(async (trx) => {
                // check if team name is unique for the user and match
                const [existingTeam] = await trx
                    .select()
                    .from(fantasyTeams)
                    .where(
                        and(
                            eq(fantasyTeams.userId, userId),
                            eq(fantasyTeams.matchId, data.matchId),
                            eq(fantasyTeams.teamName, data.name)
                        )
                    )
                if (existingTeam) {
                    throw new BadRequestError(
                        'A team with this name already exists for the selected match'
                    )
                }

                // Insert the new fantasy team into the database
                await trx.insert(fantasyTeams).values({
                    userId,
                    matchId: data.matchId,
                    teamName: data.name,
                    players: data.playerIds,
                    captainId: data.captainId,
                    viceCaptainId: data.viceCaptainId
                })

                // Deduct the total cost from the user's wallet (Assuming a function updateUserWalletBalance exists)
                await trx
                    .update(users)
                    .set({ availablePoints: user.availablePoints - totalCost })
                    .where(eq(users.id, userId))
            })
        } catch (error) {
            if (this.isTeamNameUniqueViolation(error)) {
                throw new BadRequestError(
                    'Team name already exists. Please choose a different name.'
                )
            }
            throw new BadRequestError(
                error instanceof Error ? error.message : 'Failed to create team'
            )
        }
    }

    async updateTeam(
        userId: string,
        data: {
            teamId: string
            matchId: string
            playerIds: string[]
            captainId: string
            viceCaptainId: string
        }
    ): Promise<void> {
        // Step 1: Surface-Level Validation
        // Validate that the captain and vice-captain are not the same and are part of the selected players
        if (data.playerIds.length !== TOTAL_NUMBER_OF_PLAYERS) {
            throw new BadRequestError('Exactly 11 players must be selected')
        }

        // Validate that the captain and vice-captain are not the same
        if (data.captainId === data.viceCaptainId) {
            throw new BadRequestError('Captain and Vice-Captain cannot be the same player')
        }

        // Validate that the captain and vice-captain are included in the playerIds array
        if (
            !data.playerIds.includes(data.captainId) ||
            !data.playerIds.includes(data.viceCaptainId)
        ) {
            throw new BadRequestError(
                'Captain and Vice-Captain must be one of the selected players'
            )
        }

        // Step 2: The atomic transcation

        await this.db.transaction(async (trx) => {
            // verify that the team belongs to the user and is eligible for update (e.g., match not started)
            const [existingTeam] = await trx
                .select()
                .from(fantasyTeams)
                .where(and(eq(fantasyTeams.id, data.teamId), eq(fantasyTeams.userId, userId)))

            if (!existingTeam) {
                throw new ForbiddenError('Fantasy team not found or does not belong to the user')
            }

            // Verify that the match associated with the team is not locked for changes
            const [associatedMatch] = await trx
                .select()
                .from(matches)
                .where(eq(matches.id, data.matchId))

            if (!associatedMatch || associatedMatch.isLocked === true) {
                throw new ForbiddenError('Team selection is locked for this match')
            }

            // --- STEP 3: Fetch Player Data for Rule Checking ---
            // We use a Set to remove duplicates in case they kept some of the same players
            const uniquePlayerIds = [...new Set([...existingTeam.players, ...data.playerIds])]

            const allInvolvedPlayers = await trx
                .select()
                .from(players)
                .where(inArray(players.id, uniquePlayerIds))

            // Quick loop using map
            const playerMap = new Map<string, Player>()
            allInvolvedPlayers.forEach((p) => playerMap.set(p.id, p))

            // Step 4: Calculate old team cost and new team cost
            let oldTeamCost: number = 0
            existingTeam.players.forEach((pid) => {
                oldTeamCost += playerMap.get(pid)?.cost || 0
            })

            let newTeamCost: number = 0
            let overseasCount: number = 0

            for (const pid of data.playerIds) {
                const player = playerMap.get(pid)
                if (!player) {
                    throw new BadRequestError(`Player with ID ${pid} not found`)
                }
                newTeamCost += player.cost
                if (player.isOverseas) overseasCount++ // Count overseas players
            }

            // Validate overseas player count
            if (overseasCount !== MAX_OVERSEAS_PLAYERS) {
                throw new BadRequestError('You must select exactly 4 overseas players')
            }

            const [user] = await trx.select().from(users).where(eq(users.id, userId)).limit(1)

            if (!user) {
                throw new BadRequestError('User not found')
            }

            // Calculate the new balance after the team update
            const newBalance = user.availablePoints + oldTeamCost - newTeamCost // Validate that the user has enough points to cover the cost difference
            if (newBalance < 0) {
                throw new BadRequestError('Insufficient points in wallet to update this team')
            }

            // Step 5: Apply fincial update
            await trx.update(users).set({ availablePoints: newBalance }).where(eq(users.id, userId))

            // Step 6: Update the fantasy team with the new player selection and captain/vice-captain
            await trx
                .update(fantasyTeams)
                .set({
                    players: data.playerIds,
                    captainId: data.captainId,
                    viceCaptainId: data.viceCaptainId,
                    updatedAt: new Date()
                })
                .where(eq(fantasyTeams.id, data.teamId))
        })
    }

    async getCurrentTeam(userId: string): Promise<GetCurrentTeamResponse> {
        // Step 1: Validate that session is active and not locked
        const session = await this.getActiveSession()

        if (!session) {
            return {
                hasTeam: false,
                session: null,
                team: null
            }
        }
        // Step 2: Fetch the user's fantasy team for the given match
        const [team] = await this.db
            .select()
            .from(fantasyTeams)
            .where(and(eq(fantasyTeams.userId, userId), eq(fantasyTeams.matchId, session.id)))
            .limit(1)

        if (!team) {
            return {
                hasTeam: false,
                session: {
                    id: session.id,
                    startTime: session.startTime,
                    isLocked: session.isLocked
                },
                team: null
            }
        }

        let teamPlayers: Array<Omit<FantasyTeam, 'ownerId'>> = []

        if (team.players && team.players.length > 0) {
            teamPlayers = await this.db
                .select({
                    id: players.id,
                    name: players.name,
                    team: players.iplTeam,
                    isOverseas: players.isOverseas,
                    cost: players.cost,
                    profilePicUrl: players.profileImageUrl,
                    role: players.role
                })
                .from(players)
                .where(inArray(players.id, team.players))
        }

        return {
            hasTeam: true,
            session: {
                id: session.id,
                startTime: session.startTime,
                isLocked: session.isLocked
            },
            team: {
                id: team.id,
                ownerId: team.userId,
                name: team.teamName ?? 'Unnamed Team',
                players: teamPlayers,
                captainId: team.captainId,
                viceCaptainId: team.viceCaptainId
            }
        }
    }

    async updateRoles(
        userId: string,
        data: { teamId: string; fixtureId: string; newCaptainId: string; newViceCaptainId: string }
    ): Promise<void> {
        // Step 1: Validate that the new captain and vice-captain are not the same
        if (data.newCaptainId === data.newViceCaptainId) {
            throw new BadRequestError('Captain and Vice-Captain cannot be the same player')
        }

        // Step 2: Fetch the existing team to verify ownership and current player selection
        const [team] = await this.db
            .select()
            .from(fantasyTeams)
            .where(and(eq(fantasyTeams.id, data.teamId), eq(fantasyTeams.userId, userId)))
            .limit(1)

        if (!team || team.userId !== userId) {
            throw new ForbiddenError('Fantasy team not found or does not belong to the user')
        }

        // Step 3: Validate that the new captain and vice-captain are part of the existing player selection
        if (
            !team.players.includes(data.newCaptainId) ||
            !team.players.includes(data.newViceCaptainId)
        ) {
            throw new BadRequestError(
                'New Captain and Vice-Captain must be one of the existing selected players'
            )
        }

        // Step 5: Verify that the match associated with the team is not locked for changes
        const [nextFixture] = await this.db
            .select()
            .from(fixtures)
            .where(and(eq(fixtures.id, data.fixtureId), eq(fixtures.isProcessed, false)))

        if (!nextFixture) {
            throw new ForbiddenError(
                'No upcoming fixture found or the fixture is already processed'
            )
        }

        const ONE_HOUR_IN_MS: number = 60 * 60 * 1000
        // Calculate the time until the match starts
        const timeUntilMatch: number = new Date(nextFixture.startTime).getTime() - Date.now()
        // logger.info(
        //     `Time until match start: ${timeUntilMatch / (1000 * 60)} min for fixture ${data.fixtureId}`
        // )
        // const formatDate = (date: Date) => {
        //     return date.toLocaleString('en-IN', {
        //         timeZone: 'Asia/Kolkata', // THIS is the magic line
        //         day: 'numeric',
        //         month: 'long',
        //         year: 'numeric',
        //         hour: '2-digit',
        //         minute: '2-digit',
        //         second: '2-digit',
        //         hour12: true
        //     })
        // }
        // logger.info(
        //     `Current time: ${formatDate(new Date())}, Match start time: ${formatDate(new Date(nextFixture.startTime))}`
        // )
        // Prevent role changes if the match is starting within the next hour
        if (timeUntilMatch <= ONE_HOUR_IN_MS) {
            throw new ForbiddenError('Cannot change roles within 1 hour of match start time')
        }

        // Step 6: Update the fantasy team with the new captain and vice-captain
        await this.db
            .update(fantasyTeams)
            .set({
                captainId: data.newCaptainId,
                viceCaptainId: data.newViceCaptainId,
                updatedAt: new Date()
            })
            .where(eq(fantasyTeams.id, data.teamId))
    }

    async getTeamById(userId: string, teamId: string): Promise<Team> {
        const [team] = await this.db
            .select({
                id: fantasyTeams.id,
                userId: fantasyTeams.userId,
                matchId: fantasyTeams.matchId,
                teamName: fantasyTeams.teamName,
                playerIds: fantasyTeams.players,
                captainId: fantasyTeams.captainId,
                viceCaptainId: fantasyTeams.viceCaptainId,
                updatedAt: fantasyTeams.updatedAt
            })
            .from(fantasyTeams)
            .where(and(eq(fantasyTeams.id, teamId), eq(fantasyTeams.userId, userId)))
            .limit(1)

        if (!team) {
            throw new ForbiddenError('Fantasy team not found or does not belong to the user')
        }

        let teamPlayers: Team['players'] = []
        if (team.playerIds.length > 0) {
            const fetchedPlayers = await this.db
                .select({
                    id: players.id,
                    name: players.name,
                    team: players.iplTeam,
                    isOverseas: players.isOverseas,
                    profilePicUrl: players.profileImageUrl,
                    role: players.role
                })
                .from(players)
                .where(inArray(players.id, team.playerIds))

            const playerMap = new Map(fetchedPlayers.map((player) => [player.id, player]))

            // Keep player order consistent with saved fantasy team order.
            teamPlayers = team.playerIds
                .map((playerId) => playerMap.get(playerId))
                .filter((player): player is Team['players'][number] => Boolean(player))
        }

        return {
            id: team.id,
            userId: team.userId,
            matchId: team.matchId,
            teamName: team.teamName,
            players: teamPlayers,
            captainId: team.captainId,
            viceCaptainId: team.viceCaptainId,
            updatedAt: team.updatedAt
        }
    }

    async getTodayFixtures(): Promise<{
        id: string
        teamA: string
        teamB: string
        startTime: Date
        isProcessed: boolean
    }> {
        const { startUTC, endUTC } = this.getISTDayRangeInUTC()
        // Fetch fixtures that are scheduled to start today (between 00:00 and 23:59)
        const fixture = await this.db
            .select()
            .from(fixtures)
            .where(and(gte(fixtures.startTime, startUTC), lt(fixtures.startTime, endUTC)))
            .orderBy(asc(fixtures.startTime))

        if (!fixture || fixture.length === 0) {
            throw new BadRequestError('No fixtures found for today')
        }

        // logger.info(`Fixtures found for today: ${fixture[0].startTime.toLocaleString("en-IN", { timeZone: 'Asia/Kolkata' })}`)
        const response = fixture.map((f) => ({
            id: f.id,
            teamA: f.teamA,
            teamB: f.teamB,
            startTime: f.startTime,
            isProcessed: f.isProcessed
        }))

        return response[0]
    }

    async getSession(): Promise<{ isActive: boolean; session: Match | null }> {
        const activeSession = await this.getActiveSession()
        return {
            isActive: !!activeSession,
            session: activeSession
        }
    }

    private async getActiveSession(): Promise<Match | null> {
        const [activeSession] = await this.db
            .select()
            .from(matches)
            .where(and(lte(matches.startTime, sql`NOW()`), gte(matches.endTime, sql`NOW()`)))
            .orderBy(desc(matches.startTime))
            .limit(1)
        // logger.info(`Fetched active session: ${activeSession ? new Date(activeSession.startTime) : 'None'}`)
        return activeSession
    }
}
