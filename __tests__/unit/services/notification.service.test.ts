import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationService } from '@/infrastructure/notifications/notification.service'



// Mocking sendEmail using the correct absolute path matching the source
vi.mock('@/infrastructure/notifications/email.client', () => ({
  sendEmail: vi.fn(),
  __resetResend: vi.fn()
}))

import { sendEmail } from '@/infrastructure/notifications/email.client'

describe('NotificationService Unit Tests (Exhaustive)', () => {
  let service: NotificationService
  let notificationRepo: any
  let transactionRepo: any
  let budgetRepo: any
  const recipient = 'test@user.com'

  beforeEach(() => {
    notificationRepo = {
      findPending: vi.fn(),
      wasAlreadySentToday: vi.fn(),
      markSent: vi.fn(),
      markFailed: vi.fn(),
      create: vi.fn()
    }
    transactionRepo = {
      findMany: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      sumByCategory: vi.fn().mockResolvedValue([]),
      sumByMonth: vi.fn().mockResolvedValue([]),
      findRecurringDue: vi.fn().mockResolvedValue([])
    }
    budgetRepo = {
      findByCategoryAndMonth: vi.fn()
    }
    service = new NotificationService(notificationRepo, transactionRepo, budgetRepo, recipient)
    
    vi.clearAllMocks()
    vi.mocked(sendEmail).mockResolvedValue({ success: true, id: '1' })
  })

  describe('checkBudgetExceeded', () => {
    it('retorna cedo se não há orçamento', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue(null)
      await service.checkBudgetExceeded('c1', '2024-12')
      expect(transactionRepo.sumByCategory).not.toHaveBeenCalled()
    })

    it('retorna cedo se categoria não está no sumário', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue({ limitAmount: 100 })
      transactionRepo.sumByCategory.mockResolvedValue([{ categoryId: 'other' }])
      await service.checkBudgetExceeded('c1', '2024-12')
      expect(notificationRepo.wasAlreadySentToday).not.toHaveBeenCalled()
    })

    it('não envia se dentro do limite', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue({ limitAmount: 100 })
      transactionRepo.sumByCategory.mockResolvedValue([{ categoryId: 'c1', totalAmount: 50 }])
      await service.checkBudgetExceeded('c1', '2024-12')
      expect(notificationRepo.wasAlreadySentToday).not.toHaveBeenCalled()
    })

    it('não envia se já enviado hoje', async () => {
      budgetRepo.findByCategoryAndMonth.mockResolvedValue({ limitAmount: 100 })
      transactionRepo.sumByCategory.mockResolvedValue([{ categoryId: 'c1', totalAmount: 150 }])
      notificationRepo.wasAlreadySentToday.mockResolvedValue(true)
      await service.checkBudgetExceeded('c1', '2024-12')
      expect(transactionRepo.findMany).not.toHaveBeenCalled()
    })

    it('lida com falha no envio do email', async () => {
      vi.mocked(sendEmail).mockResolvedValueOnce({ success: false, error: 'fail' })
      
      budgetRepo.findByCategoryAndMonth.mockResolvedValue({ limitAmount: 100 })
      transactionRepo.sumByCategory.mockResolvedValue([{ categoryId: 'c1', totalAmount: 150, categoryName: 'N' }])
      notificationRepo.wasAlreadySentToday.mockResolvedValue(false)
      
      await service.checkBudgetExceeded('c1', '2024-12')
      expect(notificationRepo.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'failed', error: 'fail' }),
        expect.anything()
      )
    })
  })

  describe('sendWeeklySummary', () => {
    it('prevExpense zero branch', async () => {
      transactionRepo.findMany
        .mockResolvedValueOnce({ data: [{ type: 'expense', amount: 100 }], total: 1 }) // current
        .mockResolvedValueOnce({ data: [], total: 0 }) // prev
      
      transactionRepo.sumByCategory.mockResolvedValue([])
      
      await service.sendWeeklySummary()
      expect(sendEmail).toHaveBeenCalled()
    })
  })

  describe('sendMonthlySummary', () => {
    it('retorna cedo se não há dados do mês', async () => {
      transactionRepo.sumByMonth.mockResolvedValue([])
      await service.sendMonthlySummary('2024-12')
      expect(transactionRepo.sumByCategory).not.toHaveBeenCalled()
    })

    it('totalExpense zero branch e orçamento inexistente', async () => {
      transactionRepo.sumByMonth.mockResolvedValue([{ month: '2024-12', totalExpense: 0, totalIncome: 0, balance: 0 }])
      transactionRepo.sumByCategory.mockResolvedValue([{ categoryId: 'c1', categoryName: 'n1', totalAmount: 0 }])
      budgetRepo.findByCategoryAndMonth.mockResolvedValue(null)
      
      await service.sendMonthlySummary('2024-12')
      expect(sendEmail).toHaveBeenCalled()
    })
    
    it('fallback para categoria sem nome', async () => {
      transactionRepo.sumByMonth.mockResolvedValue([{ month: '2024-12', totalExpense: 100, totalIncome: 0, balance: -100 }])
      transactionRepo.sumByCategory.mockResolvedValue([{ categoryId: 'c1', categoryName: '', totalAmount: 100 }])
      budgetRepo.findByCategoryAndMonth.mockResolvedValue({ limitAmount: 200 })
      
      await service.sendMonthlySummary('2024-12')
      expect(sendEmail).toHaveBeenCalled()
    })
  })

  describe('sendRecurringReminders', () => {
    it('retorna cedo se não há vencimentos', async () => {
      transactionRepo.findRecurringDue.mockResolvedValue([])
      await service.sendRecurringReminders()
      expect(sendEmail).not.toHaveBeenCalled()
    })
    
    it('sucesso com vencimentos', async () => {
      transactionRepo.findRecurringDue.mockResolvedValue([
        { id: '1', description: 'd', amount: 100, nextOccurrence: new Date(), categoryId: 'c1' }
      ])
      await service.sendRecurringReminders()
      expect(sendEmail).toHaveBeenCalled()
    })
  })
})
