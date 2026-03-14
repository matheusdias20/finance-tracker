import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { categories } from './schema/categories'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for seeding.')
}

const sqlClient = neon(databaseUrl)
const db = drizzle(sqlClient)

async function main() {
  console.log('Seeding categories...')
  
  const seedCategories = [
    { name: 'Alimentação', icon: 'utensils', color: '#E74C3C', type: 'expense' as const, budgetLimit: '800.00' },
    { name: 'Transporte', icon: 'car', color: '#3498DB', type: 'expense' as const, budgetLimit: '400.00' },
    { name: 'Moradia', icon: 'home', color: '#2ECC71', type: 'expense' as const, budgetLimit: '1500.00' },
    { name: 'Saúde', icon: 'heart-pulse', color: '#E91E63', type: 'expense' as const, budgetLimit: '300.00' },
    { name: 'Lazer', icon: 'gamepad-2', color: '#9B59B6', type: 'expense' as const, budgetLimit: '200.00' },
    { name: 'Educação', icon: 'graduation-cap', color: '#F39C12', type: 'expense' as const, budgetLimit: '250.00' },
    { name: 'Assinaturas', icon: 'repeat', color: '#1ABC9C', type: 'expense' as const, budgetLimit: '150.00' },
    { name: 'Renda', icon: 'trending-up', color: '#27AE60', type: 'income' as const, budgetLimit: null },
  ]

  const existing = await db.select().from(categories).limit(1)
  if (existing.length === 0) {
    for (const cat of seedCategories) {
      await db.insert(categories).values(cat)
    }
    console.log('Categories seeded successfully.')
  } else {
    console.log('Categories already seeded, skipping.')
  }
}

main().catch((err) => {
  console.error('Error seeding database:', err)
  process.exit(1)
})
