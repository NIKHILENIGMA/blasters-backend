import dotenv from 'dotenv'

dotenv.config()

// Application Configuration
export const PORT: number = parseInt(process.env.PORT!) || 3000
export const NODE_ENV: string = process.env.NODE_ENV! || 'development'
export const IS_PRODUCTION: boolean = NODE_ENV === 'production'
export const IS_DEVELOPMENT: boolean = NODE_ENV === 'development'
export const FRONTEND_BASE_URL: string = 'http://localhost:3000'

// Cors Configuration
export const CORS_ORIGIN: string = process.env.CORS_ORIGIN || 'http://localhost:3000'
export const CORS_METHODS: string[] = process.env.CORS_METHODS?.split(',') || [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS'
]
export const CORS_HEADERS: string[] = process.env.CORS_HEADERS?.split(',') || [
    'Content-Type',
    'Authorization'
]
export const CORS_CREDENTIALS: boolean = process.env.CORS_CREDENTIALS === 'true'

// Database Configuration
export const DATABASE_URL: string =
    process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/mydatabase'
