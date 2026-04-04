import { DatabaseConnection } from '@/core/db/service/database.service'
import { Player } from './players.types'
import { players } from '@/core'
import { NotFoundError } from '@/util'

export interface IPlayersService {
    getPlayers(): Promise<Player[]>
}

export class PlayersService implements IPlayersService {
    constructor(private readonly db: DatabaseConnection) {}

    async getPlayers(): Promise<Player[]> {
        const iplPlayers = await this.db.select().from(players)

        if (!iplPlayers) {
            throw new NotFoundError('No players found')
        }

        return iplPlayers
    }
}
