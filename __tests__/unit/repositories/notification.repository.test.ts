import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationRepository } from '@/infrastructure/database/repositories/notification.repository'
import { DatabaseError } from '@/infrastructure/errors'

describe('NotificationRepository Unit Tests (Exhaustive)', () => {
  let repo: NotificationRepository
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
    }
    repo = new NotificationRepository(mockDb)
    vi.clearAllMocks()
  })

  describe('findPending', () => {
    it('sucesso', async () => {
      mockDb.where.mockResolvedValue([
        { id: '1', type: 'budget_exceeded', status: 'pending', scheduledAt: new Date(), payload: {} }
      ])
      const res = await repo.findPending()
      expect(res).toHaveLength(1)
    })

    it('lida com erro de banco', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.findPending()).rejects.toThrow(DatabaseError)
    })
  })

  describe('wasAlreadySentToday', () => {
    it('retorna true se count > 0', async () => {
      mockDb.where.mockResolvedValue([{ count: 1 }])
      const res = await repo.wasAlreadySentToday('budget_exceeded', 'ref-1')
      expect(res).toBe(true)
    })

    it('retorna false se count is 0', async () => {
      mockDb.where.mockResolvedValue([{ count: 0 }])
      const res = await repo.wasAlreadySentToday('budget_exceeded', 'ref-1')
      expect(res).toBe(false)
    })

    it('handles null result', async () => {
      mockDb.where.mockResolvedValue([])
      const res = await repo.wasAlreadySentToday('budget_exceeded', 'ref-1')
      expect(res).toBe(false)
    })

    it('lida com erro de banco', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.wasAlreadySentToday('budget_exceeded', 'r')).rejects.toThrow(DatabaseError)
    })
  })

  describe('markSent', () => {
    it('sucesso', async () => {
      mockDb.where.mockResolvedValue(undefined)
      await repo.markSent('1')
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('lida com erro', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.markSent('1')).rejects.toThrow(DatabaseError)
    })
  })

  describe('markFailed', () => {
    it('sucesso', async () => {
      mockDb.where.mockResolvedValue(undefined)
      await repo.markFailed('1')
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('lida com erro', async () => {
      mockDb.where.mockRejectedValue(new Error('fail'))
      await expect(repo.markFailed('1')).rejects.toThrow(DatabaseError)
    })
  })

  describe('create', () => {
    it('sucesso', async () => {
      mockDb.returning.mockResolvedValue([
        { id: '1', type: 'budget_exceeded', status: 'pending', scheduledAt: new Date(), payload: {} }
      ])
      const res = await repo.create('budget_exceeded', {}, new Date())
      expect(res.id).toBe('1')
    })

    it('lida com erro', async () => {
      mockDb.returning.mockRejectedValue(new Error('fail'))
      await expect(repo.create('type' as any, {}, new Date())).rejects.toThrow(DatabaseError)
    })
  })
})
