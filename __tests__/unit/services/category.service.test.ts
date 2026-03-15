import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CategoryService } from '@/core/services/category.service'
import { NotFoundError, ValidationError } from '@/infrastructure/errors'

describe('CategoryService Unit Tests (Exhaustive)', () => {
  let service: CategoryService
  let categoryRepo: any

  beforeEach(() => {
    categoryRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      countTransactions: vi.fn()
    }
    service = new CategoryService(categoryRepo)
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('sucesso', async () => {
      categoryRepo.findAll.mockResolvedValue([])
      await service.getAll()
      expect(categoryRepo.findAll).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('sucesso', async () => {
      categoryRepo.findById.mockResolvedValue({ id: '1' })
      const res = await service.getById('1')
      expect(res.id).toBe('1')
    })

    it('lança NotFoundError se não existir', async () => {
      categoryRepo.findById.mockResolvedValue(null)
      await expect(service.getById('1')).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('sucesso se sem transações', async () => {
      categoryRepo.findById.mockResolvedValue({ id: '1' })
      categoryRepo.countTransactions.mockResolvedValue(0)
      await service.delete('1')
      expect(categoryRepo.softDelete).toHaveBeenCalledWith('1')
    })

    it('lança ValidationError se houver transações', async () => {
      categoryRepo.findById.mockResolvedValue({ id: '1' })
      categoryRepo.countTransactions.mockResolvedValue(5)
      await expect(service.delete('1')).rejects.toThrow(ValidationError)
      expect(categoryRepo.softDelete).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('sucesso', async () => {
      categoryRepo.findById.mockResolvedValue({ id: '1' })
      categoryRepo.update.mockResolvedValue({ id: '1', name: 'new' })
      const res = await service.update('1', { name: 'new' })
      expect(res.name).toBe('new')
    })
  })
})
