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
    }): number {
        const { runs, fours, sixes, ballsFaced } = data
        let total = 0

        const baseScore = runs - (fours * 4 + sixes * 6)
        total += baseScore * scoringConfig.batsman.runs
        total += fours * scoringConfig.batsman.fours
        total += sixes * scoringConfig.batsman.sixes

        const achievedMileStones = [...scoringConfig.batsman.mileStones]
            .reverse()
            .find((mileStone) => runs >= mileStone.runs)

        if (achievedMileStones) {
            total += achievedMileStones.points
        }

        if (ballsFaced >= 10) {
            const strikeRate = (runs / ballsFaced) * 100
            const achievedStrikeRate = scoringConfig.batsman.strikeRate.find(
                (tier) => strikeRate >= tier.min
            )
            if (achievedStrikeRate) {
                total += achievedStrikeRate.points
            }
        }

        if (runs === 0 && data.isBatsman) {
            total += scoringConfig.batsman.duckPenalty.points
        }

        return total
    }

    calculateBowlingPoints(data: {
        wickets: number
        runsConceded: number
        oversBowled: number
        dots: number
        lbwBowledCount: number
        maidens: number
    }): number {
        let total = 0

        total += data.wickets * scoringConfig.bowler.wickets
        total += (data.dots || 0) * scoringConfig.bowler.dotBall

        const achievedMileStones = [...scoringConfig.bowler.mileStones]
            .reverse()
            .find((mileStone) => data.wickets >= mileStone.wickets)
        if (achievedMileStones) {
            total += achievedMileStones.points
        }

        const achievedOverBonus = [...scoringConfig.bowler.overBonus]
            .reverse()
            .find((bonus) => data.oversBowled >= bonus.minOvers)
        if (achievedOverBonus) {
            total += achievedOverBonus.points
        }

        const decimalOvers = this.convertOversToDecimal(data.oversBowled)
        if (decimalOvers > 0) {
            const economyRate = data.runsConceded / decimalOvers
            const ecoTier = scoringConfig.bowler.economyRate.find((tier) => economyRate <= tier.max)
            if (ecoTier) {
                total += ecoTier.points
            }
        }

        if (data.maidens) {
            total += data.maidens * 100
        }

        if (data.lbwBowledCount) {
            total += data.lbwBowledCount * 5
        }

        return total
    }

    calculateFieldingPoints(
        data: {
            catches: number
            runOutDirect: number
            stumpings: number
        },
        isWicketKeeper: boolean
    ): number {
        let total = 0

        total += data.catches * scoringConfig.fielder.catch
        total += data.runOutDirect * scoringConfig.fielder.runOut

        const achievedCatchBonus = [...scoringConfig.fielder.numberOfCatchesForBonus]
            .reverse()
            .find((bonus) => data.catches >= bonus.minCatches)
        if (achievedCatchBonus) {
            total += achievedCatchBonus.points
        }

        const achievedRunOutBonus = [...scoringConfig.fielder.numberOfRunOutsForBonus]
            .reverse()
            .find((bonus) => data.runOutDirect >= bonus.minRunOuts)
        if (achievedRunOutBonus) {
            total += achievedRunOutBonus.points
        }

        if (isWicketKeeper) {
            const achievedStumpingBonus = [...scoringConfig.fielder.stumpingBonus]
                .reverse()
                .find((bonus) => data.stumpings >= bonus.minStumpings)
            if (achievedStumpingBonus) {
                total += achievedStumpingBonus.points
            }
        }

        return total
    }

    calculateRolesPoints(
        role: 'Captain' | 'ViceCaptain' | 'ImpactPlayer' | 'OverseasPlayer' | 'Normal',
        basePoints: number,
        stats: {
            runs: number
            wickets: number
            playerRole: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper'
        }
    ): number {
        if (role === 'Normal') return basePoints

        switch (role) {
            case 'Captain':
                return basePoints * rolesPointsConfig.captainMultipler
            case 'ViceCaptain':
                return basePoints * rolesPointsConfig.viceCaptainMultiplier
            case 'OverseasPlayer':
                return basePoints * rolesPointsConfig.overseasPlayerMultiplier
            case 'ImpactPlayer': {
                let hasImpact = false
                if (
                    (stats.playerRole === 'Batsman' || stats.playerRole === 'Wicket-Keeper') &&
                    stats.runs >= 25
                ) {
                    hasImpact = true
                } else if (stats.playerRole === 'Bowler' && stats.wickets >= 1) {
                    hasImpact = true
                } else if (
                    stats.playerRole === 'All-Rounder' &&
                    (stats.wickets >= 1 || stats.runs >= 10)
                ) {
                    hasImpact = true
                }

                if (!hasImpact) return 0
                return basePoints * rolesPointsConfig.impactPlayerMultiplier
            }
            default:
                return basePoints
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
    }): number {
        const battingBase = this.calculateBattingPoints({
            ...params.batting,
            isBatsman: params.playerRole === 'Batsman'
        })

        const bowlingBase = this.calculateBowlingPoints(params.bowling)
        const fieldingBase = this.calculateFieldingPoints(params.fielding, params.isWicketKeeper)

        const totalBase = battingBase + bowlingBase + fieldingBase

        let finalPoints = this.calculateRolesPoints(params.fantasyRole, totalBase, {
            runs: params.batting.runs,
            wickets: params.bowling.wickets,
            playerRole: params.playerRole
        })

        if (
            params.isOverseas &&
            params.fantasyRole !== 'OverseasPlayer' &&
            params.fantasyRole !== 'Normal'
        ) {
            finalPoints *= rolesPointsConfig.overseasPlayerMultiplier
        }

        return finalPoints
    }
}
