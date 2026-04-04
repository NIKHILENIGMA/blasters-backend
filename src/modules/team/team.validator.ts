import z from 'zod'

export const CreateFantansyTeamSchema = z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters long'),
    playerIds: z
        .array(z.string())
        .min(11, 'Exactly 11 player IDs are required')
        .max(11, 'A maximum of 11 player IDs can be provided'),
    captainId: z.string(),
    viceCaptainId: z.string(),
    matchId: z.string()
})

// params
export const UpdateFantasyTeamParamsSchema = z.object({
    teamId: z.string()
})

export const GetFantasyTeamsParamsSchema = z.object({
    matchId: z.string()
})

export const ChangeRolesSchema = z.object({
    newCaptainId: z.string(),
    newViceCaptainId: z.string(),
    fixtureId: z.string()
})
