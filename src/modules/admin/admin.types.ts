// types.ts

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
