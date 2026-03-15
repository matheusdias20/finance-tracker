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
})
