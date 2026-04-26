import { logger } from '@/config'

import { db } from '../connection'
import { matches } from '../schema/matches'
import { iplSessions } from '../mock/matches'

export async function seedMatches() {
    logger.info('🌱 Seeding matches...')

    try {
        logger.info(`Inserting ${iplSessions.length} sessions...`)
        await db.insert(matches).values(iplSessions)
        // await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate async operation
        logger.info('Seeding matches completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding matches: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
