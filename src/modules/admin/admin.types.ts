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

export type AdminFixtureTeamsResponse = {
    fixture: Fixture
    entries: Array<{
        rosterCycleId: string
        franchise: {
            id: string
            userId: string
            teamName: string
            teamLogo: string
        }
        user: {
            id: string
            username: string
            firstName: string
            lastName: string
            email: string
            profileImage: string | null
        }
        lineup: {
            id: string
            createdAt: Date
            updatedAt: Date
            lineupLockAt: Date | null
            rosterCycleId: string
            fixtureId: string
            rulesetId: string | null
            status: 'draft' | 'locked' | 'scored'
            captainId: string
            viceCaptainId: string
            impactPlayerId: string
            submittedAt: Date
            lockedAt: Date | null
            autoAppliedFromLineupId: string | null
        } | null
        lineupPlayers: Array<{
            id: string
            name: string
            role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper'
            iplTeam: string
            isOverseas: boolean
            cost: number
            profileImageUrl: string
            selectionType: 'PLAYING' | 'SUBSTITUTE'
            runs?: number | null
            fours?: number | null
            sixes?: number | null
            wickets?: number | null
            catches?: number | null
            runouts?: number | null
            basePoints?: number | null
            multiplier?: number | null
            bonusPoints?: number | null
            finalPoints?: number | null
            breakdown?: Record<string, unknown> | null
        }>
        matchPoints: {
            id: string
            totalPoints: number
            rankSnapshot: number | null
        } | null
    }>
}
