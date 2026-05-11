import { InferInsertModel } from 'drizzle-orm'
import { logger } from '../../../config'
import { db } from '../connection'
import { rosterCyclePlayers } from '../schema'

type CreateRosterPlayer = InferInsertModel<typeof rosterCyclePlayers>

const rosterPlayerData: CreateRosterPlayer[] = []

export async function seedRosterPlayer() {
    try {
        logger.info('Seeding roster player...')
        await db.insert(rosterCyclePlayers).values(rosterPlayerData)
        logger.info(`Inserted ${rosterPlayerData.length} roster players`)
        logger.info('Seeding roster player completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding roster player: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
    }
}
