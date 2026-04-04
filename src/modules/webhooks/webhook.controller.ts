import { NextFunction, Request, Response } from 'express'
import { IWebhookService } from './webhook.service'
import { BaseController } from '@/lib'
import { STATUS_CODE, SuccessResponse } from '@/types/api/success.types'
import { WebhookProvider, WebhookRequest } from './webhook.types'

export class WebhookController extends BaseController {
    constructor(private webhookService: IWebhookService) {
        super()
    }

    onboarding = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async (): Promise<SuccessResponse<null>> => {
            const clerkRequest: WebhookRequest<WebhookProvider.CLERK> = {
                provider: WebhookProvider.CLERK,
                headers: req.headers as Record<string, string>,
                body: req.body as Buffer | string
            }
            // Process the webhook
            await this.webhookService.processWebhook(clerkRequest)

            // Return a success response
            return this.createResponse<null>({
                statusCode: STATUS_CODE.OK,
                message: 'Clerk webhook processed successfully',
                data: null
            })
        })
    }

    payment = async (req: Request, res: Response, next: NextFunction) => {
        return this.handleRequest(req, res, next, async (): Promise<SuccessResponse<null>> => {
            const razorpayRequest: WebhookRequest<WebhookProvider.RAZORPAY> = {
                provider: WebhookProvider.RAZORPAY,
                headers: req.headers as Record<string, string>,
                body: req.body as Buffer | string
            }
            // Process the webhook
            await this.webhookService.processWebhook(razorpayRequest)
            // Return a success response
            return this.createResponse<null>({
                statusCode: STATUS_CODE.OK,
                message: 'Razorpay webhook processed successfully',
                data: null
            })
        })
    }
}
