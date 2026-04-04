import { logger } from '@/config'
import { UnauthorizedError } from '@/util'
import { clerkClient } from '@clerk/express'
import { Request, Response, NextFunction } from 'express'

export const isAdmin = async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    try {
        const userId: string | undefined = req.user?.id
        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        // Fetch the user's details from Clerk to check their role
        const currentUser = await clerkClient.users.getUser(userId)

        // Check if the user's private metadata has the role of 'admin'
        const isAdmin = currentUser.privateMetadata?.role === 'admin'
        if (!isAdmin) {
            throw new UnauthorizedError('User is not an admin')
        }

        // If the user is an admin, proceed to the next middleware or route handler
        next()
    } catch (error) {
        logger.error(`Error in isAdmin middleware: ${(error as Error).message}`)
        next(error)
    }
}
