import express, { Router } from 'express'

import { webhookController } from './webhook.module'

// Initialize the router
const router = Router()

// POST /webhooks/clerk - Endpoint to handle Clerk webhooks
router
    .route('/webhooks/clerk')
    .post(express.raw({ type: 'application/json' }), webhookController.onboarding)

export default router
