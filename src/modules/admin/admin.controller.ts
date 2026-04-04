import { NextFunction, Request, Response } from 'express'

import { BaseController, ValidationService } from '@/lib'
import { STATUS_CODE } from '@/types/api/success.types'
import { UnauthorizedError } from '@/util'
import { IAdminService } from './admin.service'
import {
    CreateMatchSchema,
    FantasyPointsCalculationSchema,
    LockMatchSchema,
    MatchIdParamSchema
} from './admin.validator'

export class AdminController extends BaseController {
    constructor(private readonly service: IAdminService) {
        super()
    }

    processMatchPerformance = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)

            const body = ValidationService.validateBody(req.body, FantasyPointsCalculationSchema)

            await this.service.calculateFantasyPoints(params.matchId, body)

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Fantasy team created successfully',
                data: null
            })
        })
    }

    createMatch = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const body = ValidationService.validateBody(req.body, CreateMatchSchema)

            await this.service.createMatch(body)

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Match created successfully',
                data: null
            })
        })
    }

    getMatchDetails = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)

            // Assuming there's a method in the service to get match details
            const matchDetails = await this.service.getMatchDetails(params.matchId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Match details retrieved successfully',
                data: matchDetails
            })
        })
    }

    toggleLock = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)

            const body = ValidationService.validateBody(req.body, LockMatchSchema)

            await this.service.lockMatch(params.matchId, body.isLocked)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Match locked successfully',
                data: null
            })
        })
    }
}
