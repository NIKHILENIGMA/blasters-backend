import { drizzle } from 'drizzle-orm/node-postgres'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool, type PoolConfig } from 'pg'

import { logger } from '@/config'

import * as schema from '../schema'

export type DatabaseConnection = NodePgDatabase<typeof schema>

export class DatabaseService {
    private readonly pool: Pool
    private readonly config: PoolConfig = {
        connectionString: this.databaseUrl,
        max: 10, // Maximum number of connections in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: {
            rejectUnauthorized: false // For secure connections, ensure this is properly configured in production
        }
    }
    private _db: DatabaseConnection

    constructor(private readonly databaseUrl: string) {
        this.pool = new Pool(this.config)

        this.pool.on('error', (err) => {
            logger.error(`Unexpected error on idle client: ${err?.message || err}`)
        })

        this._db = drizzle(this.pool, { schema })
    }

    get db(): DatabaseConnection {
        return this._db
    }

    async closePool(): Promise<void> {
        await this.pool.end() // Gracefully close all connections in the pool
    }
}
