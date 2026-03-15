import { vi } from 'vitest'
import type { ICategoryRepository } from '../../../src/core/repositories/category.repository.interface'
import type { ITransactionRepository } from '../../../src/core/repositories/transaction.repository.interface'
import type { IBudgetRepository } from '../../../src/core/repositories/budget.repository.interface'

export const createMockCategoryRepository = (): import('vitest').Mocked<ICategoryRepository> => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  countTransactions: vi.fn(),
})

export const createMockTransactionRepository = (): import('vitest').Mocked<ITransactionRepository> => ({
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
})

export const createMockBudgetRepository = (): import('vitest').Mocked<IBudgetRepository> => ({
  findByMonth: vi.fn(),
  findByCategoryAndMonth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
})
