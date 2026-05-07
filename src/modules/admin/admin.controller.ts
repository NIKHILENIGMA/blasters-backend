import { NextFunction, Request, Response } from 'express'

import { BaseController, ValidationService } from '@/lib'
import { STATUS_CODE } from '@/types/api/success.types'
import { BadRequestError, UnauthorizedError } from '@/util'
import { IAdminService } from './admin.service'
import {
    CreateFixtureSchema,
    CreateMatchSchema,
    FixtureIdParamSchema,
    GetFixturesQuerySchema,
    IngestMatchPerformanceSchema,
    LockMatchSchema,
    MatchIdParamSchema,
    UpdateFixtureStatusSchema
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

            const body = ValidationService.validateBody(req.body, UpdateFixtureStatusSchema)

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
            const query = ValidationService.validateQuery(req.query, GetFixturesQuerySchema)
            const fixtures = await this.service.getFixtures(query)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fixtures retrieved successfully',
                data: fixtures
            })
        })
    }

    /**
     * Fantasy points calculation and publishing routes. These routes allow admins to calculate fantasy points based on player performances, preview the calculated points before publishing, and then publish the points for a fixture. This separation of calculation, preview, and publishing allows for better control over the fantasy points management process and ensures that admins can review the points before they are made public to users.
     */

    calculatePoints = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }
            const params = ValidationService.validateParams(req.params, FixtureIdParamSchema)

            const body = ValidationService.validateBody(req.body, IngestMatchPerformanceSchema)

            await this.service.ingestMatchPerformance(params.fixtureId, body.cricbuzzMatchId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fantasy points calculated successfully',
                data: null
            })
        })
    }

    previewPoints = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }
            const params = ValidationService.validateParams(req.params, FixtureIdParamSchema)

            const previewData = await this.service.previewPointsForFixture(params.fixtureId)

            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fantasy points preview generated successfully',
                data: previewData
            })
        })
    }

    publishPoints = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            // No body validation needed for publishing points, as it simply takes the fixture ID and publishes the already calculated points
            const params = ValidationService.validateParams(req.params, FixtureIdParamSchema)

            // The service method will handle the logic of publishing the points, which may include updating the fixture status, notifying users, etc.
            await this.service.publishMatchResults(params.fixtureId)

            // The response indicates that the points have been published successfully, and any necessary data (like the published points or updated fixture details) can be included in the response if needed.
            return this.createResponse({
                statusCode: STATUS_CODE.OK,
                message: 'Fantasy points published successfully',
                data: null
            })
        })
    }

    /**
     * Deprecated routes for calculating fantasy points and locking matches. These routes are still available for backward compatibility but should not be used for new implementations. The calculation of fantasy points and locking of matches should ideally be handled through the fixture management routes to maintain better organization and control over match data.
     */
    processMatchPerformance = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async () => {
            const userId = req.user?.id
            if (!userId) {
                throw new UnauthorizedError('User not authenticated')
            }

            ValidationService.validateParams(req.params, MatchIdParamSchema)

            await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate some processing delay
            throw new BadRequestError(
                'Deprecated endpoint. Use POST /admin/fixtures/:fixtureId/calculate instead.'
            )
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
