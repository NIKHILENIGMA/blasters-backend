import { Router } from 'express'
import { playersController } from './player.module'
import { clerkMiddleware } from '@/middlewares'

const router = Router()

// GET /api/players - Get all available players
router.get('/', clerkMiddleware, playersController.getAvailablePlayers)

export default router
