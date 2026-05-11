import { logger } from '../../../config'

import { db } from '../connection'
import { matches } from '../schema/matches'

const matchesData = [
    {
        id: 'c3b8bcdc-',
        title: '6 Weekend 9 May to 10 May',
        isLocked: true,
        startTime: new Date('2026-05-08 18:30:00'),
        endTime: new Date('2026-05-10 18:29:00'),
        createdAt: new Date('2026-05-08 22:33:00.461356'),
        updatedAt: new Date('2026-05-10 06:17:22.929'),
        buyWindowOpenAt: new Date('2026-05-08 18:30:00'),
        buyWindowCloseAt: new Date('2026-05-09 14:00:00'),
        squadLockAt: new Date('2026-05-09 14:00:00')
    }
]

export async function seedMatches() {
    logger.info('🌱 Seeding matches...')

    try {
        logger.info(`Inserting ${matchesData.length} sessions...`)
        await db.insert(matches).values(matchesData)

        logger.info('Seeding matches completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding matches: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
