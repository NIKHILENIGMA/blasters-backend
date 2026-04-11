// import { InferInsertModel } from 'drizzle-orm'
import { logger } from '@/config'

// import { users } from '../schema'
// import { db } from '../connection'

export async function seedUsers() {
    try {
        logger.info('Seeding users...')
        // await db.insert(users).values(injectUsers)
        // logger.info(`Inserted ${injectUsers.length} users`)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate async operation
        logger.info('Seeding users completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding users: ${error instanceof Error ? error.message : String(error)}`
        )
        throw error
    }
}
