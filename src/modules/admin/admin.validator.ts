import z from 'zod'

export const MatchIdParamSchema = z.object({
    matchId: z.string()
})

export const FixtureIdParamSchema = z.object({
    fixtureId: z.string()
})

export const FantasyPointsCalculationSchema = z.object({
    fixtureId: z.string(), // e.g., "MI_v_CSK_April15"
    playerPerformances: z.array(
        z.object({
            playerId: z.string(),
            stats: z.object({
                runs: z.number(),
                fours: z.number(),
                sixes: z.number(),
                wickets: z.number(),
                catches: z.number(),
                runouts: z.number()
            }),
            isOverseas: z.boolean()
        })
    ),
    matchResult: z.string() // e.g., "MI won by 5 wickets"
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
