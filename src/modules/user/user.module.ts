import { db } from '@/core/db/connection'
import { IUserService, UserService } from './user.service'
import { UserController } from './user.controller'

const userService = new UserService(db)

const userController = new UserController(userService)

export { userService, IUserService, userController }
