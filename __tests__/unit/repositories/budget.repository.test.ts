import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BudgetRepository } from '@/infrastructure/database/repositories/budget.repository'

import { DatabaseError } from '@/infrastructure/errors'

describe('BudgetRepository Unit Tests (Exhaustive)', () => {
  let repo: BudgetRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    }
    repo = new BudgetRepository(mockDb)
    vi.clearAllMocks()
  })

  describe('findByMonth', () => {
    it('sucesso com resultados', async () => {
      // O query termina em groupBy()
      mockDb.groupBy.mockResolvedValueOnce([{ id: '1', categoryId: 'c1', month: '2024-12-01', limitAmount: '100', spentAmount: 50 }])
      const res = await repo.findByMonth('2024-12')
      expect(res[0].percentageUsed).toBe(50)
      expect(res[0].isExceeded).toBe(false)
    })

    it('lida com erro de banco', async () => {
      mockDb.groupBy.mockRejectedValue(new Error('db fail'))
      await expect(repo.findByMonth('2024-12')).rejects.toThrow(DatabaseError)
    })
  })

  describe('findByCategoryAndMonth', () => {
    it('retorna null se não encontrar', async () => {
      // O query termina em limit(1)
      mockDb.limit.mockResolvedValue([])
      const res = await repo.findByCategoryAndMonth('c1', '2024-12')
      expect(res).toBeNull()
    })

    it('branch coverage: limitAmount zero', async () => {
      mockDb.limit.mockResolvedValue([{ id: '1', categoryId: 'c1', month: '2024-12-01', limitAmount: '0', spentAmount: 50 }])
      const res = await repo.findByCategoryAndMonth('c1', '2024-12')
      expect(res?.percentageUsed).toBe(0)
    })
  })

  describe('update', () => {
    it('lança erro se record não existir', async () => {
      mockDb.returning.mockResolvedValue([])
      await expect(repo.update('123', 200)).rejects.toThrow(DatabaseError)
    })

    it('sucesso no update', async () => {
      mockDb.returning.mockResolvedValue([{ id: '123', categoryId: 'c1', month: '2024-12-01', limitAmount: '200' }])
      const res = await repo.update('123', 200)
      expect(res.limitAmount).toBe(200)
    })
  })
})
