import { NextFunction, Request, Response } from 'express'

import { BaseController, ValidationService } from '@/lib'
import { STATUS_CODE } from '@/types/api/success.types'
import { UnauthorizedError } from '@/util'
import { IAdminService } from './admin.service'
import {
    CreateFixtureSchema,
    CreateMatchSchema,
    FantasyPointsCalculationSchema,
    FixtureIdParamSchema,
    LockMatchSchema,
    MatchIdParamSchema
} from './admin.validator'

export class AdminController extends BaseController {
    constructor(private readonly service: IAdminService) {
        super()
    }

    /**
     * Admin routes for managing matches and fixtures. These routes allow admins to create, update, and retrieve match and fixture details, as well as lock matches to prevent further changes. The separation of match and fixture management allows for better organization and control over the scheduling and details of each match session.
     */

    createMatch = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const body = ValidationService.validateBody(req.body, CreateMatchSchema)

            await this.service.createMatch(body)

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Match created successfully',
                data: null
            })
        })
    }

    updateMatch = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)

            const body = ValidationService.validateBody(req.body, CreateMatchSchema)

            await this.service.updateMatch(params.matchId, body)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Match updated successfully',
                data: null
            })
        })
    }

    getMatchById = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)

            // Assuming there's a method in the service to get match details
            const matchDetails = await this.service.getMatchById(params.matchId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Match details retrieved successfully',
                data: matchDetails
            })
        })
    }

    getMatches = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const matches = await this.service.getMatches()

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Matches retrieved successfully',
                data: matches
            })
        })
    }

    /**
     * Fixtures are created separately from matches to allow admins to set up the match details and schedule before the actual match is created in the system. This allows for better management of match data and scheduling, as well as providing a way to lock lineups before the match starts.
     */

    createFixture = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const body = ValidationService.validateBody(req.body, CreateFixtureSchema)

            await this.service.createFixture(body)

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Fixture created successfully',
                data: null
            })
        })
    }

    updateFixture = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, FixtureIdParamSchema)

            const body = ValidationService.validateBody(req.body, CreateFixtureSchema)

            await this.service.updateFixture(params.fixtureId, body)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fixture updated successfully',
                data: null
            })
        })
    }

    getFixtureById = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, FixtureIdParamSchema)

            const fixture = await this.service.getFixtureById(params.fixtureId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fixture retrieved successfully',
                data: fixture
            })
        })
    }

    getFixtures = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const fixtures = await this.service.getFixtures()

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fixtures retrieved successfully',
                data: fixtures
            })
        })
    }

    processMatchPerformance = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)

            const body = ValidationService.validateBody(req.body, FantasyPointsCalculationSchema)

            await this.service.calculateFantasyPoints(params.matchId, body)

            return this.createResponse({
                statusCode: STATUS_CODE.CREATED,
                message: 'Fantasy team created successfully',
                data: null
            })
        })
    }

    toggleLock = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            const params = ValidationService.validateParams(req.params, MatchIdParamSchema)

            const body = ValidationService.validateBody(req.body, LockMatchSchema)

            await this.service.lockMatch(params.matchId, body.isLocked)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Match locked successfully',
                data: null
            })
        })
    }
}
