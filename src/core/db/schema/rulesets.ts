import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const rulesetScopes = ['global', 'cycle', 'fixture'] as const
export const rulesetScopeEnum = pgEnum('ruleset_scope', rulesetScopes)

export type RulesetConfig = {
    totalPlayers: number
    roles: {
        batsman: { min: number }
        bowler: { min: number }
        wicketKeeper: { min: number }
        allRounder: { min: number }
    }
    overseas: { max: number }
    multipliers: {
        captain: number
        viceCaptain: number
        impactPlayer: number
    }
}

export const rulesets = pgTable('rulesets', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    scope: rulesetScopeEnum('scope').default('global').notNull(),
    config: jsonb('config').$type<RulesetConfig>().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export type RuleSet = InferSelectModel<typeof rulesets>
export type CreateRuleSet = InferInsertModel<typeof rulesets>
