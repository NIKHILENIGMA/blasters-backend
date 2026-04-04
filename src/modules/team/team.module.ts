import { db } from '@/core'
import { TeamService } from './team.service'
import { TeamController } from './team.controller'

const teamService = new TeamService(db)

const teamController = new TeamController(teamService)

export { teamController, teamService }
