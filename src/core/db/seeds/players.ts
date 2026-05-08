import { logger } from '@/config'

// import { db } from '../connection'
// import { players } from '../schema'
import { ALL_PLAYERS } from '../mock/players'

export async function seedPlayers() {
    try {
        logger.info('Seeding players...')

        // await db.insert(players).values(ALL_PLAYERS)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate async operation
        logger.info(`Inserted ${ALL_PLAYERS.length} players`)
        logger.info('Seeding players completed successfully!')
    } catch (error) {
        logger.error(`Error seeding players: ${(error as Error).message}`)
        throw error
    }
}
