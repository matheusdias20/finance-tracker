import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecurringService } from '@/core/services/recurring.service'

describe('RecurringService Unit Tests (Exhaustive)', () => {
  let service: RecurringService
  let transactionRepo: any
  let transactionService: any

  beforeEach(() => {
    transactionRepo = {
      findRecurringDue: vi.fn(),
      updateNextOccurrence: vi.fn()
    }
    transactionService = {
      create: vi.fn(),
      calculateNextOccurrence: vi.fn()
    }
    service = new RecurringService(transactionRepo, transactionService)
    vi.clearAllMocks()
  })

  describe('processRecurring', () => {
    it('sucesso com uma transação', async () => {
      const tx = { id: '1', amount: 100, description: 'd', type: 'expense', categoryId: 'c1', recurrenceRule: { frequency: 'monthly' } }
      transactionRepo.findRecurringDue.mockResolvedValue([tx])
      transactionService.create.mockResolvedValue({})
      transactionService.calculateNextOccurrence.mockReturnValue(new Date())
      
      const res = await service.processRecurring(new Date())
      expect(res.processed).toBe(1)
      expect(transactionService.create).toHaveBeenCalled()
      expect(transactionRepo.updateNextOccurrence).toHaveBeenCalled()
    })

    it('lida com falta de regra de recorrência', async () => {
      const tx = { id: '1', recurrenceRule: null }
      transactionRepo.findRecurringDue.mockResolvedValue([tx])
      
      const res = await service.processRecurring(new Date())
      expect(res.processed).toBe(0)
      expect(res.errors[0]).toContain('lacks a recurrence rule')
    })

    it('lida com erro na criação da transação (catch branch)', async () => {
      const tx = { id: '1', recurrenceRule: { frequency: 'monthly' } }
      transactionRepo.findRecurringDue.mockResolvedValue([tx])
      transactionService.create.mockRejectedValue(new Error('create fail'))
      
      const res = await service.processRecurring(new Date())
      expect(res.processed).toBe(0)
      expect(res.errors[0]).toContain('create fail')
    })

    it('lida com erro genérico não-Error (catch branch)', async () => {
      const tx = { id: '1', recurrenceRule: { frequency: 'monthly' } }
      transactionRepo.findRecurringDue.mockResolvedValue([tx])
      transactionService.create.mockRejectedValue('string error')
      
      const res = await service.processRecurring(new Date())
      expect(res.errors[0]).toContain('string error')
    })
  })
})
