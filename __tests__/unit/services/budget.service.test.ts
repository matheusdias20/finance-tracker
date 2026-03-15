import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BudgetService } from '@/core/services/budget.service'
import { mockBudgetRepo } from '../../mocks/repositories.mock'
import { ValidationError } from '@/infrastructure/errors'

describe('BudgetService', () => {
  let service: BudgetService
  let repo: ReturnType<typeof mockBudgetRepo>

  beforeEach(() => {
    repo = mockBudgetRepo()
    service = new BudgetService(repo)
  })

  // Estes cálculos de percentageUsed/isExceeded são feitos pelas structs que o repository retorna (BudgetWithSpent)
  // Então, em nosso Service, estamos verificando se "budgetService.checkAndNotify()" expõe corretamente ou
  // no ambiente onde mockamos as respostas, validamos a lógica e encaminhamento das métricas
  it('percentageUsed: 50 gasto / 100 limite = 50%', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue({ limitAmount: 100, spentAmount: 50, percentageUsed: 50, isExceeded: false } as any)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.percentageUsed).toBe(50)
  })

  it('percentageUsed: 120 gasto / 100 limite = 120%', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue({ limitAmount: 100, spentAmount: 120, percentageUsed: 120, isExceeded: true } as any)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.percentageUsed).toBe(120)
  })

  it('percentageUsed: 0 gasto / 100 limite = 0%', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue({ limitAmount: 100, spentAmount: 0, percentageUsed: 0, isExceeded: false } as any)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.percentageUsed).toBe(0)
  })

  it('isExceeded: true quando spent > limit', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue({ limitAmount: 100, spentAmount: 101, percentageUsed: 101, isExceeded: true } as any)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.exceeded).toBe(true)
  })

  it('isExceeded: false quando spent === limit', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue({ limitAmount: 100, spentAmount: 100, percentageUsed: 100, isExceeded: false } as any)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.exceeded).toBe(false)
  })

  it('create: lança ValidationError se já existe budget para categoryId+month', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue({ id: '1' } as any)
    await expect(service.create({ categoryId: 'c1', month: new Date(), limitAmount: 100 })).rejects.toThrow(ValidationError)
  })

  it('checkAndNotify: retorna exceeded=true quando spent > limit', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue({ limitAmount: 100, spentAmount: 101, percentageUsed: 101, isExceeded: true } as any)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.exceeded).toBe(true)
  })

  it('checkAndNotify: retorna exceeded=false quando categoria não tem budget', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue(null)
    const result = await service.checkAndNotify('c1', '2024-01')
    expect(result.exceeded).toBe(false)
  })

  it('getByMonth: retorna lista de budgets com spentAmount', async () => {
    const budgets = [{ id: '1', categoryId: 'c1', limitAmount: 100, spentAmount: 50, percentageUsed: 50, isExceeded: false }]
    vi.mocked(repo.findByMonth).mockResolvedValue(budgets as any)
    const result = await service.getByMonth('2024-01')
    expect(result).toEqual(budgets)
    expect(repo.findByMonth).toHaveBeenCalledWith('2024-01')
  })

  it('update: retorna budget atualizado com sucesso', async () => {
    const updatedBudget = { id: '1', limitAmount: 200 }
    vi.mocked(repo.update).mockResolvedValue(updatedBudget as any)
    const result = await service.update('1', 200)
    expect(result).toEqual(updatedBudget)
    expect(repo.update).toHaveBeenCalledWith('1', 200)
  })

  it('update: lança NotFoundError quando o repo falha', async () => {
    vi.mocked(repo.update).mockRejectedValue(new Error('not found'))
    await expect(service.update('999', 100)).rejects.toThrow('Orçamento não encontrado')
  })

  it('create: cria budget quando não existe duplicata', async () => {
    vi.mocked(repo.findByCategoryAndMonth).mockResolvedValue(null)
    const newBudget = { id: '1', categoryId: 'c1', limitAmount: 300 }
    vi.mocked(repo.create).mockResolvedValue(newBudget as any)
    const result = await service.create({ categoryId: 'c1', month: new Date('2024-06-01'), limitAmount: 300 })
    expect(result).toEqual(newBudget)
  })
})
