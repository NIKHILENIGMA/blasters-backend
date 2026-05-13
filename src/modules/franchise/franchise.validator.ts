import z from 'zod'

export const CreateFranchiseSchema = z.object({
    teamName: z.string().min(3, 'Team name must be at least 3 characters long'),
    teamLogo: z.string().min(1, 'Team logo is required')
})

export const UpdateFranchiseSchema = z.object({
    teamName: z.string().trim().min(3, 'Team name must be at least 3 characters long'),
    teamLogo: z.string().trim().min(1, 'Team logo is required')
})

export const MatchIdParamSchema = z.object({
    matchId: z.uuid('Match ID must be a valid UUID')
})

export const SaveSquadQuerySchema = z.object({
    isDraft: z
        .string()
        .transform((val) => val === 'true')
        .refine((val) => typeof val === 'boolean', 'isDraft must be a valid boolean string')
})

export const FixtureIdParamSchema = z.object({
    fixtureId: z.string().min(1, 'Fixture ID is required')
})

export const SaveSquadSchema = z.object({
    playerIds: z
        .array(z.uuid('Each player ID must be a valid UUID'))
        .min(1, 'At least one player ID is required')
})

export const SaveFixtureLineupSchema = z.object({
    playingPlayerIds: z
        .array(z.uuid('Each playing player ID must be a valid UUID'))
        .length(12, 'Exactly 12 playing player IDs are required'),
    substitutePlayerIds: z
        .array(z.uuid('Each substitute player ID must be a valid UUID'))
        .length(13, 'Exactly 13 substitute player IDs are required'),
    captainId: z.uuid('Captain ID must be a valid UUID'),
    viceCaptainId: z.uuid('Vice-captain ID must be a valid UUID'),
    impactPlayerId: z.uuid('Impact player ID must be a valid UUID')
})
