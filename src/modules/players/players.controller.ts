import { NextFunction, Request, Response } from 'express'

import { BaseController } from '@/lib'
import { IPlayersService } from './players.service'
import { STATUS_CODE } from '@/types/api/success.types'
import { UnauthorizedError } from '@/util'

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
}
