import { pgTable, uuid, date, numeric, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { categories } from './categories';

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    month: date('month').notNull(),
    limitAmount: numeric('limit_amount', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    categoryMonthUnique: unique('budgets_category_month_unique').on(table.categoryId, table.month),
    categoryMonthIdx: index('budgets_category_month_idx').on(table.categoryId, table.month),
  })
);
