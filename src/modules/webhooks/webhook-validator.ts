import crypto from 'node:crypto'

import { Webhook } from 'svix/dist/webhook'

import { CLERK_WEBHOOK_SIGNING_SECRET, logger } from '@/config'
import { InternalServerError } from '@/util'
import { SVIX_HEADER_KEYS } from '@/constants/auth.constants'

import { IWebhookValidator, WebhookProvider } from './webhook.types'

export class WebhookValidation implements IWebhookValidator {
    public validateSignature(
        provider: WebhookProvider,
        headers: Record<string, string>,
        rawBody: Buffer | string
    ): boolean {
        switch (provider) {
            case WebhookProvider.CLERK:
                if (typeof rawBody !== 'object' || !Buffer.isBuffer(rawBody)) {
                    throw new InternalServerError(
                        'Raw body must be a Buffer for Clerk webhook validation'
                    )
                }
                return this.validateClerkSignature(headers, rawBody)
            case WebhookProvider.RAZORPAY:
                if (typeof rawBody !== 'string') {
                    throw new InternalServerError(
                        'Raw body must be a string for Razorpay webhook validation'
                    )
                }
                return this.validateRazorpaySignature(headers, rawBody)
            default:
                throw new Error(`Unsupported webhook provider: ${String(provider)}`)
        }
    }

    private validateClerkSignature(headers: Record<string, string>, rawBody: Buffer): boolean {
        try {
            // Get the signing secret from config
            const secret: string = CLERK_WEBHOOK_SIGNING_SECRET
            if (!secret) {
                throw new InternalServerError('Clerk webhook signing secret is not configured')
            }

            // Initialize Svix Webhook verifier
            const wh = new Webhook(secret)

            // Verify the webhook signature
            wh.verify(rawBody, {
                'svix-id': headers[SVIX_HEADER_KEYS.ID],
                'svix-timestamp': headers[SVIX_HEADER_KEYS.TIMESTAMP],
                'svix-signature': headers[SVIX_HEADER_KEYS.SIGNATURE]
            })

            return true
        } catch (error) {
            logger.error(`Clerk webhook signature validation failed: ${(error as Error).message}`)
            return false
        }
    }

    private validateRazorpaySignature(headers: Record<string, string>, rawBody: string): boolean {
        try {
            const webhookSecret = process.env.RAZOR_PAY_WEBHOOK_SECRET || '' // Ensure this is set in your environment
            if (!webhookSecret) {
                throw new InternalServerError('Razorpay webhook signing secret is not configured')
            }

            const signature = headers['x-razorpay-signature']
            if (!signature) return false // No signature header present

            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawBody)
                .digest('hex')

            return signature === expectedSignature
        } catch (error) {
            logger.error(
                `Razorpay webhook signature validation failed: ${(error as Error).message}`
            )
            return false
        }
    }
}
