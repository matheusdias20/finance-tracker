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

  it('getAll: retorna todas as categorias', async () => {
    const categories = [{ id: '1', name: 'Alimentação' }, { id: '2', name: 'Transporte' }]
    vi.mocked(repo.findAll).mockResolvedValue(categories as any)
    const result = await service.getAll()
    expect(result).toEqual(categories)
    expect(repo.findAll).toHaveBeenCalledTimes(1)
  })

  it('create: cria categoria e retorna o resultado do repo', async () => {
    const newCat = { id: '3', name: 'Saúde', icon: '❤️', color: '#ef4444', type: 'expense' as const }
    vi.mocked(repo.create).mockResolvedValue(newCat as any)
    const result = await service.create({ name: 'Saúde', icon: '❤️', color: '#ef4444', type: 'expense' })
    expect(result).toEqual(newCat)
    expect(repo.create).toHaveBeenCalledTimes(1)
  })

  it('update: atualiza categoria quando ela existe', async () => {
    vi.mocked(repo.findById).mockResolvedValue({ id: '1' } as any)
    const updated = { id: '1', name: 'Alimentação Editada' }
    vi.mocked(repo.update).mockResolvedValue(updated as any)
    const result = await service.update('1', { name: 'Alimentação Editada' })
    expect(result).toEqual(updated)
    expect(repo.update).toHaveBeenCalledWith('1', { name: 'Alimentação Editada' })
  })

  it('getById: retorna categoria quando ela existe', async () => {
    const cat = { id: '1', name: 'Alimentação' }
    vi.mocked(repo.findById).mockResolvedValue(cat as any)
    const result = await service.getById('1')
    expect(result).toEqual(cat)
  })
})
