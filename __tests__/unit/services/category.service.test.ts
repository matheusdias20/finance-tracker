import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CategoryService } from '@/core/services/category.service'
import { mockCategoryRepo } from '../../mocks/repositories.mock'
import { NotFoundError, ValidationError } from '@/infrastructure/errors'

describe('CategoryService', () => {
  let service: CategoryService
  let repo: ReturnType<typeof mockCategoryRepo>

  beforeEach(() => {
    repo = mockCategoryRepo()
    service = new CategoryService(repo)
  })

  it('delete: lança ValidationError se categoria tem transações vinculadas', async () => {
    vi.mocked(repo.findById).mockResolvedValue({ id: '1' } as any)
    vi.mocked(repo.countTransactions).mockResolvedValue(3)
    await expect(service.delete('1')).rejects.toThrow(ValidationError)
  })

  it('delete: executa softDelete se categoria não tem transações', async () => {
    vi.mocked(repo.findById).mockResolvedValue({ id: '1' } as any)
    vi.mocked(repo.countTransactions).mockResolvedValue(0)
    await service.delete('1')
    expect(repo.softDelete).toHaveBeenCalledWith('1')
  })

  it('getById: lança NotFoundError se categoria não existe', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null)
    await expect(service.getById('999')).rejects.toThrow(NotFoundError)
  })

  it('update: lança NotFoundError se categoria não existe', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null)
    await expect(service.update('999', {})).rejects.toThrow(NotFoundError)
  })
})
