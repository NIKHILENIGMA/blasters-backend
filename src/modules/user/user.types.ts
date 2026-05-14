export interface LeaderBoardRanking {
    userId: string
    firstName: string
    lastName: string
    username: string
    totalScore: number
    rank: number
    profileImage?: string | null
    teamName?: string | null
    teamLogo?: string | null
}

export interface UserProfile {
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
        username: string
        profileImage: string | null
    }
    franchise: {
        id: string
        teamName: string
        teamLogo: string
    } | null
}
