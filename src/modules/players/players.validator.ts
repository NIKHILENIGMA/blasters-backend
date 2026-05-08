import z from 'zod'

export const PlayerIdParamSchema = z.object({
    playerId: z.string().uuid('Player ID must be a valid UUID')
})

export const CreatePlayerSchema = z.object({
    name: z.string().min(1, 'Player name is required'),
    iplTeam: z.enum(['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'DC', 'PBKS', 'RR', 'GT', 'LSG']),
    role: z.enum(['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']),
    profileImageUrl: z.string().min(1, 'Profile image URL is required'),
    isOverseas: z.boolean().optional().default(false),
    cost: z.number().nonnegative('Cost must be 0 or more'),
    cricbuzzPlayerId: z.string().optional().nullable()
})

export const UpdatePlayerSchema = z
    .object({
        name: z.string().min(1, 'Player name is required').optional(),
        iplTeam: z
            .enum(['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'DC', 'PBKS', 'RR', 'GT', 'LSG'])
            .optional(),
        role: z.enum(['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']).optional(),
        profileImageUrl: z.string().min(1, 'Profile image URL is required').optional(),
        isOverseas: z.boolean().optional(),
        cost: z.number().nonnegative('Cost must be 0 or more').optional(),
        cricbuzzPlayerId: z.string().optional().nullable()
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one player field must be provided'
    })
