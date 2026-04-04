import { InternalServerError } from '@/util'

import {
    IWebhookValidator,
    WebhookHandlerRegistry,
    WebhookProvider,
    WebhookRequest,
    WebhookResponse,
    WebhookResultMap
} from './webhook.types'
// import { logger } from '@/config'

export interface IWebhookService {
    processWebhook(request: WebhookRequest): Promise<WebhookResponse>
}

export class WebhookService implements IWebhookService {
    constructor(
        private handlers: WebhookHandlerRegistry,
        private validator: IWebhookValidator
    ) {}

    public async processWebhook<P extends WebhookProvider>(
        request: WebhookRequest<P>
    ): Promise<WebhookResponse<WebhookResultMap[P]>> {
        const { provider, headers, body } = request

        try {
            // Get the appropriate handler based on the provider
            const handler = this.handlers[provider]
            if (!handler) {
                throw new InternalServerError(`No handler found for provider: ${provider}`)
            }

            // Validate the webhook signature
            const isValid: boolean = this.validator.validateSignature(provider, headers, body)
            if (!isValid) {
                throw new InternalServerError('Invalid webhook signature')
            }

            // Parse the body
            const parsedBody = handler.parse(body)

            // Process the webhook using the appropriate handler
            const result = await handler.handle(parsedBody)

            return {
                success: true,
                message: `Webhook processed successfully ${provider}`,
                data: result
            }
        } catch (error: unknown) {
            let errorMessage = 'An unknown error occurred'
            if (error instanceof Error) {
                errorMessage = error.message
            } else if (typeof error === 'string') {
                errorMessage = error
            }

            return {
                success: false,
                message: `Error processing webhook: ${errorMessage}`
            }
        }
    }
}
