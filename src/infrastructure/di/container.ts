import { db } from '../database/client'
import { CategoryRepository } from '../database/repositories/category.repository'
import { TransactionRepository } from '../database/repositories/transaction.repository'
import { BudgetRepository } from '../database/repositories/budget.repository'
import { NotificationRepository } from '../database/repositories/notification.repository'
import { CategoryService } from '@/core/services/category.service'
import { TransactionService } from '@/core/services/transaction.service'
import { BudgetService } from '@/core/services/budget.service'
import { ForecastService } from '@/core/services/forecast.service'
import { RecurringService } from '@/core/services/recurring.service'

const categoryRepo = new CategoryRepository(db)
const transactionRepo = new TransactionRepository(db)
const budgetRepo = new BudgetRepository(db)
export const notificationRepo = new NotificationRepository(db) // instantiated for UI hooks later

export const categoryService = new CategoryService(categoryRepo)
export const budgetService = new BudgetService(budgetRepo)
export const transactionService = new TransactionService(transactionRepo, budgetService)
export const forecastService = new ForecastService(transactionRepo, categoryRepo)
export const recurringService = new RecurringService(transactionRepo, transactionService)
