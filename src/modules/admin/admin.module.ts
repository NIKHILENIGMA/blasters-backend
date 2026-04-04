import { db } from '@/core'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'

const adminService = new AdminService(db)

const adminController = new AdminController(adminService)

export { adminController, adminService }
