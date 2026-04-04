import { uuid, pgTable, real, integer, text } from 'drizzle-orm/pg-core'

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
    runs: integer('runs').default(0).notNull(),
    fours: integer('fours').default(0).notNull(),
    sixes: integer('sixes').default(0).notNull(),
    wickets: integer('wickets').default(0).notNull(),
    catches: integer('catches').default(0).notNull(),
    runouts: integer('runouts').default(0).notNull(),
    finalPoints: real('final_points').default(0.0).notNull()
})
