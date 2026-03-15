import { describe, it, expect, beforeEach } from 'vitest'
import { BudgetService } from '../../../src/core/services/budget.service'
import { createMockBudgetRepository } from './mocks'
import { NotFoundError, ValidationError } from '../../../src/infrastructure/errors'

describe('BudgetService', () => {
  let service: BudgetService
  let mockRepo: ReturnType<typeof createMockBudgetRepository>

  beforeEach(() => {
    mockRepo = createMockBudgetRepository()
    service = new BudgetService(mockRepo)
  })

  it('should fetch budgets by month', async () => {
    mockRepo.findByMonth.mockResolvedValue([])
    const result = await service.getByMonth('2024-01')
    expect(result).toEqual([])
    expect(mockRepo.findByMonth).toHaveBeenCalledWith('2024-01')
  })

  it('should create new budget if none exists for category/month', async () => {
    mockRepo.findByCategoryAndMonth.mockResolvedValue(null)
    const fakeInput = { categoryId: '1', month: new Date('2024-05-01T00:00:00Z'), limitAmount: 500 }
    mockRepo.create.mockResolvedValue({ id: '1', ...fakeInput, createdAt: new Date() })

    await service.create(fakeInput)
    expect(mockRepo.create).toHaveBeenCalledWith(fakeInput)
    expect(mockRepo.findByCategoryAndMonth).toHaveBeenCalledWith('1', '2024-05')
  })

  it('should throw ValidationError if budget already exists', async () => {
    mockRepo.findByCategoryAndMonth.mockResolvedValue({} as any)
    const fakeInput = { categoryId: '1', month: new Date('2024-05-01T00:00:00Z'), limitAmount: 500 }

    await expect(service.create(fakeInput)).rejects.toThrow(ValidationError)
  })

  it('should update budget and throw NotFoundError on exception', async () => {
    mockRepo.update.mockResolvedValue({ id: '1', limitAmount: 800 } as any)
    const result = await service.update('1', 800)
    expect(result.limitAmount).toBe(800)

    mockRepo.update.mockRejectedValue(new Error('DB Error'))
    await expect(service.update('2', 900)).rejects.toThrow(NotFoundError)
  })

  it('should checkAndNotify gracefully if budget missing', async () => {
    mockRepo.findByCategoryAndMonth.mockResolvedValue(null)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result).toEqual({ exceeded: false, percentageUsed: 0, budget: null })
  })

  it('should checkAndNotify calculating properly if budget exists', async () => {
    mockRepo.findByCategoryAndMonth.mockResolvedValue({
      id: 'b1', isExceeded: true, percentageUsed: 120, spentAmount: 120, limitAmount: 100
    } as any)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.exceeded).toBe(true)
    expect(result.percentageUsed).toBe(120)
  })
})
