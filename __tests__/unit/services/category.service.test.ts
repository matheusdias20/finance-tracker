import { describe, it, expect, beforeEach } from 'vitest'
import { CategoryService } from '../../../src/core/services/category.service'
import { createMockCategoryRepository } from './mocks'
import { NotFoundError, ValidationError } from '../../../src/infrastructure/errors'

describe('CategoryService', () => {
  let service: CategoryService
  let mockRepo: ReturnType<typeof createMockCategoryRepository>

  beforeEach(() => {
    mockRepo = createMockCategoryRepository()
    service = new CategoryService(mockRepo)
  })

  it('should fetch all categories', async () => {
    mockRepo.findAll.mockResolvedValue([])
    const result = await service.getAll()
    expect(result).toEqual([])
    expect(mockRepo.findAll).toHaveBeenCalled()
  })

  it('should fetch category by id', async () => {
    const fakeCategory = { id: '1', name: 'Test', icon: 'test', color: '#000', type: 'expense' as const, budgetLimit: null, createdAt: new Date(), deletedAt: null }
    mockRepo.findById.mockResolvedValue(fakeCategory)
    
    const result = await service.getById('1')
    expect(result).toEqual(fakeCategory)
  })

  it('should throw NotFoundError if category is not found by ID', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(service.getById('999')).rejects.toThrow(NotFoundError)
  })

  it('should create a new category', async () => {
    const fakeInput = { name: 'Test', icon: 'test', color: '#000', type: 'expense' as const }
    const fakeCategory = { id: '1', ...fakeInput, budgetLimit: null, createdAt: new Date(), deletedAt: null }
    mockRepo.create.mockResolvedValue(fakeCategory)

    const result = await service.create(fakeInput)
    expect(result).toEqual(fakeCategory)
    expect(mockRepo.create).toHaveBeenCalledWith(fakeInput)
  })

  it('should update a category if it exists', async () => {
    const fakeCategory = { id: '1', name: 'Test', icon: 'test', color: '#000', type: 'expense' as const, budgetLimit: null, createdAt: new Date(), deletedAt: null }
    mockRepo.findById.mockResolvedValue(fakeCategory)
    mockRepo.update.mockResolvedValue({ ...fakeCategory, name: 'Updated' })

    const result = await service.update('1', { name: 'Updated' })
    expect(result.name).toBe('Updated')
    expect(mockRepo.update).toHaveBeenCalledWith('1', { name: 'Updated' })
  })

  it('should delete a category if no transactions are linked', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1', name: 'Test', icon: 'test', color: '#000', type: 'expense', budgetLimit: null, createdAt: new Date(), deletedAt: null })
    mockRepo.countTransactions.mockResolvedValue(0)
    
    await service.delete('1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith('1')
  })

  it('should throw ValidationError on delete if transactions are linked', async () => {
    mockRepo.findById.mockResolvedValue({ id: '1', name: 'Test', icon: 'test', color: '#000', type: 'expense', budgetLimit: null, createdAt: new Date(), deletedAt: null })
    mockRepo.countTransactions.mockResolvedValue(5)
    
    await expect(service.delete('1')).rejects.toThrow(ValidationError)
    expect(mockRepo.softDelete).not.toHaveBeenCalled()
  })
})
