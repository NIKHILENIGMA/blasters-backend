import { DATABASE_URL } from '@/config'
import { DatabaseService } from './service/database.service'

// Initialize the DatabaseService
export const databaseService = new DatabaseService(DATABASE_URL)

// Export the database connection
export const db = databaseService.db
