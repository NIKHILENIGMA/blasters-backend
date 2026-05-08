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
        overseas?: number
    }
    scoring?: {
        batsman?: {
            runs?: number
            ballsFaced?: number
            fours?: number
            sixes?: number
            strikeRate?: Array<{ min: number; points: number }>
            mileStones?: Array<{ runs: number; points: number }>
            duckPenalty?: {
                points: number
                applicableRoles: 'Batsman'
            }
        }
        bowler?: {
            wickets?: number
            dotBall?: number
            overBonus?: Array<{ minOvers: number; points: number }>
            economyRate?: Array<{ max: number; points: number }>
            mileStones?: Array<{ wickets: number; points: number }>
            maiden?: number
            lbwBowled?: number
        }
        fielder?: {
            catch?: number
            runOut?: number
            stumping?: number
            numberOfCatchesForBonus?: Array<{ minCatches: number; points: number }>
            numberOfRunOutsForBonus?: Array<{ minRunOuts: number; points: number }>
            stumpingBonus?: Array<{ minStumpings: number; points: number }>
        }
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
