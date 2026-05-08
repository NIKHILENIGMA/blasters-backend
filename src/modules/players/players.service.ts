import { DatabaseConnection } from '@/core/db/service/database.service'
import { Player } from './players.types'
import { players } from '@/core'
import { NotFoundError } from '@/util'
import { eq } from 'drizzle-orm'
import { CreatePlayer } from './players.types'

export interface IPlayersService {
    getPlayers(): Promise<Player[]>
    createPlayer(data: CreatePlayer): Promise<Player>
    updatePlayer(playerId: string, data: Partial<CreatePlayer>): Promise<Player>
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

    async createPlayer(data: CreatePlayer): Promise<Player> {
        const [createdPlayer] = await this.db
            .insert(players)
            .values({
                ...data,
                cricbuzzPlayerId: data.cricbuzzPlayerId || null
            })
            .returning()

        return createdPlayer
    }

    async updatePlayer(playerId: string, data: Partial<CreatePlayer>): Promise<Player> {
        const [existingPlayer] = await this.db
            .select()
            .from(players)
            .where(eq(players.id, playerId))

        if (!existingPlayer) {
            throw new NotFoundError('Player not found')
        }

        const [updatedPlayer] = await this.db
            .update(players)
            .set({
                ...data,
                cricbuzzPlayerId:
                    data.cricbuzzPlayerId === undefined
                        ? existingPlayer.cricbuzzPlayerId
                        : data.cricbuzzPlayerId
            })
            .where(eq(players.id, playerId))
            .returning()

        return updatedPlayer
    }
}
