import { pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from './users'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export const fantasyFranchises = pgTable(
    'fantasy_franchises',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        teamName: text('team_name').notNull(),
        teamLogo: text('team_logo').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    (table) => [uniqueIndex('fantasy_franchises_user_id_idx').on(table.userId)]
)

export type FantasyFranchiseRecord = InferSelectModel<typeof fantasyFranchises>
export type CreateFantasyFranchiseInput = InferInsertModel<typeof fantasyFranchises>
