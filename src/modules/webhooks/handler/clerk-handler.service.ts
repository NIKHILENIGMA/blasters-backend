import { DatabaseConnection } from '@/core/db/service/database.service'
import { logger } from '@/config'

import { InternalServerError, NotFoundError } from '@/util'

import { ClerkEventType, ClerkUser, ClerkWebhookEvent, IWebhookHandler } from '../webhook.types'
import { ClerkWebhookEventSchema } from '../webhook.validator'
import { users } from '@/core'
import { generateRandomUsername } from '@/util/generate-username'
import { eq } from 'drizzle-orm'

export class ClerkWebhookHandler implements IWebhookHandler<ClerkWebhookEvent, void> {
    constructor(private readonly db: DatabaseConnection) {}

    parse(raw: Buffer | string): ClerkWebhookEvent {
        if (!Buffer.isBuffer(raw)) {
            throw new InternalServerError('Raw body must be a Buffer for Clerk webhook parsing')
        }
        const parsedBody: unknown = JSON.parse(raw.toString())
        return ClerkWebhookEventSchema.parse(parsedBody)
    }

    async handle(body: ClerkWebhookEvent): Promise<void> {
        const { type, data } = body

        switch (type) {
            case ClerkEventType.USER_CREATED:
                // Handle user created event
                return await this.handleUserCreated(data)

            case ClerkEventType.USER_UPDATED:
                // Handle user updated event
                return await this.handleUserUpdated(data)
            case ClerkEventType.USER_DELETED:
                // Handle user deleted event
                return await this.handleUserDeleted(data)
            default:
                logger.info(`Received unhandled Clerk event type: ${String(type)}`)
                throw new NotFoundError('Unhandled Clerk event type', 'UNHANDLED_EVENT_TYPE')
        }
    }

    private async handleUserCreated(data: ClerkUser) {
        // Find the primary email address
        const primaryEmail = data.email_addresses.find(
            (e: { id: string }) => e.id === data.primary_email_address_id
        )?.email_address
        if (!primaryEmail) {
            throw new NotFoundError('Primary email not found', 'PRIMARY_EMAIL_NOT_FOUND')
        }
        const username = generateRandomUsername(
            data.first_name || 'user',
            data.last_name || ['clerk' + data.id.slice(0, 5)].join('')
        )

        await this.db.insert(users).values({
            id: data.id,
            email: primaryEmail,
            username: username,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    private async handleUserUpdated(data: ClerkUser) {
        const payload = {
            email: data.email_addresses.find(
                (e: { id: string }) => e.id === data.primary_email_address_id
            )?.email_address,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            profileImage: data.image_url,
            updatedAt: new Date()
        }
        // Implement user updated handling logic
        await this.db.update(users).set(payload).where(eq(users.id, data.id))
        logger.info(`Handling Clerk user.updated event: ${JSON.stringify(data)}`)
    }

    private async handleUserDeleted(data: ClerkUser) {
        // Implement user deleted handling logic
        await this.db.delete(users).where(eq(users.id, data.id))
        logger.info(`Handling Clerk user.deleted event: ${JSON.stringify(data)}`)
    }
}
