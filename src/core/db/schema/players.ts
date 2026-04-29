import { uuid, pgTable, real, text, boolean, pgEnum } from 'drizzle-orm/pg-core'

// Define player roles as a TypeScript tuple for type safety
export const playerRoles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'] as const

// Create a PostgreSQL enum type for player roles
export const playerRoleEnum = pgEnum('player_role', playerRoles)

// Define the ipl_players table schema
export const teams = ['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'DC', 'PBKS', 'RR', 'GT', 'LSG'] as const

// Create a PostgreSQL enum type for teams
export const teamEnum = pgEnum('team', teams)

// Define the ipl_players table schema
export const players = pgTable('ipl_players', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    iplTeam: teamEnum('ipl_team').notNull(),
    role: playerRoleEnum('role').notNull(),
    profileImageUrl: text('profile_image_url').notNull(),
    isOverseas: boolean('is_overseas').default(false).notNull(),
    cost: real('cost').notNull(), // e.g., 92
    cricbuzzPlayerId: text('cricbuzz_player_id') // For RapidAPI matching
})
