import { Router } from 'express'

import { clerkMiddleware } from '@/middlewares'

import { franchiseController } from './franchise.module'

const router = Router()

router.use(clerkMiddleware)

router.post('/', franchiseController.createFranchise)
router.get('/me', franchiseController.getFranchiseOverview)
router.get('/roster-cycles/current', franchiseController.getCurrentRosterCycle)
router.put('/roster-cycles/:matchId/squad', franchiseController.saveSquad)
router.get('/lineups/:fixtureId', franchiseController.getFixtureLineup)
router.put('/lineups/:fixtureId', franchiseController.saveFixtureLineup)

export default router
