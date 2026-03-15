import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './sqlite-schema'

export function createTestDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })

  // Manual table creation for SQLite compatibility
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      budget_limit REAL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id),
      is_recurring INTEGER DEFAULT 0,
      recurrence_rule TEXT,
      next_occurrence TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES categories(id),
      month TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      sent_at TEXT,
      status TEXT DEFAULT 'pending',
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  return { db, sqlite }
}

export async function seedTestCategories(db: any) {
  const categoriesArr = [
    { 
      id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
      name: 'Alimentação',
      icon: 'Utensils',
      color: '#FF6B6B',
      budgetLimit: 1000,
      type: 'expense'
    },
    { 
      id: 'd290f1ee-6c54-4b01-90e6-d701748f0852',
      name: 'Salário',
      icon: 'Wallet',
      color: '#4ECDC4',
      budgetLimit: null,
      type: 'income'
    }
  ]

  for (const cat of categoriesArr) {
    db.insert(schema.categories).values(cat).run()
  }
}
