import { Router } from 'express'

import { isAdmin } from '@/middlewares/isAdmin/is-admin.middleware'
import { clerkMiddleware } from '@/middlewares/clerk/clerk.middleware'

import { adminController } from './admin.module'

const router = Router()

// Apply middleware to all routes
router.use(clerkMiddleware, isAdmin)

router.post('/matches', adminController.createMatch)
router.post('/fixtures', adminController.createFixture)
router.get('/matches/:matchId', adminController.getMatchDetails)
router.post('/matches/:matchId/process', adminController.processMatchPerformance)
router.patch('/matches/:matchId/toggle-lock', adminController.toggleLock)

export default router
