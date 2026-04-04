import { NextFunction, Request, Response } from 'express'

import { BaseController, ValidationService } from '@/lib'
import { IUserService } from './user.service'
import { UnauthorizedError } from '@/util'
import { UpdateUsernameSchema } from './user.validation'
import { STATUS_CODE } from '@/types/api/success.types'

export class UserController extends BaseController {
    constructor(private readonly service: IUserService) {
        super()
    }

    getDashboard = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId: string | undefined = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User ID is required to access the dashboard')
            }

            const dashboardData = await this.service.getUserStats(userId)

            return {
                statusCode: STATUS_CODE.OK,
                message: 'Dashboard data retrieved successfully',
                data: dashboardData
            }
        })
    }

    getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId: string | undefined = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User ID is required to access the leaderboard')
            }

            const leaderboardData = await this.service.getLeaderboard()

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Leaderboard data retrieved successfully',
                data: leaderboardData
            })
        })
    }

    getTopScorers = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId: string | undefined = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User ID is required to access the leaderboard')
            }

            const leaderboardData = await this.service.getTopScorers()

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Top scorers data retrieved successfully',
                data: leaderboardData
            })
        })
    }

    changeUsername = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId: string | undefined = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User ID is required to access the profile')
            }

            const body = ValidationService.validateBody(req.body, UpdateUsernameSchema)

            await this.service.updateUsername(userId, body.newUsername) // Placeholder for actual profile data retrieval logic

            return {
                statusCode: STATUS_CODE.OK,
                message: 'Username updated successfully',
                data: null
            }
        })
    }
}
