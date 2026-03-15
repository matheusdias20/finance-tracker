import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RecurringService } from '@/core/services/recurring.service'
import { TransactionService } from '@/core/services/transaction.service'
import { BudgetService } from '@/core/services/budget.service'
import { mockTransactionRepo, mockBudgetRepo } from '../../mocks/repositories.mock'
import type { RecurrenceRule } from '@/core/entities/transaction.entity'

describe('RecurringService - calculateNextOccurrence', () => {
  let txService: TransactionService
  
  beforeEach(() => {
    txService = new TransactionService(mockTransactionRepo(), new BudgetService(mockBudgetRepo()))
  })

  const calc = (dateStr: string, rule: RecurrenceRule) => {
    // using UTC noon as specified in schemas to avoid offset jumps
    const result = txService.calculateNextOccurrence(new Date(dateStr + 'T12:00:00Z'), rule)
    return result.toISOString().split('T')[0]
  }

  describe('monthly', () => {
    it('dia 31 de janeiro → último dia de fevereiro (28)', () => {
      expect(calc('2023-01-31', { frequency: 'monthly' })).toBe('2023-02-28')
    })
    
    it('dia 31 de outubro → 30 de novembro', () => {
      expect(calc('2023-10-31', { frequency: 'monthly' })).toBe('2023-11-30')
    })
    
    it('dia 15 de qualquer mês → dia 15 do mês seguinte', () => {
      expect(calc('2023-05-15', { frequency: 'monthly' })).toBe('2023-06-15')
    })
    
    it('dezembro → janeiro do ano seguinte', () => {
      expect(calc('2023-12-10', { frequency: 'monthly' })).toBe('2024-01-10')
    })
  })

  describe('yearly', () => {
    it('29 de fevereiro de ano bissexto → 28 de fevereiro do próximo ano não-bissexto', () => {
      expect(calc('2024-02-29', { frequency: 'yearly' })).toBe('2025-02-28')
    })
    
    it('1 de janeiro → 1 de janeiro do ano seguinte', () => {
      expect(calc('2023-01-01', { frequency: 'yearly' })).toBe('2024-01-01')
    })
  })

  describe('daily e weekly', () => {
    it('daily: adiciona exatamente 1 dia', () => {
      expect(calc('2023-01-01', { frequency: 'daily' })).toBe('2023-01-02')
    })
    
    it('weekly: adiciona exatamente 7 dias', () => {
      expect(calc('2023-01-01', { frequency: 'weekly' })).toBe('2023-01-08')
    })
  })
})

describe('RecurringService - processRecurring', () => {
  let service: RecurringService
  let txService: TransactionService
  let txRepo: ReturnType<typeof mockTransactionRepo>
  
  beforeEach(() => {
    txRepo = mockTransactionRepo()
    txService = new TransactionService(txRepo, new BudgetService(mockBudgetRepo()))
    vi.spyOn(txService, 'create').mockResolvedValue({ id: 'new-tx' } as any)
    vi.spyOn(txService, 'calculateNextOccurrence').mockReturnValue(new Date('2024-02-01T12:00:00Z'))
    service = new RecurringService(txRepo, txService)
  })

  it('processa todas as recorrentes vencidas', async () => {
    vi.mocked(txRepo.findRecurringDue).mockResolvedValue([
      { id: '1', amount: 10, type: 'expense', description: 'test', date: new Date(), categoryId: 'c1', isRecurring: true, recurrenceRule: { frequency: 'monthly' } } as any
    ])
    
    const res = await service.processRecurring(new Date('2024-01-15T12:00:00Z'))
    expect(res.processed).toBe(1)
    expect(txService.create).toHaveBeenCalled()
    expect(txRepo.updateNextOccurrence).toHaveBeenCalledWith('1', expect.any(Date))
  })

  it('não para o batch se uma transação falhar', async () => {
    vi.mocked(txRepo.findRecurringDue).mockResolvedValue([
      { id: '1', recurrenceRule: null } as any, // fails
      { id: '2', amount: 10, type: 'expense', description: 'test', date: new Date(), categoryId: 'c1', isRecurring: true, recurrenceRule: { frequency: 'monthly' } } as any // works
    ])

    const res = await service.processRecurring(new Date())
    expect(res.processed).toBe(1)
    expect(res.errors).toHaveLength(1)
    expect(txService.create).toHaveBeenCalledTimes(1)
  })

  it('retorna contagem correta de processados e erros', async () => {
    vi.mocked(txRepo.findRecurringDue).mockResolvedValue([
      { id: '1', recurrenceRule: null } as any, // err
      { id: '2', recurrenceRule: null } as any, // err
      { id: '3', amount: 10, type: 'expense', description: 't', date: new Date(), categoryId: 'c1', isRecurring: true, recurrenceRule: { frequency: 'daily' } } as any // ok
    ])

    const res = await service.processRecurring(new Date())
    expect(res.processed).toBe(1)
    expect(res.errors).toHaveLength(2)
  })

  it('não processa recorrentes com next_occurrence no futuro', async () => {
    // A função no Repo se encarrega de buscar apenas as due limitadas
    // Mas no unit, if findRecurringDue returns empty, nothing runs
    vi.mocked(txRepo.findRecurringDue).mockResolvedValue([])
    
    const res = await service.processRecurring(new Date())
    expect(res.processed).toBe(0)
    expect(txService.create).not.toHaveBeenCalled()
  })
})
