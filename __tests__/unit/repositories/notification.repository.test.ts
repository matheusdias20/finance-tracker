import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationRepository } from '@/infrastructure/database/repositories/notification.repository'
import { DatabaseError } from '@/infrastructure/errors'

describe('NotificationRepository Unit Tests (Mocked DB)', () => {
  let repository: NotificationRepository
  let dbMock: any

  beforeEach(() => {
    dbMock = {
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
      then: (onFulfilled: any) => Promise.resolve([]).then(onFulfilled),
      catch: (onRejected: any) => Promise.resolve([]).catch(onRejected)
    }
    repository = new NotificationRepository(dbMock)
  })

  it('findPending deve retornar notificações pendentes', async () => {
    const mockRecord = { id: 'n1', type: 'budget_exceeded', status: 'pending', scheduledAt: new Date(), payload: {} }
    dbMock.then = (onFulfilled: any) => Promise.resolve([mockRecord]).then(onFulfilled)
    const result = await repository.findPending()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('n1')
  })

  it('wasAlreadySentToday deve retornar boolean', async () => {
    dbMock.then = (onFulfilled: any) => Promise.resolve([{ count: 1 }]).then(onFulfilled)
    const result = await repository.wasAlreadySentToday('budget_exceeded', 'ref-1')
    expect(result).toBe(true)
  })

  it('markSent deve atualizar status', async () => {
    await repository.markSent('n1')
    expect(dbMock.update).toHaveBeenCalled()
  })

  it('markFailed deve atualizar status', async () => {
    await repository.markFailed('n1')
    expect(dbMock.update).toHaveBeenCalled()
  })

  it('create deve inserir e retornar notificação', async () => {
    const mockRecord = { id: 'n1', type: 'budget_exceeded', status: 'pending', scheduledAt: new Date(), payload: {} }
    dbMock.then = (onFulfilled: any) => Promise.resolve([mockRecord]).then(onFulfilled)
    const result = await repository.create('budget_exceeded', { ref: '1' }, new Date())
    expect(result.id).toBe('n1')
  })

  it('deve lançar DatabaseError em caso de falha', async () => {
    dbMock.then = (_onFulfilled: any, onRejected: any) => Promise.reject(new Error('fail')).catch(onRejected)
    await expect(repository.findPending()).rejects.toThrow(DatabaseError)
  })
})
