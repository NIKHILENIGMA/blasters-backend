import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { uuid, boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Define the matches table schema
export const matches = pgTable('matches', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(), // e.g., "Session 1: Mon-Fri"
    isLocked: boolean('is_locked').default(true).notNull(),
    buyWindowOpenAt: timestamp('buy_window_open_at'),
    buyWindowCloseAt: timestamp('buy_window_close_at'),
    squadLockAt: timestamp('squad_lock_at'),
    startTime: timestamp('start_time').notNull(), // Start time of the session
    endTime: timestamp('end_time').notNull(), // End time of the session
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export type MatchRecord = InferSelectModel<typeof matches>
export type CreateMatchInput = InferInsertModel<typeof matches>
