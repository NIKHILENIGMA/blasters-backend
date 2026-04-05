import { players } from '@/core'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type Player = InferSelectModel<typeof players>
export type CreatePlayer = InferInsertModel<typeof players>
