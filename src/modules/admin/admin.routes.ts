import { Router } from 'express'

import { isAdmin } from '@/middlewares/isAdmin/is-admin.middleware'
import { clerkMiddleware } from '@/middlewares/clerk/clerk.middleware'

import { adminController } from './admin.module'

const router = Router()

// Apply middleware to all routes
router.use(clerkMiddleware, isAdmin)

router.post('/fixtures', adminController.createFixture)

router.route('/matches').post(adminController.createMatch).get(adminController.getMatches)

router
    .route('/matches/:matchId')
    .patch(adminController.updateMatch)
    .get(adminController.getMatchById)

router.post('/matches/:matchId/process', adminController.processMatchPerformance)
router.patch('/matches/:matchId/toggle-lock', adminController.toggleLock)

export default router
