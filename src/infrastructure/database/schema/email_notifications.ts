import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const emailNotifications = pgTable(
  'email_notifications',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: text('type', { enum: ['budget_exceeded', 'recurring_reminder', 'weekly_summary', 'monthly_summary'] }).notNull(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    status: text('status', { enum: ['pending', 'sent', 'failed'] }).default('pending'),
    payload: jsonb('payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    scheduledStatusIdx: index('email_notifications_scheduled_status_idx').on(table.scheduledAt, table.status),
  })
);
