import { eq, sql } from 'drizzle-orm'

import { fixtures, users } from '@/core'
import { fantasyTeams } from '@/core/db/schema/fantasy-team'
import { matches } from '@/core/db/schema/matches'
import { DatabaseConnection } from '@/core/db/service/database.service'
import { BadRequestError, NotFoundError } from '@/util'

import { CalculateFantasyPointsPayload, PlayerStats } from './admin.types'
import { matchStats } from '@/core/db/schema/match-stats'
import { CreateMatch, Match } from '../team/team.types'

export interface IAdminService {
    calculateFantasyPoints(matchId: string, data: CalculateFantasyPointsPayload): Promise<void>
    lockMatch(matchId: string, isLocked: boolean): Promise<void>
    getMatchDetails(matchId: string): Promise<Match>
    createMatch(data: CreateMatch): Promise<void>
}

export class AdminService implements IAdminService {
    constructor(private readonly db: DatabaseConnection) {}

    async calculateFantasyPoints(
        matchId: string,
        data: CalculateFantasyPointsPayload
    ): Promise<void> {
        const { playerPerformances, fixtureId, matchResult } = data
        // Step 1: Validate match existence
        const [fixture] = await this.db.select().from(fixtures).where(eq(fixtures.id, fixtureId))

        if (!fixture) {
            throw new BadRequestError('Invalid fixture ID provided.')
        }
        // Step 2: Check if Tonight game is already processed
        if (fixture.isProcessed) {
            throw new BadRequestError('This match has already been processed.')
        }

        // Step 3: Calculate points for each player and update user scores
        // const performanceMap = new Map<string, PlayerPerformance>()
        const playerPointsMap = new Map<string, number>()

        /**
         * Points Calculation Logic:
         */

        for (const p of playerPerformances) {
            // Calculate base points for the player based on their stats
            const base = this.calculateBasePoints(p.stats)
            const overseasAdjusted = this.applyOverseasMultiplier(base, p.isOverseas)

            // Store the final points for the player in the map
            playerPointsMap.set(p.playerId, overseasAdjusted)
        }

        await this.db.transaction(async (tx) => {
            // store match stats with final points for each player
            await tx.insert(matchStats).values(
                playerPerformances.map((p) => ({
                    fixtureId,
                    playerId: p.playerId,
                    runs: p.stats.runs,
                    fours: p.stats.fours,
                    sixes: p.stats.sixes,
                    wickets: p.stats.wickets,
                    catches: p.stats.catches,
                    runouts: p.stats.runouts,
                    finalPoints: playerPointsMap.get(p.playerId) ?? 0
                }))
            )

            // Fetch all fantasy teams that participated in this match
            const teams = await tx
                .select()
                .from(fantasyTeams)
                .where(eq(fantasyTeams.matchId, matchId))

            // Aggregate user scores
            const userScoreMap = new Map<string, number>()

            // Calculate total points for each team and update user scores
            for (const team of teams) {
                let teamScores = 0

                for (const playerId of team.players) {
                    const basePoints = playerPointsMap.get(playerId) ?? 0
                    const isCaptain = team.captainId === playerId
                    const isViceCaptain = team.viceCaptainId === playerId

                    const finalPoints = this.applyCaptainMultiplier(
                        basePoints,
                        isCaptain,
                        isViceCaptain
                    )

                    teamScores += finalPoints
                }

                // Update the user's total score
                userScoreMap.set(team.userId, (userScoreMap.get(team.userId) ?? 0) + teamScores)
            }

            // Bulk update user scores in the database
            for (const [userId, score] of userScoreMap.entries()) {
                await tx
                    .update(users)
                    .set({
                        totalScore: sql`${users.totalScore} + ${score}`,
                        matchesPlayed: sql`${users.matchesPlayed} + 1`
                    })
                    .where(eq(users.id, userId))
            }

            // Mark the fixture as processed
            await tx
                .update(fixtures)
                .set({
                    isProcessed: true,
                    matchStatus: 'completed',
                    matchResult: matchResult
                })
                .where(eq(fixtures.id, fixtureId))
        })
    }

    async lockMatch(matchId: string, isLocked: boolean): Promise<void> {
        const [targetSession] = await this.db.select().from(matches).where(eq(matches.id, matchId))

        if (!targetSession) throw new NotFoundError('Session not found')

        await this.db.update(matches).set({ isLocked: isLocked }).where(eq(matches.id, matchId))
    }

    async createMatch(data: CreateMatch): Promise<void> {
        await this.db.insert(matches).values(data)
    }

    async getMatchDetails(matchId: string): Promise<Match> {
        const [match] = await this.db.select().from(matches).where(eq(matches.id, matchId))

        if (!match) {
            throw new NotFoundError('Match not found')
        }

        return match
    }

    private calculateBasePoints(stats: PlayerStats): number {
        let points = 0

        // Batting points
        points += stats.runs * 1 // 1 pt per run
        points += stats.fours * 6 // 6 pts per four
        points += stats.sixes * 10 // 10 pts per six

        // Fielding points
        points += stats.catches * 30 // 30 pts per catch
        points += stats.runouts * 50 // 50 pts per runout

        // Bowling points
        let wicketPoints = stats.wickets * 15 // 15 pts per wicket
        if (stats.wickets >= 5) {
            wicketPoints *= 3 // Triple points for 5 or more wickets
        }

        points += wicketPoints // Add wicket points to total

        return points
    }

    private applyOverseasMultiplier(points: number, isOverseas: boolean): number {
        return isOverseas ? points * 2 : points
    }

    private applyCaptainMultiplier(
        points: number,
        isCaptain: boolean,
        isViceCaptain: boolean
    ): number {
        if (isCaptain) return points * 4
        if (isViceCaptain) return points * 3
        return points
    }
}
