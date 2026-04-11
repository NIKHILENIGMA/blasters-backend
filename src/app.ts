import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { clerkMiddleware as clerkExpressMiddleware } from '@clerk/express'
import 'source-map-support/register'

import { CORS_METHODS, CORS_ORIGIN, IS_PRODUCTION } from '@/config'
import router from '@/core'
import { errorHandler, notFound } from '@/middlewares'
import { BASE_API_PATH } from './constants/app.constants'
import WebhookRouter from './modules/webhooks/webhooks.routes'

const createApp = (): Application => {
    const app = express()
    const allowedOrigins = CORS_ORIGIN?.split(',').map((o) => o.trim())
    // Middleware
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin) return callback(null, true)

                if (allowedOrigins?.includes(origin)) {
                    return callback(null, origin)
                }

                return callback(new Error('Not allowed by CORS'))
            }, // Allow all origins by default
            methods: CORS_METHODS,
            credentials: true
        })
    )
    app.use(cookieParser()) // Parse cookies
    app.use(clerkExpressMiddleware()) // Clerk authentication
    app.use(helmet()) // Security headers
    app.use(compression()) // Compress responses
    app.use(BASE_API_PATH, WebhookRouter) // Auth webhooks
    app.use(express.json({ limit: '10mb' })) // Limit JSON body size to 10mb
    app.use(express.urlencoded({ extended: true, limit: '5mb' })) // Limit URL-encoded body size to 5mb
    app.use(express.static('public')) // Serve static files from 'public' directory

    if (IS_PRODUCTION) {
        app.use(morgan('combined')) // Use 'combined' format in production
    } else {
        app.use(morgan('dev')) // Use 'dev' format in development
    }

    // Routes
    app.use(BASE_API_PATH, router)
    app.get(`${BASE_API_PATH}/health`, (req: Request, res: Response) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers
            }
        })
    })
    // Not Found Middleware
    app.use(notFound)
    app.use(errorHandler)

    return app
}

export default createApp
