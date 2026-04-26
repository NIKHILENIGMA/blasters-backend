import { pgTable, real, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

import { fantasyFranchises } from './fantasy-franchises'
import { matches } from './matches'
import { players } from './players'
import { InferSelectModel } from 'drizzle-orm/table'
import { InferInsertModel } from 'drizzle-orm'

export const rosterCycles = pgTable(
    'roster_cycles',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        franchiseId: uuid('franchise_id')
            .references(() => fantasyFranchises.id, { onDelete: 'cascade' })
            .notNull(),
        matchId: uuid('match_id')
            .references(() => matches.id, { onDelete: 'cascade' })
            .notNull(),
        budgetTotal: real('budget_total').default(2000).notNull(),
        budgetUsed: real('budget_used').default(0).notNull(),
        walletResetAmount: real('wallet_reset_amount').default(2000).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    (table) => [
        uniqueIndex('roster_cycles_franchise_match_idx').on(table.franchiseId, table.matchId)
    ]
)

export const rosterCyclePlayers = pgTable(
    'roster_cycle_players',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        rosterCycleId: uuid('roster_cycle_id')
            .references(() => rosterCycles.id, { onDelete: 'cascade' })
            .notNull(),
        playerId: uuid('player_id')
            .references(() => players.id, { onDelete: 'cascade' })
            .notNull(),
        purchasePrice: real('purchase_price').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull()
    },
    (table) => [
        uniqueIndex('roster_cycle_players_cycle_player_idx').on(table.rosterCycleId, table.playerId)
    ]
)

export type RosterCycleRecord = InferSelectModel<typeof rosterCycles>
export type CreateRosterCycleInput = InferInsertModel<typeof rosterCycles>

export type RosterCyclePlayerRecord = InferSelectModel<typeof rosterCyclePlayers>
export type CreateRosterCyclePlayerInput = InferInsertModel<typeof rosterCyclePlayers>
