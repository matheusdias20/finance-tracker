import { newDb } from 'pg-mem'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/infrastructure/database/schema'

export function createPgMemDb() {
  const db = newDb()
  
  // Basic configuration for pg-mem to behave like Postgres for our needs
  db.public.registerFunction({
    name: 'uuid_generate_v4',
    returns: db.public.getType('uuid'),
    implementation: () => 'd290f1ee-6c54-4b01-90e6-d701748f0851' // deterministic for tests
  })

  // Create tables from schema
  // Note: pg-mem doesn't automatically sync with Drizzle schema classes,
  // we usually need to run migrations or manual CREATE TABLE commands.
  // For simplicity here, we'll use a manual table creation helper if needed,
  // but let's try to just use the client directly.
  
  const pgClient = db.adapters.createPg().Pool
  const client = new pgClient()
  const drizzleDb = drizzle(client, { schema })

  return { drizzleDb, client, db }
}
