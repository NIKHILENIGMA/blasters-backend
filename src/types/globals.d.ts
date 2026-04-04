/// <reference types="@clerk/express/env" />
import 'express-serve-static-core'
interface User {
    id: string
}

// Extend the Request interface to include auth property
declare global {
    namespace Express {
        export interface Request {
            user?: User
        }
    }
}
