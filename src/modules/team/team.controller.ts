import { NextFunction, Request, Response } from 'express'

import { BaseController, ValidationService } from '@/lib'
import { STATUS_CODE } from '@/types/api/success.types'
import { UnauthorizedError } from '@/util'
import { ITeamService } from './team.service'
import {
    ChangeRolesSchema,
    CreateFantansyTeamSchema,
    UpdateFantasyTeamParamsSchema
} from './team.validator'

export class TeamController extends BaseController {
    constructor(private readonly service: ITeamService) {
        super()
    }

    createFantansyTeam = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const body = ValidationService.validateBody(req.body, CreateFantansyTeamSchema)

            await this.service.createTeam(userId, {
                name: body.name,
                playerIds: body.playerIds,
                captainId: body.captainId,
                viceCaptainId: body.viceCaptainId,
                matchId: body.matchId
            })

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Fantasy team created successfully',
                data: null
            })
        })
    }

    updateFantasyTeam = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(
                req.params,
                UpdateFantasyTeamParamsSchema
            )

            const body = ValidationService.validateBody(req.body, CreateFantansyTeamSchema)

            await this.service.updateTeam(userId, {
                teamId: params.teamId,
                matchId: body.matchId,
                playerIds: body.playerIds,
                captainId: body.captainId,
                viceCaptainId: body.viceCaptainId
            })

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fantasy team updated successfully',
                data: null
            })
        })
    }

    getCurrentTeam = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const team = await this.service.getCurrentTeam(userId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Current fantasy team fetched successfully',
                data: team
            })
        })
    }

    changeRoles = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(
                req.params,
                UpdateFantasyTeamParamsSchema
            )

            const body = ValidationService.validateBody(req.body, ChangeRolesSchema)

            await this.service.updateRoles(userId, {
                teamId: params.teamId,
                newCaptainId: body.newCaptainId,
                newViceCaptainId: body.newViceCaptainId,
                fixtureId: body.fixtureId
            })

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Team roles updated successfully',
                data: null
            })
        })
    }

    getActiveSession = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const activeSession = await this.service.getSession()

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Active match session fetched successfully',
                data: activeSession
            })
        })
    }
}
