import { uuid, pgTable, real, integer, text, jsonb } from 'drizzle-orm/pg-core'

import { players } from './players'
import { fixtures } from './fixtures'

export const matchStats = pgTable('match_stats', {
    id: uuid('id').defaultRandom().primaryKey(),
    fixtureId: text('fixture_id')
        .references(() => fixtures.id)
        .notNull(),
    playerId: uuid('player_id')
        .references(() => players.id)
        .notNull(),
    // Raw performance stats
    runs: integer('runs').default(0).notNull(),
    fours: integer('fours').default(0).notNull(),
    sixes: integer('sixes').default(0).notNull(),
    wickets: integer('wickets').default(0).notNull(),
    catches: integer('catches').default(0).notNull(),
    runouts: integer('runouts').default(0).notNull(),
    // Legacy column kept for backward compatibility in production
    finalPoints: real('final_points').default(0).notNull(),
    // Base points before role multipliers
    basePoints: real('base_points').default(0).notNull(),
    // Complete scoring breakdown
    breakdown: jsonb('breakdown').$type<{
        batting: Record<string, number>
        bowling: Record<string, number>
        fielding: Record<string, number>
        totalBasePoints: number
    }>()
})
