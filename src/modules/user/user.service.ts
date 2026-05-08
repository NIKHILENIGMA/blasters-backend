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
            WITH active_cycle_wallet AS (
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
                    u.total_score::float8 AS total_score,
                    u.matches_played::int AS matches_played,
                    COALESCE(acw.available_points, u.available_points)::float8 AS available_points,
                    RANK() OVER (ORDER BY u.total_score DESC, u.created_at ASC)::int AS rank
                FROM users u
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
            WITH franchise_profile AS (
                SELECT
                    ff.user_id,
                    MAX(ff.team_name) AS team_name,
                    MAX(ff.team_logo) AS team_logo
                FROM fantasy_franchises ff
                GROUP BY ff.user_id
            )
            SELECT
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                u.username AS username,
                u.total_score::float8 AS "totalScore",
                u.profile_image AS "profileImage",
                fp.team_name AS "teamName",
                fp.team_logo AS "teamLogo",
                RANK() OVER (ORDER BY u.total_score DESC, u.created_at ASC)::int AS rank
            FROM users u
            LEFT JOIN franchise_profile fp ON fp.user_id = u.id
            ORDER BY u.total_score DESC, u.created_at ASC
            LIMIT ${limit}
        `)

        const leaderboard = result.rows.map((row) => ({
            firstName: row.firstName,
            lastName: row.lastName,
            username: row.username,
            totalScore: row.totalScore,
            rank: row.rank,
            profileImage: row.profileImage,
            teamName: row.teamName,
            teamLogo: row.teamLogo
        })) as LeaderBoardRanking[]
        return leaderboard
    }

    async getLeaderboard(): Promise<LeaderBoardRanking[]> {
        const result = await this.db.execute(sql`
            WITH franchise_profile AS (
                SELECT
                    ff.user_id,
                    MAX(ff.team_name) AS team_name,
                    MAX(ff.team_logo) AS team_logo
                FROM fantasy_franchises ff
                GROUP BY ff.user_id
            )
            SELECT
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                u.username AS username,
                u.profile_image AS "profileImage",
                u.total_score::float8 AS "totalScore",
                fp.team_name AS "teamName",
                fp.team_logo AS "teamLogo",
                RANK() OVER (ORDER BY u.total_score DESC, u.created_at ASC)::int AS rank
            FROM users u
            LEFT JOIN franchise_profile fp ON fp.user_id = u.id
            ORDER BY u.total_score DESC, u.created_at ASC
            LIMIT 40
        `)

        const leaderboard = result.rows.map((row) => ({
            firstName: row.firstName,
            lastName: row.lastName,
            username: row.username,
            totalScore: row.totalScore,
            rank: row.rank,
            profileImage: row.profileImage,
            teamName: row.teamName,
            teamLogo: row.teamLogo
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
