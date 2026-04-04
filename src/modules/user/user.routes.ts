import { Router } from 'express'

import { userController } from './user.module'
import { clerkMiddleware } from '@/middlewares'

const router = Router()

router.route('/dashboard').get(clerkMiddleware, userController.getDashboard)
router.route('/leaderboard').get(clerkMiddleware, userController.getLeaderboard)
router.route('/leaderboard/toppers').get(clerkMiddleware, userController.getTopScorers)
router.route('/profile/change-username').patch(clerkMiddleware, userController.changeUsername)

export default router
