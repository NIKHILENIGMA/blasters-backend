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
    rosterCycle: {
        id: string
        createdAt: Date
        updatedAt: Date
        matchId: string
        franchiseId: string
        budgetTotal: number
        budgetUsed: number
        walletResetAmount: number
    }
    squadPlayers: RosterCyclePlayerRecord[]
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
        iplTeam: 'CSK' | 'MI' | 'RCB' | 'KKR' | 'SRH' | 'DC' | 'PBKS' | 'RR' | 'GT' | 'LSG'
        isOverseas: boolean
        cost: number
        profileImageUrl: string
        selectionType: 'PLAYING' | 'SUBSTITUTE'
    }[]
}
