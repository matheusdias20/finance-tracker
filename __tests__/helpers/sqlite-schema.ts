import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  budgetLimit: real('budget_limit'),
  type: text('type').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  deletedAt: text('deleted_at'),
})

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  recurrenceRule: text('recurrence_rule'), // JSON as text
  nextOccurrence: text('next_occurrence'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
  deletedAt: text('deleted_at'),
})

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id),
  month: text('month').notNull(),
  limitAmount: real('limit_amount').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})
