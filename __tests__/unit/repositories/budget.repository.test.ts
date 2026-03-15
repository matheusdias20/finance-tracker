import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BudgetRepository } from '@/infrastructure/database/repositories/budget.repository'
import { DatabaseError } from '@/infrastructure/errors'

describe('BudgetRepository Unit Tests (Mocked DB)', () => {
  let repository: BudgetRepository
  let dbMock: any

  beforeEach(() => {
    dbMock = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (onFulfilled: any) => Promise.resolve([]).then(onFulfilled),
      catch: (onRejected: any) => Promise.resolve([]).catch(onRejected)
    }
    
    repository = new BudgetRepository(dbMock)
  })

  it('findByCategoryAndMonth deve retornar orçamento', async () => {
    const mockRecord = { id: '1', categoryId: 'c1', month: '2024-12-01', limitAmount: '100', spentAmount: 50 }
    dbMock.then = (onFulfilled: any) => Promise.resolve([mockRecord]).then(onFulfilled)

    const result = await repository.findByCategoryAndMonth('c1', '2024-12')
    expect(result?.id).toBe('1')
    expect(result?.spentAmount).toBe(50)
  })

  it('findByMonth deve retornar lista de orçamentos', async () => {
    const mockRecords = [{ id: '1', categoryId: 'c1', month: '2024-12-01', limitAmount: '100', spentAmount: '50' }]
    dbMock.then = (onFulfilled: any) => Promise.resolve(mockRecords).then(onFulfilled)

    const result = await repository.findByMonth('2024-12')
    expect(result).toHaveLength(1)
  })

  it('create deve criar novo orçamento', async () => {
    const input = { categoryId: 'c1', month: new Date(), limitAmount: 100 }
    const mockRecord = { id: '1', categoryId: 'c1', month: '2024-12-01', limitAmount: '100' }
    dbMock.then = (onFulfilled: any) => Promise.resolve([mockRecord]).then(onFulfilled)

    const result = await repository.create(input)
    expect(result.id).toBe('1')
  })

  it('update deve atualizar limite', async () => {
    const mockRecord = { id: '1', categoryId: 'c1', month: '2024-12-01', limitAmount: '200' }
    dbMock.then = (onFulfilled: any) => Promise.resolve([mockRecord]).then(onFulfilled)

    const result = await repository.update('1', 200)
    expect(result.limitAmount).toBe(200)
  })

  it('deve lançar DatabaseError em caso de falha', async () => {
    dbMock.then = (_onFulfilled: any, onRejected: any) => Promise.reject(new Error('fail')).catch(onRejected)
    await expect(repository.findByMonth('2024-12')).rejects.toThrow(DatabaseError)
  })
})
