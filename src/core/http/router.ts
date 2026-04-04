import { Router } from 'express'

import PlayerRoutes from '@/modules/players/players.route'
import TeamRoutes from '@/modules/team/team.routes'
import AdminRoutes from '@/modules/admin/admin.routes'
import UserRoutes from '@/modules/user/user.routes'

const router = Router()

router.use('/players', PlayerRoutes)
router.use('/team', TeamRoutes)
router.use('/admin', AdminRoutes)
router.use('/users', UserRoutes)

export default router
