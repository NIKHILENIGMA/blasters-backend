import { InferInsertModel } from 'drizzle-orm'
import { logger } from '../../../config'
import { db } from '../connection'
import { fixtureLineupPlayers } from '../schema'

type CreateFixtureLineupPlayer = InferInsertModel<typeof fixtureLineupPlayers>

const fixtureLineupData: CreateFixtureLineupPlayer[] = []

export async function seedFixtureLineupPlayers() {
    try {
        logger.info('Seeding fixture lineup players ...')
        await db.insert(fixtureLineupPlayers).values(fixtureLineupData)
        logger.info(`Inserted ${fixtureLineupData.length} fixture lineup players`)
        logger.info('Seeding fixture lineup players completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding fixture lineup players: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
    }
}
