export const EMPTY_BREAKDOWN = (fantasyRole: string) => ({
    batting: {
        rawRunsPoints: 0,
        foursPoints: 0,
        sixesPoints: 0,
        milestonePoints: 0,
        strikeRatePoints: 0,
        duckPenaltyPoints: 0,
        total: 0
    },
    bowling: {
        wicketsPoints: 0,
        dotBallPoints: 0,
        milestonePoints: 0,
        overBonusPoints: 0,
        economyPoints: 0,
        maidenPoints: 0,
        lbwBowledPoints: 0,
        total: 0
    },
    fielding: {
        catchesPoints: 0,
        runOutPoints: 0,
        stumpingsPoints: 0,
        catchBonusPoints: 0,
        runOutBonusPoints: 0,
        stumpingBonusPoints: 0,
        total: 0
    },
    role: {
        fantasyRole,
        basePoints: 0,
        roleMultiplier: 1,
        overseasMultiplier: 1,
        roleBonusPoints: 0,
        overseasBonusPoints: 0,
        finalPoints: 0
    },
    totalBasePoints: 0,
    finalPoints: 0
})

export const json = {
    role: {
        basePoints: 79,
        fantasyRole: 'ViceCaptain',
        finalPoints: 237,
        roleMultiplier: 3,
        roleBonusPoints: 158,
        overseasMultiplier: 1,
        overseasBonusPoints: 0
    },
    batting: {
        total: 54,
        foursPoints: 5,
        sixesPoints: 8,
        rawRunsPoints: 20,
        milestonePoints: 20,
        strikeRatePoints: 1,
        duckPenaltyPoints: 0
    },
    bowling: {
        total: 0,
        maidenPoints: 0,
        dotBallPoints: 0,
        economyPoints: 0,
        wicketsPoints: 0,
        lbwBowledPoints: 0,
        milestonePoints: 0,
        overBonusPoints: 0
    },
    fielding: {
        total: 25,
        runOutPoints: 0,
        catchesPoints: 25,
        stumpingsPoints: 0,
        catchBonusPoints: 0,
        runOutBonusPoints: 0,
        stumpingBonusPoints: 0
    },
    finalPoints: 237,
    totalBasePoints: 79
}
