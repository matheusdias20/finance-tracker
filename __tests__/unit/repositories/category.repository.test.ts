import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CategoryRepository } from '@/infrastructure/database/repositories/category.repository'

import { DatabaseError } from '@/infrastructure/errors'

describe('CategoryRepository Unit Tests (Exhaustive)', () => {
  let repo: CategoryRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    }
    repo = new CategoryRepository(mockDb)
    vi.clearAllMocks()
  })

  describe('findAll', () => {
    it('sucesso', async () => {
      mockDb.orderBy.mockResolvedValueOnce([{ id: '1', name: 'n', type: 'expense' }])
      const res = await repo.findAll()
      expect(res).toHaveLength(1)
    })
    
    it('lida com erro de banco', async () => {
      mockDb.orderBy.mockRejectedValue(new Error('fail'))
      await expect(repo.findAll()).rejects.toThrow(DatabaseError)
    })
  })

  describe('findById', () => {
    it('retorna null se não houver registro', async () => {
      mockDb.limit.mockResolvedValue([])
      const res = await repo.findById('123')
      expect(res).toBeNull()
    })
    
    it('retorna null se registro estiver deletado', async () => {
      mockDb.limit.mockResolvedValue([{ id: '1', deletedAt: new Date() }])
      const res = await repo.findById('1')
      expect(res).toBeNull()
    })

    it('lida com erro de banco', async () => {
      mockDb.limit.mockRejectedValue(new Error('fail'))
      await expect(repo.findById('1')).rejects.toThrow(DatabaseError)
    })
  })

  describe('create', () => {
    it('sucesso com budgetLimit', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', budgetLimit: '100', name: 'n', icon: 'i', color: 'c', type: 'expense' }])
      const res = await repo.create({ name: 'n', icon: 'i', color: 'c', type: 'expense', budgetLimit: 100 })
      expect(res.budgetLimit).toBe(100)
    })

    it('sucesso sem budgetLimit', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', budgetLimit: null, name: 'n', icon: 'i', color: 'c', type: 'expense' }])
      const res = await repo.create({ name: 'n', icon: 'i', color: 'c', type: 'expense' })
      expect(res.budgetLimit).toBeNull()
    })

    it('lida com erro de banco', async () => {
      mockDb.returning.mockRejectedValue(new Error('fail'))
      await expect(repo.create({} as any)).rejects.toThrow(DatabaseError)
    })
  })

  describe('update', () => {
    it('sucesso com todos os campos', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', name: 'new', icon: 'i', color: 'c', budgetLimit: '200' }])
      const res = await repo.update('1', { name: 'new', icon: 'i', color: 'c', budgetLimit: 200 })
      expect(res.name).toBe('new')
    })

    it('sucesso com budgetLimit null', async () => {
      mockDb.returning.mockResolvedValue([{ id: '1', budgetLimit: null }])
      const res = await repo.update('1', { budgetLimit: null })
      expect(res.budgetLimit).toBeNull()
    })

    it('lança erro se record for nulo (não encontrado)', async () => {
      mockDb.returning.mockResolvedValue([])
      await expect(repo.update('1', { name: 'n' })).rejects.toThrow(DatabaseError)
    })

    it('lida com erro de banco', async () => {
      mockDb.returning.mockRejectedValue(new Error('fail'))
      await expect(repo.update('1', {})).rejects.toThrow(DatabaseError)
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

  describe('countTransactions', () => {
    it('sucesso', async () => {
      mockDb.where.mockResolvedValue([{ count: 5 }])
      const res = await repo.countTransactions('1')
      expect(res).toBe(5)
    })

    it('retorna 0 se result for vazio', async () => {
      mockDb.where.mockResolvedValue([])
      const res = await repo.countTransactions('1')
      expect(res).toBe(0)
    })

    it('lida com erro de banco', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.countTransactions('1')).rejects.toThrow(DatabaseError)
    })
  })
})
