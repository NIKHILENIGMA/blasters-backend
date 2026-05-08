import { Router } from 'express'
import { playersController } from './player.module'
import { clerkMiddleware, isAdmin } from '@/middlewares'

const router = Router()

// GET /api/players - Get all available players
router
    .route('/')
    .get(clerkMiddleware, playersController.getAvailablePlayers)
    .post(clerkMiddleware, isAdmin, playersController.createPlayer)

router.patch('/:playerId', clerkMiddleware, isAdmin, playersController.updatePlayer)

export default router
