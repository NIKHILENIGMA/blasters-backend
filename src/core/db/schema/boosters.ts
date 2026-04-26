import { boolean, jsonb, pgEnum, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { fixtures } from './fixtures'
import { players } from './players'
import { rosterCycles } from './roster-cycles'

export const boosterScopes = ['global', 'cycle', 'fixture'] as const
export const boosterScopeEnum = pgEnum('booster_scope', boosterScopes)

export const boosters = pgTable('boosters', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    code: text('code').notNull(),
    description: text('description').notNull(),
    scope: boosterScopeEnum('scope').default('fixture').notNull(),
    config: jsonb('config').$type<Record<string, unknown>>().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const fixtureBoosterAwards = pgTable('fixture_booster_awards', {
    id: uuid('id').defaultRandom().primaryKey(),
    fixtureId: text('fixture_id')
        .references(() => fixtures.id, { onDelete: 'cascade' })
        .notNull(),
    boosterId: uuid('booster_id')
        .references(() => boosters.id, { onDelete: 'cascade' })
        .notNull(),
    rosterCycleId: uuid('roster_cycle_id')
        .references(() => rosterCycles.id, { onDelete: 'cascade' })
        .notNull(),
    playerId: uuid('player_id').references(() => players.id, { onDelete: 'set null' }),
    pointsAwarded: real('points_awarded').notNull(),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})
