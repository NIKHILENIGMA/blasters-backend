import { Router } from 'express'

import PlayerRoutes from '@/modules/players/players.route'
import TeamRoutes from '@/modules/team/team.routes'
import AdminRoutes from '@/modules/admin/admin.routes'
import UserRoutes from '@/modules/user/user.routes'
import FranchiseRoutes from '@/modules/franchise/franchise.routes'

const router = Router()

router.use('/players', PlayerRoutes)
router.use('/team', TeamRoutes)
router.use('/admin', AdminRoutes)
router.use('/users', UserRoutes)
router.use('/franchise', FranchiseRoutes)

export default router
