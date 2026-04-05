import { fixtures } from '@/core'
import { matches } from '@/core/db/schema/matches'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type CreateMatch = InferInsertModel<typeof matches>
export type Match = InferSelectModel<typeof matches>

export type CreateFixture = InferInsertModel<typeof fixtures>
export type Fixture = InferSelectModel<typeof fixtures>
