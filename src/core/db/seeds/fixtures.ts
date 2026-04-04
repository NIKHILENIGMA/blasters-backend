import { logger } from '@/config'
import { CreateFixture } from '@/modules/team/team.types'
import { db } from '../connection'
import { fixtures } from '../schema'

export const fixtureDetails: CreateFixture[] = [
    {
        id: 'RR_v_GT_April04',
        startTime: new Date('2026-04-04 19:30:00'),
        matchId: '4eb36ec6-be93-4413-b0e5-43995215bf4a',
        teamA: 'RR',
        teamB: 'GT'
    },
    {
        id: 'SRH_v_LSG_April05',
        startTime: new Date('2026-04-05 15:30:00'),
        matchId: '4eb36ec6-be93-4413-b0e5-43995215bf4a',
        teamA: 'SRH',
        teamB: 'LSG'
    },
    {
        id: 'RCB_v_CSK_April05',
        startTime: new Date('2026-04-05 19:30:00'),
        matchId: '4eb36ec6-be93-4413-b0e5-43995215bf4a',
        teamA: 'RCB',
        teamB: 'CSK'
    },
    {
        id: 'KKR_v_PBKS_April06',
        startTime: new Date('2026-04-06 19:30:00'),
        matchId: '067c7714-f313-49e1-aa40-2786e9b3b400',
        teamA: 'KKR',
        teamB: 'PBKS'
    },
    {
        id: 'RR_v_MI_April07',
        startTime: new Date('2026-04-07 19:30:00'),
        matchId: '067c7714-f313-49e1-aa40-2786e9b3b400',
        teamA: 'RR',
        teamB: 'MI'
    },
    {
        id: 'DC_v_GT_April08',
        startTime: new Date('2026-04-08 19:30:00'),
        matchId: '067c7714-f313-49e1-aa40-2786e9b3b400',
        teamA: 'DC',
        teamB: 'GT'
    },
    {
        id: 'KKR_v_LSG_April09',
        startTime: new Date('2026-04-09 19:30:00'),
        matchId: '067c7714-f313-49e1-aa40-2786e9b3b400',
        teamA: 'KKR',
        teamB: 'LSG'
    },
    {
        id: 'RR_v_RCB_April10',
        startTime: new Date('2026-04-10 19:30:00'),
        matchId: '067c7714-f313-49e1-aa40-2786e9b3b400',
        teamA: 'RR',
        teamB: 'RCB'
    }
]


export async function seedFixtures() {
    logger.info('🌱 Starting database seed...')

    try {
        logger.info(`Inserting ${fixtureDetails.length} fixtures...`)
        await db.insert(fixtures).values(fixtureDetails)

        logger.info('Seeding fixtures completed successfully!')
    } catch (error) {
        logger.error(
            `Error seeding fixtures: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}