// types.ts

import { fixtures } from '@/core/db/schema/fixtures'
import { matches } from '@/core/db/schema/matches'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export interface PlayerStats {
    runs: number
    fours: number
    sixes: number
    wickets: number
    catches: number
    runouts: number
}

export interface PlayerPerformance {
    playerId: string
    name: string // Used only for UI rendering, not sent to DB
    stats: PlayerStats
    isCaptain: boolean
    isViceCaptain: boolean
    isOverseas: boolean
}

export interface CalculateFantasyPointsPayload {
    fixtureId: string
    playerPerformances: {
        playerId: string
        stats: PlayerStats
        isOverseas: boolean
    }[]
    matchResult: string
}

export type CreateMatch = InferInsertModel<typeof matches>
export type Match = InferSelectModel<typeof matches>

export type CreateFixture = InferInsertModel<typeof fixtures>
export type Fixture = InferSelectModel<typeof fixtures>
