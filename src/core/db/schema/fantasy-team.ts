import { uuid, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { matches } from './matches'

export const fantasyTeams = pgTable('fantasy_teams', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
        .references(() => users.id)
        .notNull(),
    matchId: uuid('match_id')
        .references(() => matches.id)
        .notNull(),
    teamName: text('team_name').unique(), // Name of the fantasy team
    players: text('players').array().notNull(), // Array of IplPlayer IDs
    captainId: uuid('captain_id').notNull(),
    viceCaptainId: uuid('vice_captain_id').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})
