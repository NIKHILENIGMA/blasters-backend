import { getAuth } from '@clerk/express'
import { Request, Response, NextFunction } from 'express'

import { UnauthorizedError } from '@/util'

export const clerkMiddleware = (req: Request, _: Response, next: NextFunction) => {
    try {
        const auth = getAuth(req)
        if (!auth.userId) {
            // Return JSON error instead of redirecting
            throw new UnauthorizedError('User not authenticated')
        }

        req.user = { id: auth.userId }
        next()
    } catch (error) {
        next(error)
    }
}
