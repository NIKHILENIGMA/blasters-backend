import dotenv from 'dotenv'

dotenv.config()

export const CLERK_WEBHOOK_SECRET: string = String(process.env.CLERK_WEBHOOK_SECRET) || ''
export const CLERK_WEBHOOK_SIGNING_SECRET: string =
    String(process.env.CLERK_WEBHOOK_SIGNING_SECRET) || ''
