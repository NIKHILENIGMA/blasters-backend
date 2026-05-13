import z from 'zod'

export const NewUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Invalid email address')
})

export const UpdateUsernameSchema = z.object({
    newUsername: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters long')
        .max(32, 'Username must be at most 32 characters long')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
})

export const SyncProfileSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required').optional(),
    lastName: z.string().trim().min(1, 'Last name is required').optional(),
    profileImage: z.string().url('Profile image must be a valid URL').nullable().optional()
})
