import { z } from 'zod'
import { ClerkEventType } from './webhook.types'

export const ClerkUnsafeMetadataSchema = z.object({
    invite_token: z.string().optional()
})

export const ClerkUserJSONSchema = z.object({
    id: z.string(),
    email_addresses: z.array(
        z.object({
            id: z.string(),
            email_address: z.email()
        })
    ),
    primary_email_address_id: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    image_url: z.url().nullable(),
    unsafe_metadata: ClerkUnsafeMetadataSchema
})

export const ClerkWebhookEventSchema = z.object({
    type: z.enum(ClerkEventType),
    data: ClerkUserJSONSchema
})
