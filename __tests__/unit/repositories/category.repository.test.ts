import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CategoryRepository } from '@/infrastructure/database/repositories/category.repository'

describe('CategoryRepository Unit Tests (Mocked DB)', () => {
  let repository: CategoryRepository
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
    
    repository = new CategoryRepository(dbMock)
  })

  it('findAll deve retornar lista de categorias', async () => {
    const mockRecords = [{ id: '1', name: 'Cat 1', icon: 'icon', color: '#000', type: 'expense' }]
    dbMock.then = (onFulfilled: any) => Promise.resolve(mockRecords).then(onFulfilled)
    const result = await repository.findAll()
    expect(result).toHaveLength(1)
  })

  it('findById deve retornar categoria ou nulo', async () => {
    const mockRecord = { id: '1', name: 'Cat 1', icon: 'icon', color: '#000', type: 'expense' }
    dbMock.then = vi.fn()
      .mockImplementationOnce((onFulfilled) => Promise.resolve([mockRecord]).then(onFulfilled))
      .mockImplementationOnce((onFulfilled) => Promise.resolve([]).then(onFulfilled))

    const found = await repository.findById('1')
    expect(found?.id).toBe('1')

    const notFound = await repository.findById('2')
    expect(notFound).toBeNull()
  })

  it('update deve atualizar e retornar categoria', async () => {
    const mockRecord = { id: '1', name: 'Updated', icon: 'icon', color: '#000', type: 'expense' }
    dbMock.then = (onFulfilled: any) => Promise.resolve([mockRecord]).then(onFulfilled)
    const result = await repository.update('1', { name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('softDelete deve marcar como deletada', async () => {
    await repository.softDelete('1')
    expect(dbMock.update).toHaveBeenCalled()
  })

  it('countTransactions deve retornar contagem', async () => {
    dbMock.then = (onFulfilled: any) => Promise.resolve([{ count: 5 }]).then(onFulfilled)
    const result = await repository.countTransactions('1')
    expect(result).toBe(5)
  })
})
