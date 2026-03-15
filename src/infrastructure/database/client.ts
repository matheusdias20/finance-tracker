import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const getConnectionString = () => {
  const url = process.env.DATABASE_URL
  if (url && url.startsWith('postgres') && !url.includes('...')) {
    return url
  }
  return 'postgresql://postgres:postgres@ep-dummy-123456.us-east-2.aws.neon.tech/neondb?sslmode=require'
}

const sql = neon(getConnectionString())
export const db = drizzle(sql, { schema })
export type Database = typeof db
