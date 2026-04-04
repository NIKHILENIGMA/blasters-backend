import { index, integer, pgEnum, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'

// Define user roles as a TypeScript tuple for type safety
const userRoles = ['PLAYER', 'ADMIN'] as const

// Create a PostgreSQL enum type for user roles
export const roleEnum = pgEnum('user_role', userRoles)

// Define the users table schema
export const users = pgTable(
    'users',
    {
        id: text('id').primaryKey(), // Using Clerk's user ID here
        role: roleEnum('role').default('PLAYER').notNull(),
        username: text('username').notNull(),
        firstName: text('first_name').notNull(),
        lastName: text('last_name').notNull(),
        email: text('email').notNull(),
        profileImage: text('profile_image'),
        availablePoints: real('available_points').default(900.0).notNull(),
        totalScore: real('total_score').default(0.0).notNull(),
        matchesPlayed: integer('matches_played').default(0).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    (table) => [
        {
            scoreIdx: index('score_idx').on(table.totalScore)
        }
    ]
)
