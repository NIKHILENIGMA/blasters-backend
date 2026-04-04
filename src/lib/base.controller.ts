import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '@/util'
import { SuccessResponse } from '@/types/api/success.types'

export abstract class BaseController {
    // Standardized request handler
    protected async handleRequest(
        req: Request,
        res: Response,
        next: NextFunction,
        action: () => Promise<SuccessResponse<unknown>>
    ): Promise<void> {
        try {
            const result = await action()
            ApiResponse(
                req,
                res,
                result.statusCode || 200,
                result.message || 'Request successful',
                result.data
            )
        } catch (error) {
            next(error)
        }
    }

    // Create a response builder method for standardized responses
    protected createResponse<T>(response: SuccessResponse<T>): SuccessResponse<T> {
        const { statusCode, message, data } = response

        return {
            statusCode,
            message,
            data
        }
    }
}
