import { NextFunction, Request, Response } from 'express'

import { BaseController, ValidationService } from '@/lib'
import { STATUS_CODE } from '@/types/api/success.types'
import { UnauthorizedError } from '@/util'

import { IFranchiseService } from './franchise.service'
import {
    CreateFranchiseSchema,
    FixtureIdParamSchema,
    MatchIdParamSchema,
    SaveFixtureLineupSchema,
    SaveSquadSchema
} from './franchise.validator'

export class FranchiseController extends BaseController {
    constructor(private readonly service: IFranchiseService) {
        super()
    }

    createFranchise = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const body = ValidationService.validateBody(req.body, CreateFranchiseSchema)

            await this.service.createFranchise(userId, body)

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Franchise created successfully',
                data: null
            })
        })
    }

    getFranchiseOverview = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const data = await this.service.getFranchiseOverview(userId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Franchise overview fetched successfully',
                data
            })
        })
    }

    getCurrentRosterCycle = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const data = await this.service.getCurrentRosterCycle(userId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Current roster cycle fetched successfully',
                data
            })
        })
    }

    saveSquad = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)
            const body = ValidationService.validateBody(req.body, SaveSquadSchema)

            await this.service.saveSquad(userId, {
                matchId: params.matchId,
                playerIds: body.playerIds
            })

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Squad saved successfully',
                data: null
            })
        })
    }

    getFixtureLineup = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, FixtureIdParamSchema)

            const data = await this.service.getFixtureLineup(userId, params.fixtureId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fixture lineup fetched successfully',
                data
            })
        })
    }

    saveFixtureLineup = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, FixtureIdParamSchema)
            const body = ValidationService.validateBody(req.body, SaveFixtureLineupSchema)

            await this.service.saveFixtureLineup(userId, {
                fixtureId: params.fixtureId,
                playingPlayerIds: body.playingPlayerIds,
                substitutePlayerIds: body.substitutePlayerIds,
                captainId: body.captainId,
                viceCaptainId: body.viceCaptainId,
                impactPlayerId: body.impactPlayerId
            })

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fixture lineup saved successfully',
                data: null
            })
        })
    }
}
