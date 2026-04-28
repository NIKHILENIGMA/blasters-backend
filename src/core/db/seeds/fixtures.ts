import { logger } from '@/config'

import { db } from '../connection'
import { fixtures } from '../schema'
import { fixtureDetails } from '../mock/fixtures'

export async function seedFixtures() {
    try {
        logger.info('🌱 Seeding fixtures...')
        logger.info(`Inserting ${fixtureDetails.length} fixtures...`)
        await db.insert(fixtures).values(fixtureDetails)
        logger.info('Seeding fixtures completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding fixtures: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
