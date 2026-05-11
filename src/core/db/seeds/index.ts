import { logger } from '../../../config'
// import { seedMatches } from './matches'
// import { seedFixtures } from './fixtures'
// import { seedPlayers } from './players'
// import { seedUsers } from './users'
import { seedFixtureLineupPlayers } from './fixture_lineup_players'
// import { seedFixtureLineups } from './fixture_lineups'
// import { seedFranchise } from './franchise'
// import { seedRosterCycle } from './roster-cycle'
// import { seedRosterPlayer } from './roster-player'
// import { seedRuleset } from './ruleset'

async function main() {
    logger.info('Starting database seeding...')

    try {
        // await seedMatches()
        // await seedFixtures()
        // await seedPlayers()
        // await seedUsers()
        // await seedFranchise()
        // await seedRosterCycle()
        // await seedRosterPlayer()
        // await seedFixtureLineups()
        await seedFixtureLineupPlayers()
        // await seedRuleset()
        logger.info('Database seeding completed successfully.')
    } catch (error) {
        logger.error(`Seeding failed due to error: ${(error as Error).message}`)
    } finally {
        process.exit(0)
    }
}

// Only run the seeding script if this file is executed directly
void main()
