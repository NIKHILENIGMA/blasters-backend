import z from 'zod'

export const MatchIdParamSchema = z.object({
    matchId: z.string()
})

export const FixtureIdParamSchema = z.object({
    fixtureId: z.string()
})

export const RulesetIdParamSchema = z.object({
    rulesetId: z.uuid('Ruleset ID must be a valid UUID')
})

export const GetFixturesQuerySchema = z.object({
    status: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.enum(['scheduled', 'live', 'completed']).optional()
    ),
    matchStatus: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.enum(['scheduled', 'live', 'completed']).optional()
    ),
    team: z.enum(['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'DC', 'GL', 'RPS']).optional(),
    matchId: z.preprocess(
        (value) => (value === '' ? undefined : value),
        z.string().uuid().optional()
    )
})

export const IngestMatchPerformanceSchema = z.object({
    cricbuzzMatchId: z.string().min(1, 'Cricbuzz Match ID is required')
})

export const LockMatchSchema = z.object({
    isLocked: z.boolean()
})

export const CreateMatchSchema = z.object({
    title: z.string(), // e.g., "Session 1: Mon-Fri"
    buyWindowOpenAt: z.coerce.date().optional(),
    buyWindowCloseAt: z.coerce.date().optional(),
    squadLockAt: z.coerce.date().optional(),
    startTime: z.coerce.date(), // ISO date string
    endTime: z.coerce.date() // ISO date string
})

export const UpdateMatchSchema = z
    .object({
        title: z.string().min(1).optional(),
        buyWindowOpenAt: z.coerce.date().nullable().optional(),
        buyWindowCloseAt: z.coerce.date().nullable().optional(),
        squadLockAt: z.coerce.date().nullable().optional(),
        startTime: z.coerce.date().optional(),
        endTime: z.coerce.date().optional(),
        isLocked: z.boolean().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one match field must be provided'
    })

export const CreateFixtureSchema = z.object({
    id: z.string().min(1, 'Fixture ID is required'),
    matchId: z.uuid('Match ID must be a valid UUID'),
    teamA: z.string().min(1, 'Team A is required'),
    teamB: z.string().min(1, 'Team B is required'),
    startTime: z.coerce.date(),
    lineupLockAt: z.coerce.date().optional(),
    matchNumber: z.string().optional(),
    venueId: z.string().optional(),
    matchStatus: z.enum(['scheduled', 'live', 'completed']).optional()
})

export const UpdateFixtureSchema = z
    .object({
        teamA: z.string().min(1, 'Team A is required').optional(),
        teamB: z.string().min(1, 'Team B is required').optional(),
        startTime: z.coerce.date().optional(),
        matchNumber: z.string().nullable().optional(),
        venueId: z.string().nullable().optional(),
        matchStatus: z.enum(['scheduled', 'live', 'completed']).optional(),
        lineupLockAt: z.coerce.date().nullable().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one fixture field must be provided'
    })

const TierPointSchema = z.object({
    points: z.number()
})

export const RulesetConfigSchema = z.object({
    totalPlayers: z.number().int().positive(),
    roles: z.object({
        batsman: z.object({ min: z.number().int().min(0) }),
        bowler: z.object({ min: z.number().int().min(0) }),
        wicketKeeper: z.object({ min: z.number().int().min(0) }),
        allRounder: z.object({ min: z.number().int().min(0) })
    }),
    overseas: z.object({ max: z.number().int().min(0) }),
    multipliers: z.object({
        captain: z.number().positive(),
        viceCaptain: z.number().positive(),
        impactPlayer: z.number().positive(),
        overseas: z.number().positive().optional()
    }),
    scoring: z
        .object({
            batsman: z
                .object({
                    runs: z.number().optional(),
                    ballsFaced: z.number().optional(),
                    fours: z.number().optional(),
                    sixes: z.number().optional(),
                    strikeRate: z
                        .array(TierPointSchema.extend({ min: z.number().min(0) }))
                        .optional(),
                    mileStones: z
                        .array(TierPointSchema.extend({ runs: z.number().min(0) }))
                        .optional(),
                    duckPenalty: z
                        .object({
                            points: z.number(),
                            applicableRoles: z.literal('Batsman')
                        })
                        .optional()
                })
                .optional(),
            bowler: z
                .object({
                    wickets: z.number().optional(),
                    dotBall: z.number().optional(),
                    overBonus: z
                        .array(TierPointSchema.extend({ minOvers: z.number().min(0) }))
                        .optional(),
                    economyRate: z
                        .array(TierPointSchema.extend({ max: z.number().min(0) }))
                        .optional(),
                    mileStones: z
                        .array(TierPointSchema.extend({ wickets: z.number().min(0) }))
                        .optional(),
                    maiden: z.number().optional(),
                    lbwBowled: z.number().optional()
                })
                .optional(),
            fielder: z
                .object({
                    catch: z.number().optional(),
                    runOut: z.number().optional(),
                    stumping: z.number().optional(),
                    numberOfCatchesForBonus: z
                        .array(TierPointSchema.extend({ minCatches: z.number().min(0) }))
                        .optional(),
                    numberOfRunOutsForBonus: z
                        .array(TierPointSchema.extend({ minRunOuts: z.number().min(0) }))
                        .optional(),
                    stumpingBonus: z
                        .array(TierPointSchema.extend({ minStumpings: z.number().min(0) }))
                        .optional()
                })
                .optional()
        })
        .optional()
})

export const CreateRulesetSchema = z.object({
    name: z.string().min(1, 'Ruleset name is required'),
    scope: z.enum(['global', 'cycle', 'fixture']).default('global'),
    isActive: z.boolean().optional(),
    config: RulesetConfigSchema
})

export const UpdateRulesetSchema = CreateRulesetSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        message: 'At least one ruleset field must be provided'
    }
)
