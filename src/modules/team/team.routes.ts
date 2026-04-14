import { Router } from 'express'

import { clerkMiddleware } from '@/middlewares'

import { teamController } from './team.module'

const router = Router()

router.route('/').post(clerkMiddleware, teamController.createFantansyTeam)

router.route('/session/active').get(clerkMiddleware, teamController.getActiveSession)

router.route('/current').get(clerkMiddleware, teamController.getCurrentTeam)
router.route('/fixtures').get(clerkMiddleware, teamController.getTodayFixtures)
router
    .route('/:teamId')
    .get(clerkMiddleware, teamController.getTeamById)
    .put(clerkMiddleware, teamController.updateFantasyTeam)
router.route('/:teamId/roles').patch(clerkMiddleware, teamController.changeRoles)

export default router
