import { logger } from '@/config'
import { IWebhookHandler, RazorpayWebhookEvent, RazorpayEvent } from '../webhook.types'
import { NotFoundError } from '@/util'
import { z } from 'zod'

export const RazorpayWebhookEventSchema = z.object({
    event: z.enum(RazorpayEvent),
    payload: z.object({
        payment: z.object({
            entity: z.unknown() // Adjust this schema as per actual payment entity structure if needed
        })
    })
})

export class RazorpayWebhookHandler implements IWebhookHandler<RazorpayWebhookEvent> {
    parse(raw: Buffer | string): RazorpayWebhookEvent {
        const parsedBody: unknown = JSON.parse(raw.toString())
        return RazorpayWebhookEventSchema.parse(parsedBody) as RazorpayWebhookEvent
    }

    async handle(body: RazorpayWebhookEvent): Promise<void> {
        const { event, payload } = body

        switch (event) {
            case RazorpayEvent.PAYMENT_CAPTURED:
                return await this.handlePaymentCaptured(payload.payment.entity)
            case RazorpayEvent.PAYMENT_FAILED:
                return await this.handlePaymentFailed(payload.payment.entity)
            case RazorpayEvent.ORDER_PAID:
                return await this.handleOrderPaid(payload.payment.entity)
            default:
                logger.warn(`Unhandled Razorpay Webhook Event Type: ${String(event)}`)
                throw new NotFoundError('Unhandled Razorpay event type', 'UNHANDLED_EVENT_TYPE')
        }
    }

    // Todo: Implement specific handlers for Razorpay events
    private async handlePaymentCaptured(payment: unknown) {
        await Promise.resolve()
        logger.info(`Handling payment captured event for payment: ${JSON.stringify(payment)}`)
        // e.g., update order status, send confirmation email
        // return { handled: true, paymentId: payment }
    }

    private async handlePaymentFailed(payment: unknown) {
        await Promise.resolve()

        logger.info(`Handling payment failed event for payment: ${JSON.stringify(payment)}`)
        // e.g., notify user, update order status
        // return { handled: true, paymentId: payment }
    }

    private async handleOrderPaid(payment: unknown) {
        await Promise.resolve()

        logger.info(`Handling payment order.paid event for payment: ${JSON.stringify(payment)}`)
        // e.g., fulfill order, send invoice
        // return { handled: true, paymentId: payment }
    }
}
