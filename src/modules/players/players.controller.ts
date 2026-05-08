import { NextFunction, Request, Response } from 'express'

import { BaseController, ValidationService } from '@/lib'
import { IPlayersService } from './players.service'
import { STATUS_CODE } from '@/types/api/success.types'
import { UnauthorizedError } from '@/util'
import { CreatePlayerSchema, PlayerIdParamSchema, UpdatePlayerSchema } from './players.validator'

export class PlayersController extends BaseController {
    constructor(private readonly playersService: IPlayersService) {
        super()
    }

    getAvailablePlayers = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }
            const players = await this.playersService.getPlayers()

            if (!players) {
                throw new Error('Failed to retrieve players')
            }

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Players retrieved successfully',
                data: players
            })
        })
    }

    createPlayer = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const body = ValidationService.validateBody(req.body, CreatePlayerSchema)
            const player = await this.playersService.createPlayer(body)

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Player created successfully',
                data: player
            })
        })
    }

    updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, PlayerIdParamSchema)
            const body = ValidationService.validateBody(req.body, UpdatePlayerSchema)
            const player = await this.playersService.updatePlayer(params.playerId, body)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Player updated successfully',
                data: player
            })
        })
    }
}
