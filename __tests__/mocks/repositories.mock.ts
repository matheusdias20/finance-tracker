import { vi } from 'vitest'
import type { ICategoryRepository } from '@/core/repositories/category.repository.interface'
import type { ITransactionRepository } from '@/core/repositories/transaction.repository.interface'
import type { IBudgetRepository } from '@/core/repositories/budget.repository.interface'

export const mockCategoryRepo = (): ICategoryRepository => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  countTransactions: vi.fn(),
})

export const mockTransactionRepo = (): ITransactionRepository => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  findRecurringDue: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateNextOccurrence: vi.fn(),
  softDelete: vi.fn(),
  sumByCategory: vi.fn(),
  sumByMonth: vi.fn(),
  getHistoryByCategory: vi.fn(),
  deleteAll: vi.fn(),
})

export const mockBudgetRepo = (): IBudgetRepository => ({
  findByMonth: vi.fn(),
  findByCategoryAndMonth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteAll: vi.fn(),
})
