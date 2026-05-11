import { InferInsertModel } from 'drizzle-orm'
import { logger } from '../../../config'
import { db } from '../connection'
import { fantasyFranchises } from '../schema'

type CreateFranchise = InferInsertModel<typeof fantasyFranchises>

const franchiseData: CreateFranchise[] = []

export async function seedFranchise() {
    try {
        logger.info('Seeding franchise...')
        await db.insert(fantasyFranchises).values(franchiseData)
        logger.info(`Inserted ${franchiseData.length} franchises`)
        logger.info('Seeding franchise completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding franchise: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
    }
}
