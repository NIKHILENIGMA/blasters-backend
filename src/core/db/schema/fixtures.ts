import { pgTable, text, timestamp, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core'
import { matches } from './matches'

export const FIXTURE_STATUS = {
    SCHEDULED: 'scheduled',
    LIVE: 'live',
    COMPLETED: 'completed'
} as const

export const MATCH_STATUS = pgEnum('match_status', [
    FIXTURE_STATUS.SCHEDULED,
    FIXTURE_STATUS.LIVE,
    FIXTURE_STATUS.COMPLETED
])

export const fixtures = pgTable('fixtures', {
    id: text('id').primaryKey(), // e.g., 'MI_v_RCB_April01'
    matchId: uuid('match_id')
        .references(() => matches.id, {
            onDelete: 'cascade'
        })
        .notNull(), // Foreign key to matches table
    teamA: text('team_a').notNull(),
    teamB: text('team_b').notNull(),
    startTime: timestamp('start_time').notNull(), // Exact time of the 1st ball
    isProcessed: boolean('is_processed').default(false).notNull(),
    matchNumber: text('match_number'), // e.g., 'Match 1', 'Match 2', etc.
    venueId: text('venue_id'), // e.g., 'Wankhede Stadium'
    matchResult: text('match_result'), // e.g., 'Team A won by 5 wickets'
    matchStatus: MATCH_STATUS('match_status') // e.g., 'scheduled', 'live', 'completed'
})
