import {
    BattingBreakdown,
    BowlingBreakdown,
    FieldingBreakdown,
    PlayerScoringBreakdown,
    RoleBreakdown
} from '../admin.types'

interface BatsmanScoringConfig {
    runs: number
    ballsFaced: number
    fours: number
    sixes: number
    strikeRate: Array<{
        min: number
        points: number
    }>
    mileStones: Array<{
        runs: number
        points: number
    }>
    duckPenalty: {
        points: number
        applicableRoles: 'Batsman'
    }
}

interface BowlingScoringConfig {
    wickets: number
    dotBall: number
    overBonus: Array<{
        minOvers: number
        points: number
    }>
    economyRate: Array<{
        max: number
        points: number
    }>
    mileStones: Array<{
        wickets: number
        points: number
    }>
}

interface FieldingScoringConfig {
    catch: number
    runOut: number
    stumping: number
    numberOfCatchesForBonus: Array<{
        minCatches: number
        points: number
    }>
    numberOfRunOutsForBonus: Array<{
        minRunOuts: number
        points: number
    }>
    stumpingBonus: Array<{
        minStumpings: number
        points: number
    }>
}

interface ScoringConfig {
    batsman: BatsmanScoringConfig
    bowler: BowlingScoringConfig
    fielder: FieldingScoringConfig
}

const scoringConfig: ScoringConfig = {
    batsman: {
        runs: 1,
        fours: 5,
        ballsFaced: 0,
        sixes: 8,
        strikeRate: [
            { min: 270, points: 15 },
            { min: 240, points: 10 },
            { min: 200, points: 8 },
            { min: 180, points: 6 },
            { min: 120, points: 3 },
            { min: 100, points: 1 }
        ],
        mileStones: [
            { runs: 30, points: 20 },
            { runs: 50, points: 40 },
            { runs: 100, points: 75 },
            { runs: 150, points: 100 }
        ],
        duckPenalty: {
            points: -10,
            applicableRoles: 'Batsman'
        }
    },
    bowler: {
        wickets: 25,
        dotBall: 10,
        overBonus: [
            { minOvers: 4, points: 60 },
            { minOvers: 3, points: 40 },
            { minOvers: 2, points: 20 }
        ],
        economyRate: [
            { max: 3, points: 15 },
            { max: 4, points: 10 },
            { max: 5, points: 5 },
            { max: 6, points: 3 },
            { max: 7, points: 1 }
        ],
        mileStones: [
            { wickets: 2, points: 40 },
            { wickets: 3, points: 60 },
            { wickets: 4, points: 90 },
            { wickets: 5, points: 140 },
            { wickets: 6, points: 200 }
        ]
    },
    fielder: {
        catch: 25,
        runOut: 40,
        stumping: 70,
        numberOfCatchesForBonus: [
            { minCatches: 3, points: 20 },
            { minCatches: 4, points: 40 },
            { minCatches: 5, points: 60 }
        ],
        numberOfRunOutsForBonus: [
            { minRunOuts: 2, points: 20 },
            { minRunOuts: 3, points: 40 }
        ],
        stumpingBonus: [
            { minStumpings: 2, points: 30 },
            { minStumpings: 3, points: 60 }
        ]
    }
}

interface RolesPointsConfig {
    captainMultipler: number
    viceCaptainMultiplier: number
    impactPlayerMultiplier: number
    overseasPlayerMultiplier: number
}

const rolesPointsConfig: RolesPointsConfig = {
    captainMultipler: 4,
    viceCaptainMultiplier: 3,
    impactPlayerMultiplier: 5.5,
    overseasPlayerMultiplier: 1.5
}

export class ScoreService {
    constructor() {}

    private convertOversToDecimal(overs: number): number {
        const wholeOvers = Math.floor(overs)
        const balls = Math.round((overs - wholeOvers) * 10)
        return wholeOvers + balls / 6
    }

    calculateBattingPoints(data: {
        runs: number
        fours: number
        sixes: number
        ballsFaced: number
        isBatsman: boolean
    }): BattingBreakdown {
        const { runs, fours, sixes, ballsFaced, isBatsman } = data

        const rawRunsPoints = (runs - (fours * 4 + sixes * 6)) * scoringConfig.batsman.runs
        const foursPoints = fours * scoringConfig.batsman.fours
        const sixesPoints = sixes * scoringConfig.batsman.sixes

        const achievedMilestone = [...scoringConfig.batsman.mileStones]
            .reverse()
            .find((milestone) => runs >= milestone.runs)

        const milestonePoints = achievedMilestone?.points ?? 0

        let strikeRatePoints = 0
        if (ballsFaced >= 10) {
            const strikeRate = (runs / ballsFaced) * 100
            const achievedStrikeRate = scoringConfig.batsman.strikeRate.find(
                (tier) => strikeRate >= tier.min
            )
            strikeRatePoints = achievedStrikeRate?.points ?? 0
        }

        const duckPenaltyPoints =
            runs === 0 && isBatsman ? scoringConfig.batsman.duckPenalty.points : 0

        const total =
            rawRunsPoints +
            foursPoints +
            sixesPoints +
            milestonePoints +
            strikeRatePoints +
            duckPenaltyPoints

        return {
            rawRunsPoints,
            foursPoints,
            sixesPoints,
            milestonePoints,
            strikeRatePoints,
            duckPenaltyPoints,
            total
        }
    }

    calculateBowlingPoints(data: {
        wickets: number
        runsConceded: number
        oversBowled: number
        dots: number
        lbwBowledCount: number
        maidens: number
    }): BowlingBreakdown {
        const wicketsPoints = data.wickets * scoringConfig.bowler.wickets
        const dotBallPoints = (data.dots || 0) * scoringConfig.bowler.dotBall

        const achievedMilestone = [...scoringConfig.bowler.mileStones]
            .reverse()
            .find((milestone) => data.wickets >= milestone.wickets)

        const milestonePoints = achievedMilestone?.points ?? 0

        const achievedOverBonus = [...scoringConfig.bowler.overBonus]
            .reverse()
            .find((bonus) => data.oversBowled >= bonus.minOvers)

        const overBonusPoints = achievedOverBonus?.points ?? 0

        let economyPoints = 0
        const decimalOvers = this.convertOversToDecimal(data.oversBowled)
        if (decimalOvers > 0) {
            const economyRate = data.runsConceded / decimalOvers
            const economyTier = scoringConfig.bowler.economyRate.find(
                (tier) => economyRate <= tier.max
            )
            economyPoints = economyTier?.points ?? 0
        }

        const maidenPoints = (data.maidens || 0) * 100
        const lbwBowledPoints = (data.lbwBowledCount || 0) * 5

        const total =
            wicketsPoints +
            dotBallPoints +
            milestonePoints +
            overBonusPoints +
            economyPoints +
            maidenPoints +
            lbwBowledPoints

        return {
            wicketsPoints,
            dotBallPoints,
            milestonePoints,
            overBonusPoints,
            economyPoints,
            maidenPoints,
            lbwBowledPoints,
            total
        }
    }

    calculateFieldingPoints(
        data: {
            catches: number
            runOutDirect: number
            stumpings: number
        },
        isWicketKeeper: boolean
    ): FieldingBreakdown {
        const catchesPoints = data.catches * scoringConfig.fielder.catch
        const runOutPoints = data.runOutDirect * scoringConfig.fielder.runOut
        const stumpingsPoints = isWicketKeeper ? data.stumpings * scoringConfig.fielder.stumping : 0

        const achievedCatchBonus = [...scoringConfig.fielder.numberOfCatchesForBonus]
            .reverse()
            .find((bonus) => data.catches >= bonus.minCatches)

        const catchBonusPoints = achievedCatchBonus?.points ?? 0

        const achievedRunOutBonus = [...scoringConfig.fielder.numberOfRunOutsForBonus]
            .reverse()
            .find((bonus) => data.runOutDirect >= bonus.minRunOuts)

        const runOutBonusPoints = achievedRunOutBonus?.points ?? 0

        let stumpingBonusPoints = 0
        if (isWicketKeeper) {
            const achievedStumpingBonus = [...scoringConfig.fielder.stumpingBonus]
                .reverse()
                .find((bonus) => data.stumpings >= bonus.minStumpings)

            stumpingBonusPoints = achievedStumpingBonus?.points ?? 0
        }

        const total =
            catchesPoints +
            runOutPoints +
            stumpingsPoints +
            catchBonusPoints +
            runOutBonusPoints +
            stumpingBonusPoints

        return {
            catchesPoints,
            runOutPoints,
            stumpingsPoints,
            catchBonusPoints,
            runOutBonusPoints,
            stumpingBonusPoints,
            total
        }
    }

    calculateRolesPoints(
        role: 'Captain' | 'ViceCaptain' | 'ImpactPlayer' | 'OverseasPlayer' | 'Normal',
        basePoints: number,
        stats: {
            runs: number
            wickets: number
            playerRole: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper'
        }
    ): RoleBreakdown {
        let roleMultiplier = 1
        let roleBonusPoints = 0
        let finalPoints = basePoints
        let impactQualified: boolean | undefined

        switch (role) {
            case 'Captain':
                roleMultiplier = rolesPointsConfig.captainMultipler
                finalPoints = basePoints * roleMultiplier
                roleBonusPoints = finalPoints - basePoints
                break

            case 'ViceCaptain':
                roleMultiplier = rolesPointsConfig.viceCaptainMultiplier
                finalPoints = basePoints * roleMultiplier
                roleBonusPoints = finalPoints - basePoints
                break

            case 'OverseasPlayer':
                roleMultiplier = rolesPointsConfig.overseasPlayerMultiplier
                finalPoints = basePoints * roleMultiplier
                roleBonusPoints = finalPoints - basePoints
                break

            case 'ImpactPlayer': {
                impactQualified = false

                if (
                    (stats.playerRole === 'Batsman' || stats.playerRole === 'Wicket-Keeper') &&
                    stats.runs >= 25
                ) {
                    impactQualified = true
                } else if (stats.playerRole === 'Bowler' && stats.wickets >= 1) {
                    impactQualified = true
                } else if (
                    stats.playerRole === 'All-Rounder' &&
                    (stats.runs >= 10 || stats.wickets >= 1)
                ) {
                    impactQualified = true
                }

                if (impactQualified) {
                    roleMultiplier = rolesPointsConfig.impactPlayerMultiplier
                    finalPoints = basePoints * roleMultiplier
                    roleBonusPoints = finalPoints - basePoints
                } else {
                    finalPoints = 0
                    roleBonusPoints = -basePoints
                }

                break
            }

            case 'Normal':
            default:
                break
        }

        return {
            fantasyRole: role,
            basePoints,
            roleMultiplier,
            overseasMultiplier: 1,
            roleBonusPoints,
            overseasBonusPoints: 0,
            finalPoints,
            impactQualified
        }
    }

    calculateFinalPoints(params: {
        batting: { runs: number; fours: number; sixes: number; ballsFaced: number }
        bowling: {
            wickets: number
            runsConceded: number
            oversBowled: number
            dots: number
            lbwBowledCount: number
            maidens: number
        }
        fielding: { catches: number; runOutDirect: number; stumpings: number }
        playerRole: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper'
        isWicketKeeper: boolean
        fantasyRole: 'Captain' | 'ViceCaptain' | 'ImpactPlayer' | 'OverseasPlayer' | 'Normal'
        isOverseas: boolean
    }): PlayerScoringBreakdown {
        const batting = this.calculateBattingPoints({
            ...params.batting,
            isBatsman: params.playerRole === 'Batsman'
        })

        const bowling = this.calculateBowlingPoints(params.bowling)
        const fielding = this.calculateFieldingPoints(params.fielding, params.isWicketKeeper)

        const totalBasePoints = batting.total + bowling.total + fielding.total

        const role = this.calculateRolesPoints(params.fantasyRole, totalBasePoints, {
            runs: params.batting.runs,
            wickets: params.bowling.wickets,
            playerRole: params.playerRole
        })

        let finalPoints = role.finalPoints
        let overseasMultiplier = 1
        let overseasBonusPoints = 0

        const shouldApplyOverseasBonus =
            params.isOverseas &&
            params.fantasyRole !== 'OverseasPlayer' &&
            params.fantasyRole !== 'Normal' &&
            finalPoints > 0

        if (shouldApplyOverseasBonus) {
            overseasMultiplier = rolesPointsConfig.overseasPlayerMultiplier
            const beforeOverseas = finalPoints
            finalPoints = beforeOverseas * overseasMultiplier
            overseasBonusPoints = finalPoints - beforeOverseas
        }

        return {
            batting,
            bowling,
            fielding,
            role: {
                ...role,
                overseasMultiplier,
                overseasBonusPoints,
                finalPoints
            },
            totalBasePoints,
            finalPoints
        }
    }
}
