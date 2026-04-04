import z from 'zod'
import { ClerkUserJSONSchema, ClerkUnsafeMetadataSchema } from './webhook.validator'

export enum WebhookProvider {
    CLERK = 'CLERK',
    RAZORPAY = 'RAZORPAY'
}

export interface WebhookRequest<P extends WebhookProvider = WebhookProvider> {
    provider: P
    headers: Record<string, string>
    body: Buffer | string
}

export interface WebhookResponse<T = unknown> {
    success: boolean
    message: string
    data?: T
}

export interface IWebhookHandler<TEvent, TResult = void> {
    parse(raw: Buffer | string): TEvent
    handle(payload: TEvent): Promise<TResult>
}

export interface IWebhookValidator {
    validateSignature(
        provider: WebhookProvider,
        headers: Record<string, string>,
        body: Buffer | string
    ): boolean
}

// Map providers to their event types
export type WebhookEventMap = {
    [WebhookProvider.CLERK]: ClerkWebhookEvent
    [WebhookProvider.RAZORPAY]: RazorpayWebhookEvent
}

export type WebhookResultMap = {
    [WebhookProvider.CLERK]: void
    [WebhookProvider.RAZORPAY]: void
}

export type WebhookHandlerRegistry = {
    [P in WebhookProvider]: IWebhookHandler<WebhookEventMap[P], WebhookResultMap[P]>
}

// --------------------------------------------
// Clerk Webhook Types
// --------------------------------------------
export enum ClerkEventType {
    USER_CREATED = 'user.created',
    USER_UPDATED = 'user.updated',
    USER_DELETED = 'user.deleted'
}

export type ClerkUserUnsafeMetadata = z.infer<typeof ClerkUnsafeMetadataSchema>

export interface ClerkUserJSON {
    id: string
    email_addresses: Array<{
        id: string
        email_address: string
    }>
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string | null
    unsafe_metadata: ClerkUserUnsafeMetadata
}

export interface ClerkWebhookEvent {
    type: ClerkEventType
    data: ClerkUserJSON
}

export type ClerkUser = z.infer<typeof ClerkUserJSONSchema>

// --------------------------------------------
// Razorpay Webhook Types
// --------------------------------------------
export enum RazorpayEvent {
    PAYMENT_CAPTURED = 'payment.captured',
    PAYMENT_FAILED = 'payment.failed',
    ORDER_PAID = 'order.paid'
}

export interface RazorpayPayment {
    id: string
    amount: number
    currency: string
    status: string
    order_id: string
    method: string
}

export interface RazorpayWebhookEvent {
    event: RazorpayEvent
    payload: {
        payment: {
            entity: RazorpayPayment
        }
    }
}
