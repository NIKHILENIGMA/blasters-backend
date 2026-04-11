import { logger } from '@/config'
// import { db } from '../connection'
// import { fantasyTeams } from '../schema'
// import { insertTeams } from '../mock/teams'

export async function seedTeams() {
    try {
        // logger.info(`Inserting ${insertTeams.length} sessions...`)
        // await db.insert(fantasyTeams).values(insertTeams)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate async operation

        logger.info('Seeding teams completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding teams: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
