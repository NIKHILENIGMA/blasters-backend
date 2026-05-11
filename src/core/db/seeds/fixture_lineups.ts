import { InferInsertModel } from 'drizzle-orm'
import { logger } from '../../../config'
import { db } from '../connection'
import { fixtureLineups } from '../schema'

type CreateFixtureLineup = InferInsertModel<typeof fixtureLineups>

const fixtureLineupData: CreateFixtureLineup[] = []

export async function seedFixtureLineups() {
    try {
        logger.info('Seeding fixture lineups...')
        await db.insert(fixtureLineups).values(fixtureLineupData)
        logger.info(`Inserted ${fixtureLineupData.length} fixture lineups`)
        logger.info('Seeding fixture lineups completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding fixture lineups: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
    }
}
