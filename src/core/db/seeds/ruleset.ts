import { logger } from '@/config'
import { db } from '../connection'
import { CreateRuleSet, rulesets } from '../schema'

const defaultRulesetConfig: CreateRuleSet = {
    name: 'Default Ruleset',
    scope: 'global',
    config: {
        totalPlayers: 12,
        roles: {
            batsman: { min: 5 },
            bowler: { min: 4 },
            wicketKeeper: { min: 1 },
            allRounder: { min: 1 }
        },
        overseas: { max: 4 },
        multipliers: {
            captain: 4,
            viceCaptain: 3,
            impactPlayer: 2.5
        }
    }
}

export async function seedRuleset() {
    try {
        logger.info('🌱 Seeding ruleset...')
        await db.insert(rulesets).values(defaultRulesetConfig)
        logger.info('Seeding ruleset completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding ruleset: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
