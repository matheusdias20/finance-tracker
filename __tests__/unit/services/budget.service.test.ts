import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BudgetService } from '@/core/services/budget.service'
import { NotFoundError, ValidationError } from '@/infrastructure/errors'

describe('BudgetService Unit Tests (Exhaustive)', () => {
  let service: BudgetService
  let budgetRepo: any

  beforeEach(() => {
    budgetRepo = {
      findByMonth: vi.fn(),
      findByCategoryAndMonth: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
    service = new BudgetService(budgetRepo)
    vi.clearAllMocks()
  })

  describe('getByMonth', () => {
    it('sucesso', async () => {
      budgetRepo.findByMonth.mockResolvedValue([])
      await service.getByMonth('2024-12')
      expect(budgetRepo.findByMonth).toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('sucesso', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue(null)
      budgetRepo.create.mockResolvedValue({ id: '1' })
      const res = await service.create({ categoryId: 'c1', month: new Date(), limitAmount: 100 })
      expect(res.id).toBe('1')
    })

    it('lança ValidationError se já existir', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue({ id: '1' })
      await expect(service.create({ categoryId: 'c1', month: new Date(), limitAmount: 100 })).rejects.toThrow(ValidationError)
    })
  });

  describe('update', () => {
    it('sucesso', async () => {
      budgetRepo.update.mockResolvedValue({ id: '1' })
      const res = await service.update('1', 200)
      expect(res.id).toBe('1')
    })

    it('lança NotFoundError em erro de banco', async () => {
      budgetRepo.update.mockRejectedValue(new Error('fail'))
      await expect(service.update('1', 200)).rejects.toThrow(NotFoundError)
    })
  })

  describe('checkAndNotify', () => {
    it('retorna defaults se não houver orçamento', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue(null)
      const res = await service.checkAndNotify('c1', '2024-12')
      expect(res.exceeded).toBe(false)
      expect(res.budget).toBeNull()
    })

    it('retorna status do orçamento se existir', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue({ isExceeded: true, percentageUsed: 120 })
      const res = await service.checkAndNotify('c1', '2024-12')
      expect(res.exceeded).toBe(true)
      expect(res.percentageUsed).toBe(120)
    })
  })
})
