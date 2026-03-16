import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionRepository } from '@/infrastructure/database/repositories/transaction.repository'

import { DatabaseError } from '@/infrastructure/errors'

describe('TransactionRepository Unit Tests (Exhaustive)', () => {
  let repo: TransactionRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      asc: vi.fn().mockReturnThis(),
      desc: vi.fn().mockReturnThis(),
    }
    repo = new TransactionRepository(mockDb)
    vi.clearAllMocks()
  })

  describe('findMany', () => {
    it('sucesso com todos os filtros', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 100 }])
      mockDb.offset.mockResolvedValueOnce([
        { 
          transaction: { id: '1', amount: '100', description: 'd', date: '2024-12-01', type: 'expense', categoryId: 'c1' },
          categoryName: 'Cat 1',
          categoryColor: '#000',
          categoryIcon: 'icon'
        }
      ])
      
      const res = await repo.findMany({ 
        month: '2024-12', 
        type: 'expense', 
        categoryId: 'c1', 
        search: 'test',
        page: 2,
        limit: 10
      })
      expect(res.data).toHaveLength(1)
      expect(res.totalPages).toBe(10)
    })

    it('sucesso sem filtros (defaults)', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 5 }])
      mockDb.offset.mockResolvedValueOnce([])
      const res = await repo.findMany({})
      expect(res.total).toBe(5)
      expect(res.page).toBe(1)
      expect(res.limit).toBe(20)
    })

    it('total zero se count for nulo', async () => {
      mockDb.where.mockResolvedValueOnce([null])
      mockDb.offset.mockResolvedValueOnce([])
      const res = await repo.findMany({})
      expect(res.total).toBe(0)
    })

    it('lida com erro de banco', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.findMany({})).rejects.toThrow(DatabaseError)
    })
  });

  describe('findById', () => {
    it('retorna null se não houver registro', async () => {
      mockDb.limit.mockResolvedValue([])
      const res = await repo.findById('123')
      expect(res).toBeNull()
    })

    it('lida com erro de banco', async () => {
      mockDb.limit.mockRejectedValue(new Error('fail'))
      await expect(repo.findById('123')).rejects.toThrow(DatabaseError)
    })
  })

  describe('findRecurringDue', () => {
    it('sucesso', async () => {
      mockDb.where.mockResolvedValue([{ id: '1', amount: '100', description: 'd', date: '2024-12-01', type: 'expense', categoryId: 'c1' }])
      const res = await repo.findRecurringDue(new Date())
      expect(res).toHaveLength(1)
    })

    it('lida com erro de banco', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.findRecurringDue(new Date())).rejects.toThrow(DatabaseError)
    })
  })

  describe('create', () => {
    it('sucesso', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', amount: '100', description: 'd', date: '2024-12-01', type: 'expense', categoryId: 'c1' }])
      const res = await repo.create({ amount: 100, description: 'd', date: new Date(), type: 'expense', categoryId: 'c1' })
      expect(res.id).toBe('1')
    })
    
    it('sucesso recorrente', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', amount: '100', description: 'd', date: '2024-12-01', type: 'expense', categoryId: 'c1', isRecurring: true }])
      const res = await repo.create({ 
        amount: 100, description: 'd', date: new Date(), type: 'expense', categoryId: 'c1', 
        isRecurring: true, recurrenceRule: { frequency: 'monthly' } 
      })
      expect(res.isRecurring).toBe(true)
    })
  })

  describe('update', () => {
    it('lança erro se record não existir', async () => {
      mockDb.returning.mockResolvedValue([])
      await expect(repo.update('1', { amount: 100 })).rejects.toThrow(DatabaseError)
    })

    it('sucesso update parcial', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', amount: '100', description: 'd', date: '2024-12-01', type: 'expense', categoryId: 'c1' }])
      const res = await repo.update('1', { amount: 100, description: 'new' })
      expect(res.id).toBe('1')
    })
  })

  describe('updateNextOccurrence', () => {
    it('sucesso', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', amount: '100', nextOccurrence: '2025-01-01', description: 'd', date: '2024-12-01', type: 'expense', categoryId: 'c1' }])
      const res = await repo.updateNextOccurrence('1', new Date())
      expect(res.id).toBe('1')
    })

    it('lida com erro de banco', async () => {
      mockDb.returning.mockRejectedValue(new Error('fail'))
      await expect(repo.updateNextOccurrence('1', new Date())).rejects.toThrow(DatabaseError)
    })
  })

  describe('softDelete', () => {
    it('sucesso', async () => {
      mockDb.where.mockResolvedValue(undefined)
      await repo.softDelete('1')
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('lida com erro de banco', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.softDelete('1')).rejects.toThrow(DatabaseError)
    })
  })

  describe('sumByCategory', () => {
    it('sucesso com resultados e sem resultados', async () => {
      mockDb.groupBy.mockResolvedValue([
        { categoryId: 'c1', categoryName: 'N', totalAmount: '100', transactionCount: 2 }
      ])
      const res = await repo.sumByCategory('2024-12')
      expect(res[0].percentage).toBe(100)
      
      mockDb.groupBy.mockResolvedValue([])
      const res2 = await repo.sumByCategory('2024-12')
      expect(res2).toHaveLength(0)
    })

    it('lida com erro de banco', async () => {
      mockDb.groupBy.mockRejectedValue(new Error('fail'))
      await expect(repo.sumByCategory('2024-12')).rejects.toThrow(DatabaseError)
    })
  })

  describe('sumByMonth', () => {
    it('sucesso', async () => {
      mockDb.orderBy.mockResolvedValue([
        { month: '2024-12', income: '1000', expense: '500' }
      ])
      const res = await repo.sumByMonth(6)
      expect(res[0].balance).toBe(500)
    })

    it('lida com erro de banco', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('fail'))
      await expect(repo.sumByMonth(6)).rejects.toThrow(DatabaseError)
    })
  })

  describe('getHistoryByCategory', () => {
    it('sucesso', async () => {
      mockDb.orderBy.mockResolvedValue([
        { month: '2024-12', amount: '500' }
      ])
      const res = await repo.getHistoryByCategory('c1', 6)
      expect(res[0].amount).toBe(500)
    })

    it('lida com erro de banco', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('fail'))
      await expect(repo.getHistoryByCategory('c1', 6)).rejects.toThrow(DatabaseError)
    })
  })

  describe('mapToEntity branch coverage', () => {
    it('handles nullable fields fallback', async () => {
      mockDb.limit.mockResolvedValue([
        { 
          id: '1', amount: '100', description: 'd', date: '2024-12-01', type: 'expense', categoryId: 'c1',
          isRecurring: null, recurrenceRule: null, nextOccurrence: null, 
          createdAt: null, updatedAt: null, deletedAt: null 
        }
      ])
      const res = await repo.findById('1')
      expect(res?.isRecurring).toBe(false)
      expect(res?.createdAt).toBeInstanceOf(Date)
    })
  })
})
