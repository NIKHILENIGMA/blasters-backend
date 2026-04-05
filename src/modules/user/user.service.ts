import { users } from '@/core'
import { DatabaseConnection } from '@/core/db/service/database.service'
import { NotFoundError } from '@/util'
import { eq, sql } from 'drizzle-orm'
import { LeaderBoardRanking } from './user.types'

export interface IUserService {
    getUserStats(userId: string): Promise<{
        totalScore: number
        matchPlayed: number
        availablePoints: number
        rank: number
    }>
    getLeaderboard(): Promise<LeaderBoardRanking[]>
    getTopScorers(limit?: number): Promise<LeaderBoardRanking[]>
    updateUsername(userId: string, newUsername: string): Promise<void>
}

export class UserService implements IUserService {
    constructor(private readonly db: DatabaseConnection) {}

    async getUserStats(userId: string): Promise<{
        totalScore: number
        matchPlayed: number
        availablePoints: number
        rank: number
    }> {
        const result = await this.db.execute(sql`
        SELECT
            u.total_score        AS "totalScore",
            u.matches_played     AS "matchPlayed",
            u.available_points   AS "availablePoints",
            RANK() OVER (ORDER BY total_score DESC)::int AS rank
        FROM users u
        WHERE u.id = ${userId}
    `)

        if (!result.rows[0]) {
            throw new NotFoundError('User not found')
        }

        const row = result.rows[0] as {
            totalScore: number
            matchPlayed: number
            availablePoints: number
            rank: number
        }

        return {
            totalScore: row.totalScore,
            matchPlayed: row.matchPlayed,
            availablePoints: row.availablePoints,
            rank: row.rank
        }
    }

    async getTopScorers(limit: number = 3): Promise<LeaderBoardRanking[]> {
        const result = await this.db.execute(sql`
            SELECT
                first_name   AS "firstName",
                last_name    AS "lastName",
                username,
                total_score  AS "totalScore",
                profile_image AS "profileImage",
                RANK() OVER (ORDER BY total_score DESC, created_at ASC)::int AS rank
            FROM users
            ORDER BY total_score DESC
            LIMIT ${limit}
        `)

        const leaderboard = result.rows.map((row) => ({
            firstName: row.firstName,
            lastName: row.lastName,
            username: row.username,
            totalScore: row.totalScore,
            rank: row.rank,
            profileImage: row.profileImage
        })) as LeaderBoardRanking[]
        return leaderboard
    }

    async getLeaderboard(): Promise<LeaderBoardRanking[]> {
        const result = await this.db.execute(sql`
            SELECT
                first_name   AS "firstName",
                last_name    AS "lastName",
                username,
                profile_image AS "profileImage",
                total_score  AS "totalScore",
                RANK() OVER (ORDER BY total_score DESC, created_at ASC)::int AS rank 
            FROM users
            ORDER BY total_score DESC
            LIMIT 10
        `) // The above query ranks users by total_score in descending order. In case of ties, it uses created_at to ensure consistent ranking.

        const leaderboard = result.rows.map((row) => ({
            firstName: row.firstName,
            lastName: row.lastName,
            username: row.username,
            totalScore: row.totalScore,
            rank: row.rank,
            profileImage: row.profileImage
        })) as LeaderBoardRanking[]

        return leaderboard
    }

    async updateUsername(userId: string, newUsername: string): Promise<void> {
        const [user] = await this.db.select().from(users).where(eq(users.id, userId))

        if (!user) {
            throw new NotFoundError('User not found')
        }

        await this.db.update(users).set({ username: newUsername }).where(eq(users.id, userId))
    }
}
