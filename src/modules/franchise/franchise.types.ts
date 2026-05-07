import { FantasyFranchiseRecord, MatchRecord, players } from '@/core'

type RosterCyclePlayerRecord = Pick<
    typeof players.$inferSelect,
    'id' | 'name' | 'role' | 'iplTeam' | 'isOverseas' | 'cost' | 'profileImageUrl'
> & {
    purchasePrice: number
}

export interface GetFranchiseOverviewResponse {
    franchise: FantasyFranchiseRecord | null
    activeCycle: MatchRecord | null
    rosterCycle: RosterCyclePlayerRecord[] | null
}

export interface GetCurrentRosterCycleResponse {
    cycle: {
        id: string
        createdAt: Date
        updatedAt: Date
        franchiseId: string
        matchId: string
        budgetTotal: number
        budgetUsed: number
        walletResetAmount: number
    } | null
    players: RosterCyclePlayerRecord[] | null
    match?: {
        id: string
        title: string
        isLocked: boolean
        buyWindowOpenAt: Date | null
        buyWindowCloseAt: Date | null
        squadLockAt: Date | null
        startTime: Date
        endTime: Date
        createdAt: Date
        updatedAt: Date
    }
}

export interface GetFixtureLineupResponse {
    fixture: {
        id: string
        startTime: Date
        matchId: string
        teamA: string
        teamB: string
        lineupLockAt: Date | null
        isProcessed: boolean
        matchNumber: string | null
        venueId: string | null
        matchResult: string | null
        matchStatus: 'scheduled' | 'live' | 'completed' | null
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
    lineupPlayers: {
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
        // Point details
        basePoints?: number | null
        multiplier?: number | null
        bonusPoints?: number | null
        finalPoints?: number | null
        breakdown?: Record<string, unknown> | null
    }[]
    matchPoints: {
        id: string
        totalPoints: number
        rankSnapshot: number | null
    } | null
}

export interface GetUpcomingFixturesResponse {
    fixtures: Array<{
        id: string
        startTime: Date
        matchId: string
        teamA: string
        teamB: string
        lineupLockAt: Date | null
        isProcessed: boolean
        matchNumber: string | null
        venueId: string | null
        matchResult: string | null
        matchStatus: 'scheduled' | 'live' | 'completed' | null
    }>
}
