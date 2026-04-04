import z from 'zod'

export const MatchIdParamSchema = z.object({
    matchId: z.string()
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
    startTime: z.date(), // ISO date string
    endTime: z.date() // ISO date string
})
