import z from 'zod'

export const NewUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Invalid email address')
})

export const UpdateUsernameSchema = z.object({
    newUsername: z.string().min(3, 'Username must be at least 3 characters long')
})
