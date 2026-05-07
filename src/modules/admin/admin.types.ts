// types.ts

import { fixtures } from '@/core/db/schema/fixtures'
import { matches } from '@/core/db/schema/matches'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import z from 'zod'
import { GetFixturesQuerySchema } from './admin.validator'

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

export type GetFixturesQuery = z.infer<typeof GetFixturesQuerySchema>

export type CreateMatch = InferInsertModel<typeof matches>
export type Match = InferSelectModel<typeof matches>

export type CreateFixture = InferInsertModel<typeof fixtures>
export type Fixture = InferSelectModel<typeof fixtures>

export type BattingBreakdown = {
    rawRunsPoints: number
    foursPoints: number
    sixesPoints: number
    milestonePoints: number
    strikeRatePoints: number
    duckPenaltyPoints: number
    total: number
}

export type BowlingBreakdown = {
    wicketsPoints: number
    dotBallPoints: number
    milestonePoints: number
    overBonusPoints: number
    economyPoints: number
    maidenPoints: number
    lbwBowledPoints: number
    total: number
}

export type FieldingBreakdown = {
    catchesPoints: number
    runOutPoints: number
    stumpingsPoints: number
    catchBonusPoints: number
    runOutBonusPoints: number
    stumpingBonusPoints: number
    total: number
}

export type RoleBreakdown = {
    fantasyRole: 'Captain' | 'ViceCaptain' | 'ImpactPlayer' | 'OverseasPlayer' | 'Normal'
    basePoints: number
    roleMultiplier: number
    overseasMultiplier: number
    roleBonusPoints: number
    overseasBonusPoints: number
    finalPoints: number
    impactQualified?: boolean
}

export type PlayerScoringBreakdown = {
    batting: BattingBreakdown
    bowling: BowlingBreakdown
    fielding: FieldingBreakdown
    role: RoleBreakdown
    totalBasePoints: number
    finalPoints: number
}
