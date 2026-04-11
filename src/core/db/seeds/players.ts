import { db } from '../connection'
import { ALL_PLAYERS } from '../mock/players'
import { players } from '../schema'
import { logger } from '@/config'

export async function seedPlayers() {
    try {
        logger.info('Seeding players...')

        await db.insert(players).values(ALL_PLAYERS)
        logger.info(`Inserted ${ALL_PLAYERS.length} players`)
        logger.info('Seeding players completed successfully!')
    } catch (error) {
        logger.error(`Error seeding players: ${(error as Error).message}`)
        throw error
    }
}
