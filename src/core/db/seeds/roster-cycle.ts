import { InferInsertModel } from 'drizzle-orm/table'
import { logger } from '../../../config'
import { db } from '../connection'
import { rosterCycles } from '../schema'

type CreateRosterCycle = InferInsertModel<typeof rosterCycles>

const rosterCycleData: CreateRosterCycle[] = []

export async function seedRosterCycle() {
    try {
        logger.info('Seeding roster cycle...')
        await db.insert(rosterCycles).values(rosterCycleData)
        logger.info(`Inserted ${rosterCycleData.length} roster cycles`)
        logger.info('Seeding roster cycle completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding roster cycle: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
    }
}
