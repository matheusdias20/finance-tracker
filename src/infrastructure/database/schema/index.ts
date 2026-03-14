import { categories } from './categories'
import { transactions } from './transactions'
import { budgets } from './budgets'
import { emailNotifications } from './email_notifications'

export * from './categories'
export * from './transactions'
export * from './budgets'
export * from './email_notifications'

// Tipos inferidos para uso no TypeScript
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert
export type EmailNotification = typeof emailNotifications.$inferSelect
export type NewEmailNotification = typeof emailNotifications.$inferInsert
