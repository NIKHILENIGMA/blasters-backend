import z from 'zod'

export const MatchIdParamSchema = z.object({
    matchId: z.string()
})

export const FixtureIdParamSchema = z.object({
    fixtureId: z.string()
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
        matchStatus: z.enum(['scheduled', 'live', 'completed']).optional(),
        lineupLockAt: z.coerce.date().nullable().optional()
    })
    .refine((data) => data.matchStatus !== undefined || data.lineupLockAt !== undefined, {
        message: 'At least one fixture field must be provided'
    })
