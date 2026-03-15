import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RecurringService } from '../../../src/core/services/recurring.service'
import { TransactionService } from '../../../src/core/services/transaction.service'
import { BudgetService } from '../../../src/core/services/budget.service'
import { createMockTransactionRepository, createMockBudgetRepository } from './mocks'

describe('RecurringService', () => {
  let service: RecurringService
  let txService: TransactionService
  let mockTxRepo: ReturnType<typeof createMockTransactionRepository>

  beforeEach(() => {
    mockTxRepo = createMockTransactionRepository()
    txService = new TransactionService(mockTxRepo, new BudgetService(createMockBudgetRepository()))
    
    vi.spyOn(txService, 'create').mockResolvedValue(null as any)
    vi.spyOn(txService, 'calculateNextOccurrence').mockReturnValue(new Date('2024-06-01T00:00:00Z'))

    service = new RecurringService(mockTxRepo, txService)
  })

  it('should process due transactions and generate next instances', async () => {
    const dueList = [
      { id: '1', amount: 100, description: 'Netflix', type: 'expense', categoryId: 'cat1', recurrenceRule: { frequency: 'monthly' } },
    ]
    mockTxRepo.findRecurringDue.mockResolvedValue(dueList as any)

    const result = await service.processRecurring(new Date('2024-05-01T00:00:00Z'))
    
    expect(result.processed).toBe(1)
    expect(result.errors).toHaveLength(0)
    
    // Ensure new transaction was created, setting isRecurring to false
    expect(txService.create).toHaveBeenCalledWith(expect.objectContaining({
      isRecurring: false,
      recurrenceRule: null
    }))

    // Ensure parent was pushed forward
    expect(mockTxRepo.updateNextOccurrence).toHaveBeenCalledWith('1', expect.any(Date))
  })

  it('should catch errors gracefully and continue processing', async () => {
    const dueList = [
      { id: '1', recurrenceRule: null }, // no rule => will throw
    ]
    mockTxRepo.findRecurringDue.mockResolvedValue(dueList as any)

    const result = await service.processRecurring(new Date())
    
    expect(result.processed).toBe(0)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('lacks a recurrence rule')
  })
})
