import { logger } from '@/config'
import { seedMatches } from './matches'
import { seedFixtures } from './fixtures'
// import { seedPlayers } from './players'
import { seedRuleset } from './ruleset'

async function main() {
    logger.info('Starting database seeding...')

    try {
        // await seedPlayers()
        await seedMatches()
        await seedFixtures()
        await seedRuleset()
        logger.info('Database seeding completed successfully.')
    } catch (error) {
        logger.error(`Seeding failed due to error: ${(error as Error).message}`)
    } finally {
        process.exit(0)
    }
}

// Only run the seeding script if this file is executed directly
void main()
