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
            WITH user_ledger AS (
                SELECT
                    u.id AS user_id,
                    COALESCE(SUM(fup.total_points), 0)::float8 AS total_score,
                    COUNT(fup.id)::int AS matches_played
                FROM users u
                LEFT JOIN fantasy_franchises ff ON ff.user_id = u.id
                LEFT JOIN roster_cycles rc ON rc.franchise_id = ff.id
                LEFT JOIN fixture_user_points fup ON fup.roster_cycle_id = rc.id
                GROUP BY u.id
            ),
            active_cycle_wallet AS (
                SELECT
                    ff.user_id,
                    (rc.budget_total - rc.budget_used)::float8 AS available_points
                FROM fantasy_franchises ff
                INNER JOIN roster_cycles rc ON rc.franchise_id = ff.id
                INNER JOIN matches m ON m.id = rc.match_id
                WHERE now() BETWEEN m.start_time AND m.end_time
                ORDER BY m.start_time DESC
            ),
            ranked_users AS (
                SELECT
                    u.id AS user_id,
                    ul.total_score,
                    ul.matches_played,
                    COALESCE(acw.available_points, u.available_points)::float8 AS available_points,
                    RANK() OVER (ORDER BY ul.total_score DESC, u.created_at ASC)::int AS rank
                FROM users u
                LEFT JOIN user_ledger ul ON ul.user_id = u.id
                LEFT JOIN active_cycle_wallet acw ON acw.user_id = u.id
            )
            SELECT
                ru.total_score AS "totalScore",
                ru.matches_played AS "matchPlayed",
                ru.available_points AS "availablePoints",
                ru.rank AS rank
            FROM ranked_users ru
            WHERE ru.user_id = ${userId}
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
            WITH user_ledger AS (
                SELECT
                    u.id AS user_id,
                    COALESCE(SUM(fup.total_points), 0)::float8 AS total_score
                FROM users u
                LEFT JOIN fantasy_franchises ff ON ff.user_id = u.id
                LEFT JOIN roster_cycles rc ON rc.franchise_id = ff.id
                LEFT JOIN fixture_user_points fup ON fup.roster_cycle_id = rc.id
                GROUP BY u.id
            )
            SELECT
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                u.username AS username,
                COALESCE(ul.total_score, 0)::float8 AS "totalScore",
                u.profile_image AS "profileImage",
                RANK() OVER (ORDER BY COALESCE(ul.total_score, 0) DESC, u.created_at ASC)::int AS rank
            FROM users u
            LEFT JOIN user_ledger ul ON ul.user_id = u.id
            ORDER BY COALESCE(ul.total_score, 0) DESC, u.created_at ASC
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
            WITH user_ledger AS (
                SELECT
                    u.id AS user_id,
                    COALESCE(SUM(fup.total_points), 0)::float8 AS total_score
                FROM users u
                LEFT JOIN fantasy_franchises ff ON ff.user_id = u.id
                LEFT JOIN roster_cycles rc ON rc.franchise_id = ff.id
                LEFT JOIN fixture_user_points fup ON fup.roster_cycle_id = rc.id
                GROUP BY u.id
            )
            SELECT
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                u.username AS username,
                u.profile_image AS "profileImage",
                COALESCE(ul.total_score, 0)::float8 AS "totalScore",
                RANK() OVER (ORDER BY COALESCE(ul.total_score, 0) DESC, u.created_at ASC)::int AS rank
            FROM users u
            LEFT JOIN user_ledger ul ON ul.user_id = u.id
            ORDER BY COALESCE(ul.total_score, 0) DESC, u.created_at ASC
            LIMIT 10
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

    async updateUsername(userId: string, newUsername: string): Promise<void> {
        const [user] = await this.db.select().from(users).where(eq(users.id, userId))

        if (!user) {
            throw new NotFoundError('User not found')
        }

        await this.db.update(users).set({ username: newUsername }).where(eq(users.id, userId))
    }
}
