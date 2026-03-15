import { db } from '../database/client'
import { CategoryRepository } from '../database/repositories/category.repository'
import { TransactionRepository } from '../database/repositories/transaction.repository'
import { BudgetRepository } from '../database/repositories/budget.repository'
import { NotificationRepository } from '../database/repositories/notification.repository'

export const categoryRepository = new CategoryRepository(db)
export const transactionRepository = new TransactionRepository(db)
export const budgetRepository = new BudgetRepository(db)
export const notificationRepository = new NotificationRepository(db)
