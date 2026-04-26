import { db } from '@/core'

import { FranchiseController } from './franchise.controller'
import { FranchiseService } from './franchise.service'

const franchiseService = new FranchiseService(db)
const franchiseController = new FranchiseController(franchiseService)

export { franchiseController, franchiseService }
