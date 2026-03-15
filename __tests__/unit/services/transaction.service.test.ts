import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionService } from '@/core/services/transaction.service'
import { NotFoundError } from '@/infrastructure/errors'

describe('TransactionService Unit Tests (Exhaustive)', () => {
  let service: TransactionService
  let transactionRepo: any
  let budgetService: any

  beforeEach(() => {
    transactionRepo = {
      findMany: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      sumByCategory: vi.fn(),
      sumByMonth: vi.fn()
    }
    budgetService = {
      checkAndNotify: vi.fn()
    }
    service = new TransactionService(transactionRepo, budgetService)
    vi.clearAllMocks()
  })

  describe('findMany', () => {
    it('sucesso', async () => {
      transactionRepo.findMany.mockResolvedValue({ data: [], total: 0 })
      await service.findMany({})
      expect(transactionRepo.findMany).toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('sucesso', async () => {
      transactionRepo.findById.mockResolvedValue({ id: '1' })
      const res = await service.findById('1')
      expect(res.id).toBe('1')
    })

    it('lança NotFoundError se não existir', async () => {
      transactionRepo.findById.mockResolvedValue(null)
      await expect(service.findById('1')).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('lança erro se recorrente sem regra', async () => {
      await expect(service.create({ isRecurring: true } as any)).rejects.toThrow('Regra de recorrência não definida')
    })

    it('não notifica orçamento se for income', async () => {
      transactionRepo.create.mockResolvedValue({ type: 'income', date: new Date(), categoryId: 'c1' })
      await service.create({ type: 'income', categoryId: 'c1' } as any)
      expect(budgetService.checkAndNotify).not.toHaveBeenCalled()
    })

    it('notifica orçamento se for expense', async () => {
      transactionRepo.create.mockResolvedValue({ type: 'expense', date: new Date(), categoryId: 'c1' })
      await service.create({ type: 'expense', categoryId: 'c1' } as any)
      expect(budgetService.checkAndNotify).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('notifica orçamento se for expense', async () => {
      transactionRepo.findById.mockResolvedValue({ id: '1' })
      transactionRepo.update.mockResolvedValue({ type: 'expense', date: new Date(), categoryId: 'c1' })
      await service.update('1', { amount: 100 })
      expect(budgetService.checkAndNotify).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('sucesso', async () => {
      transactionRepo.findById.mockResolvedValue({ id: '1' })
      await service.delete('1')
      expect(transactionRepo.softDelete).toHaveBeenCalledWith('1')
    })
  })

  describe('others', () => {
    it('getSummaryByCategory', async () => {
      await service.getSummaryByCategory('2024-12')
      expect(transactionRepo.sumByCategory).toHaveBeenCalled()
    })
    it('getMonthlyEvolution', async () => {
      await service.getMonthlyEvolution(6)
      expect(transactionRepo.sumByMonth).toHaveBeenCalled()
    })
  })

  describe('calculateNextOccurrence', () => {
    it('mensal com dia específico', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const rule = { frequency: 'monthly' as const, day: 15 }
      const res = service.calculateNextOccurrence(date, rule)
      expect(res.getDate()).toBe(15)
      expect(res.getMonth()).toBe(1)
    })

    it('weekly', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const res = service.calculateNextOccurrence(date, { frequency: 'weekly' })
      expect(res.getDate()).toBe(8)
    })

    it('yearly', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const rule = { frequency: 'yearly' as const }
      const res = service.calculateNextOccurrence(date, rule)
      expect(res.getFullYear()).toBe(2025)
    })

    it('daily', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const rule = { frequency: 'daily' as const }
      const res = service.calculateNextOccurrence(date, rule)
      expect(res.getDate()).toBe(2)
    })

    it('lanca erro para frequencia invalida', () => {
      expect(() => service.calculateNextOccurrence(new Date(), { frequency: 'invalid' as any })).toThrow('Frequência de recorrência inválida')
    })
  })
})
