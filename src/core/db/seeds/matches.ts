import { logger } from '@/config'
import { CreateMatch } from '@/modules/team/team.types'

import { db } from '../connection'
import { matches } from '../schema/matches'

const iplSessions: CreateMatch[] = [
    {
        title: '1 Weekend - 4 april to 5 april',
        isLocked: false,
        startTime: new Date('2026-04-04 00:00:00'),
        endTime: new Date('2026-04-05 23:59:59')
    },
    {
        title: '2 Week - 6 april to 10 april',
        isLocked: true,
        startTime: new Date('2026-04-06 00:00:00'),
        endTime: new Date('2026-04-10 23:59:59')
    },
    {
        title: '2 Weekend - 11 April to 12 April',
        isLocked: true,
        startTime: new Date('2026-04-11 00:00:00'),
        endTime: new Date('2026-04-12 23:59:59')
    },
    {
        title: '3 Week - 13 April to 17 April',
        isLocked: true,
        startTime: new Date('2026-04-13 00:00:00'),
        endTime: new Date('2026-04-17 23:59:59')
    },
    {
        title: '3 Weekend - 18 April to 19 April',
        isLocked: true,
        startTime: new Date('2026-04-18 00:00:00'),
        endTime: new Date('2026-04-19 23:59:59')
    },
    {
        title: '4 Week - 20 April to 24 April',
        isLocked: true,
        startTime: new Date('2026-04-20 00:00:00'),
        endTime: new Date('2026-04-24 23:59:59')
    },
    {
        title: '4 Weekend - 25 April to 26 April',
        isLocked: true,
        startTime: new Date('2026-04-25 00:00:00'),
        endTime: new Date('2026-04-26 23:59:59')
    },
    {
        title: '5 Week - 27 April to 1 May',
        isLocked: true,
        startTime: new Date('2026-04-27 00:00:00'),
        endTime: new Date('2026-05-01 23:59:59')
    },
    {
        title: '5 Weekend - 2 May to 3 May',
        isLocked: true,
        startTime: new Date('2026-05-02 00:00:00'),
        endTime: new Date('2026-05-03 23:59:59')
    }
]

export async function seedMatches() {
    logger.info('🌱 Starting database seed...')

    try {
        logger.info(`Inserting ${iplSessions.length} sessions...`)
        await db.insert(matches).values(iplSessions)

        logger.info('Seeding matches completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding matches: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
