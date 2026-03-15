import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TransactionService } from '@/core/services/transaction.service'
import { BudgetService } from '@/core/services/budget.service'
import { mockTransactionRepo, mockBudgetRepo } from '../../mocks/repositories.mock'
import { NotFoundError } from '@/infrastructure/errors'
import type { RecurrenceRule } from '@/core/entities/transaction.entity'

describe('TransactionService', () => {
  let service: TransactionService
  let budgetService: BudgetService
  let mockTxRepo: ReturnType<typeof mockTransactionRepo>
  let mockBudgetRepoData: ReturnType<typeof mockBudgetRepo>

  beforeEach(() => {
    mockTxRepo = mockTransactionRepo()
    mockBudgetRepoData = mockBudgetRepo()
    budgetService = new BudgetService(mockBudgetRepoData)
    vi.spyOn(budgetService, 'checkAndNotify').mockResolvedValue({ exceeded: false, percentageUsed: 0, budget: null })
    
    service = new TransactionService(mockTxRepo, budgetService)
  })

  it('should fetch paginated transactions', async () => {
    const fakeData = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    vi.mocked(mockTxRepo.findMany).mockResolvedValue(fakeData)
    const result = await service.findMany({})
    expect(result).toEqual(fakeData)
  })

  it('should find by id or throw NotFoundError', async () => {
    vi.mocked(mockTxRepo.findById).mockResolvedValueOnce({ id: '1' } as any)
    const result = await service.findById('1')
    expect(result.id).toBe('1')

    vi.mocked(mockTxRepo.findById).mockResolvedValueOnce(null)
    await expect(service.findById('2')).rejects.toThrow(NotFoundError)
  })

  it('create() should throw if isRecurring is true without recurrenceRule', async () => {
    await expect(service.create({
      amount: 10, description: 'test', date: new Date(), type: 'expense', categoryId: 'cat1', isRecurring: true
    })).rejects.toThrow('Regra de recorrência não definida')
  })

  it('create() should call checkAndNotify if expense', async () => {
    vi.mocked(mockTxRepo.create).mockResolvedValue({ type: 'expense', date: new Date('2024-05-15T00:00:00Z'), categoryId: 'cat1' } as any)
    
    await service.create({
      amount: 10, description: 'test', date: new Date('2024-05-15T00:00:00Z'), type: 'expense', categoryId: 'cat1'
    })
    
    expect(budgetService.checkAndNotify).toHaveBeenCalledWith('cat1', '2024-05')
  })

  it('create() should NOT call checkAndNotify if income', async () => {
    vi.mocked(mockTxRepo.create).mockResolvedValue({ type: 'income', date: new Date(), categoryId: 'cat1' } as any)
    
    await service.create({
      amount: 10, description: 'test', date: new Date(), type: 'income', categoryId: 'cat1'
    })
    
    expect(budgetService.checkAndNotify).not.toHaveBeenCalled()
  })

  it('update() should call checkAndNotify if expense', async () => {
    vi.mocked(mockTxRepo.findById).mockResolvedValue({ id: '1' } as any)
    vi.mocked(mockTxRepo.update).mockResolvedValue({ id: '1', type: 'expense', date: new Date('2024-10-10T00:00:00Z'), categoryId: 'cat2' } as any)
    
    await service.update('1', { amount: 100 })
    expect(budgetService.checkAndNotify).toHaveBeenCalledWith('cat2', '2024-10')
  })

  it('delete() should perform soft delete', async () => {
    vi.mocked(mockTxRepo.findById).mockResolvedValue({ id: '1' } as any)
    await service.delete('1')
    expect(mockTxRepo.softDelete).toHaveBeenCalledWith('1')
  })

  it('calculateNextOccurrence() handles daily, weekly, monthly and yearly correctly', () => {
    const baseDate = new Date('2024-01-05T12:00:00Z')
    
    expect(service.calculateNextOccurrence(baseDate, { frequency: 'daily' }).toISOString()).toContain('2024-01-06')
    expect(service.calculateNextOccurrence(baseDate, { frequency: 'weekly' }).toISOString()).toContain('2024-01-12')
    
    // Monthly changing day
    const monthlyRule: RecurrenceRule = { frequency: 'monthly', day: 20 }
    expect(service.calculateNextOccurrence(baseDate, monthlyRule).toISOString()).toContain('2024-02-20')
    
    expect(service.calculateNextOccurrence(baseDate, { frequency: 'yearly' }).toISOString()).toContain('2025-01-05')
  })

  it('calculateNextOccurrence() throws on invalid frequency', () => {
    expect(() => service.calculateNextOccurrence(new Date(), { frequency: 'invalid' as any }))
      .toThrow('Frequência de recorrência inválida')
  })
})
