import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionRepository } from '@/infrastructure/database/repositories/transaction.repository'
import { DatabaseError } from '@/infrastructure/errors'

describe('TransactionRepository Unit Tests (Mocked DB)', () => {
  let repository: TransactionRepository
  let dbMock: any

  beforeEach(() => {
    dbMock = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      then: (onFulfilled: any) => Promise.resolve([]).then(onFulfilled),
      catch: (onRejected: any) => Promise.resolve([]).catch(onRejected)
    }
    
    repository = new TransactionRepository(dbMock)
  })

  it('findMany deve filtrar por mês, tipo e categoria', async () => {
    dbMock.then = (onFulfilled: any) => {
      // First call for count, second for data
      const result = onFulfilled === undefined ? undefined : [{ count: 1 }];
      return Promise.resolve(result || [{ id: '1', amount: '10' }]).then(onFulfilled);
    };

    // Smart mock for multiple then calls
    let callCount = 0;
    dbMock.then = vi.fn().mockImplementation((onFulfilled) => {
      callCount++;
      if (callCount === 1) return Promise.resolve([{ count: 1 }]).then(onFulfilled);
      return Promise.resolve([{ id: '1', amount: '10', date: '2024-12-01' }]).then(onFulfilled);
    });

    const result = await repository.findMany({ 
      month: '2024-12', 
      type: 'expense', 
      categoryId: 'uuid-1',
      search: 'test'
    })
    expect(result.data).toHaveLength(1)
    expect(dbMock.where).toHaveBeenCalled()
  })

  it('findById deve retornar nulo se não encontrar', async () => {
    dbMock.then = (onFulfilled: any) => Promise.resolve([]).then(onFulfilled)
    const result = await repository.findById('id-1')
    expect(result).toBeNull()
  })

  it('findRecurringDue deve retornar transações pendentes', async () => {
    dbMock.then = (onFulfilled: any) => Promise.resolve([{ id: '1', amount: '10', date: '2024-12-01' }]).then(onFulfilled)
    const result = await repository.findRecurringDue(new Date())
    expect(result).toHaveLength(1)
  })

  it('update deve lançar erro se não encontrar registro', async () => {
    dbMock.then = (onFulfilled: any) => Promise.resolve([]).then(onFulfilled)
    await expect(repository.update('id-1', { amount: 100 })).rejects.toThrow('Transaction not found for update')
  })

  it('updateNextOccurrence deve atualizar data', async () => {
    dbMock.then = (onFulfilled: any) => Promise.resolve([{ id: '1', amount: '10', date: '2024-12-01' }]).then(onFulfilled)
    await repository.updateNextOccurrence('id-1', new Date())
    expect(dbMock.update).toHaveBeenCalled()
  })

  it('softDelete deve atualizar deletedAt', async () => {
    await repository.softDelete('id-1')
    expect(dbMock.update).toHaveBeenCalled()
  })

  it('sumByCategory deve retornar relatório', async () => {
    const mockRecords = [{ categoryId: 'c1', totalAmount: '100', transactionCount: 1 }]
    dbMock.then = (onFulfilled: any) => Promise.resolve(mockRecords).then(onFulfilled)
    const result = await repository.sumByCategory('2024-12')
    expect(result).toHaveLength(1)
  })

  it('sumByMonth deve retornar evolução', async () => {
    const mockRecords = [{ month: '2024-12', income: '1000', expense: '500' }]
    dbMock.then = (onFulfilled: any) => Promise.resolve(mockRecords).then(onFulfilled)
    const result = await repository.sumByMonth(12)
    expect(result).toHaveLength(1)
  })

  it('getHistoryByCategory deve retornar histórico', async () => {
    const mockRecords = [{ month: '2024-12', amount: '100' }]
    dbMock.then = (onFulfilled: any) => Promise.resolve(mockRecords).then(onFulfilled)
    const result = await repository.getHistoryByCategory('c1', 6)
    expect(result).toHaveLength(1)
  })

  it('deve lançar DatabaseError em caso de falha genérica', async () => {
    dbMock.then = (_onFulfilled: any, onRejected: any) => Promise.reject(new Error('fail')).catch(onRejected)
    await expect(repository.findById('id-1')).rejects.toThrow(DatabaseError)
  })
})
