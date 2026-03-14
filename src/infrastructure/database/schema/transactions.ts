import { pgTable, uuid, numeric, varchar, date, text, boolean, jsonb, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { categories } from './categories';

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    date: date('date').notNull(),
    type: text('type', { enum: ['income', 'expense'] }).notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    isRecurring: boolean('is_recurring').default(false),
    recurrenceRule: jsonb('recurrence_rule'),
    nextOccurrence: date('next_occurrence'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    amountCheck: check('amount_check', sql`${table.amount} > 0`),
    categoryIdIdx: index('transactions_category_id_idx').on(table.categoryId),
    dateIdx: index('transactions_date_idx').on(table.date),
    typeIdx: index('transactions_type_idx').on(table.type),
    isRecurringIdx: index('transactions_is_recurring_idx').on(table.isRecurring),
    nextOccurrenceIdx: index('transactions_next_occurrence_idx').on(table.nextOccurrence),
    deletedAtIdx: index('transactions_deleted_at_idx').on(table.deletedAt),
  })
);
