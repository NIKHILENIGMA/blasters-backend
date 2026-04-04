import { db } from '@/core/db/connection'

import { WebhookValidation } from './webhook-validator'
import { ClerkWebhookHandler } from './handler/clerk-handler.service'
import { RazorpayWebhookHandler } from './handler/razor-handler.service'
import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'
import { WebhookHandlerRegistry, WebhookProvider } from './webhook.types'

// Instantiate the webhook validator
const validator = new WebhookValidation()

// Instantiate individual webhook handlers
const clerkHandler = new ClerkWebhookHandler(db)
const razorpayHandler = new RazorpayWebhookHandler()

// Map providers to their respective handlers
const handlers: WebhookHandlerRegistry = {
    [WebhookProvider.CLERK]: clerkHandler,
    [WebhookProvider.RAZORPAY]: razorpayHandler
}

// Instantiate the WebhookService with handlers and validator
const webhookService = new WebhookService(handlers, validator)

// Instantiate the WebhookController with the webhook service
const webhookController = new WebhookController(webhookService)

export { webhookService, webhookController }
