import { Router } from 'express'

import { clerkMiddleware } from '@/middlewares'

import { franchiseController } from './franchise.module'

const router = Router()

router.use(clerkMiddleware)

// Franchise routes
router.post('/', franchiseController.createFranchise)
router.get('/me', franchiseController.getFranchiseOverview)
router.patch('/me', franchiseController.updateFranchise)
router.get('/roster-cycles/current', franchiseController.getCurrentRosterCycle)
router.put('/roster-cycles/:matchId/squad', franchiseController.saveSquad)

// Fixture and lineup routes
router.get('/fixtures/upcoming', franchiseController.getUpcomingFixtures)
router.get('/lineups/:fixtureId', franchiseController.getFixtureLineup)
router.put('/lineups/:fixtureId', franchiseController.saveFixtureLineup)

export default router
