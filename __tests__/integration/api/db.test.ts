import { describe, it, expect } from 'vitest'
import { createTestDb, seedTestCategories } from '../../helpers/test-db'
import * as schema from '../../helpers/sqlite-schema'

describe('Database Integration Helper', () => {
  it('should create and seed the database', async () => {
    const { db } = createTestDb()
    await seedTestCategories(db)
    
    const categories = db.select().from(schema.categories).all()
    expect(categories).toHaveLength(2)
  })
})
