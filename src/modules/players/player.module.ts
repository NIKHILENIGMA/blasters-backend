import { db } from '@/core/db/connection'
import { PlayersService } from './players.service'
import { PlayersController } from './players.controller'

// Initialize service and controller
const playersService = new PlayersService(db)

// Export instances for use in routes
const playersController = new PlayersController(playersService)

export { playersService, playersController }
