import { logger } from '../../../config'

import { db } from '../connection'
import { FIXTURE_STATUS, fixtures } from '../schema'

const fixtureDetails = [
    {
        id: 'RR_v_GT_May09',
        matchId: 'c3b8bcdc-',
        teamA: 'RR',
        teamB: 'GT',
        startTime: new Date('2026-05-09 09:00:00'),
        isProcessed: false,
        matchNumber: '43',
        venueId: 'Sawai Mansingh Stadium',
        matchResult: null,
        matchStatus: FIXTURE_STATUS.SCHEDULED,
        lineupLockAt: new Date('2026-05-09 15:00:00')
    }
]

export async function seedFixtures() {
    try {
        logger.info('🌱 Seeding fixtures...')
        logger.info(`Inserting ${fixtureDetails.length} fixtures...`)
        await db.insert(fixtures).values(fixtureDetails)
        logger.info('Seeding fixtures completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding fixtures: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
