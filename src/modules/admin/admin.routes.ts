import { Router } from 'express'

import { isAdmin } from '@/middlewares/isAdmin/is-admin.middleware'
import { clerkMiddleware } from '@/middlewares/clerk/clerk.middleware'

import { adminController } from './admin.module'

const router = Router()

router
    .route('/fixtures')
    .get(clerkMiddleware, adminController.getFixtures) // Allow non-admins to view fixtures
    .post(clerkMiddleware, isAdmin, adminController.createFixture)

router
    .route('/rulesets')
    .get(clerkMiddleware, isAdmin, adminController.getRulesets)
    .post(clerkMiddleware, isAdmin, adminController.createRuleset)

router
    .route('/rulesets/:rulesetId')
    .patch(clerkMiddleware, isAdmin, adminController.updateRuleset)
    .delete(clerkMiddleware, isAdmin, adminController.deleteRuleset)

router
    .route('/fixtures/:fixtureId')
    .patch(clerkMiddleware, isAdmin, adminController.updateFixture)
    .get(clerkMiddleware, isAdmin, adminController.getFixtureById)

router.get('/fixtures/:fixtureId/teams', clerkMiddleware, isAdmin, adminController.getFixtureTeams)

router
    .route('/fixtures/:fixtureId/calculate')
    .post(clerkMiddleware, isAdmin, adminController.calculatePoints)
router
    .route('/fixtures/:fixtureId/preview')
    .get(clerkMiddleware, isAdmin, adminController.previewPoints)
router
    .route('/fixtures/:fixtureId/publish')
    .post(clerkMiddleware, isAdmin, adminController.publishPoints)

router
    .route('/matches')
    .post(clerkMiddleware, isAdmin, adminController.createMatch)
    .get(clerkMiddleware, isAdmin, adminController.getMatches)

router
    .route('/matches/:matchId')
    .patch(clerkMiddleware, isAdmin, adminController.updateMatch)
    .get(clerkMiddleware, isAdmin, adminController.getMatchById)

router.post(
    '/matches/:matchId/process',
    clerkMiddleware,
    isAdmin,
    adminController.processMatchPerformance
)
router.patch('/matches/:matchId/toggle-lock', clerkMiddleware, isAdmin, adminController.toggleLock)

export default router
