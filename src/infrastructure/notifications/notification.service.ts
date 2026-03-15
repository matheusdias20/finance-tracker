import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { INotificationRepository } from '../../core/repositories/notification.repository.interface'
import type { ITransactionRepository } from '../../core/repositories/transaction.repository.interface'
import type { IBudgetRepository } from '../../core/repositories/budget.repository.interface'
import { sendEmail } from './email.client'
import {
  BudgetExceededEmail,
  RecurringReminderEmail,
  WeeklySummaryEmail,
  MonthlySummaryEmail
} from './templates'
import * as React from 'react'

export class NotificationService {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly transactionRepo: ITransactionRepository,
    private readonly budgetRepo: IBudgetRepository,
    private readonly recipientEmail: string
  ) {}

  async checkBudgetExceeded(categoryId: string, month: string): Promise<void> {
    const budget = await this.budgetRepo.findByCategoryAndMonth(categoryId, month)
    if (!budget) return

    const summary = await this.transactionRepo.sumByCategory(month)
    const categorySummary = summary.find(s => s.categoryId === categoryId)
    if (!categorySummary) return

    const { limitAmount } = budget
    const spentAmount = categorySummary.totalAmount

    if (spentAmount > limitAmount) {
      const wasSent = await this.notificationRepo.wasAlreadySentToday(
        'budget_exceeded',
        categoryId
      )

      if (!wasSent) {
        // Obter top 3 transações
        const txs = await this.transactionRepo.findMany({ 
          categoryId, 
          month, 
          limit: 3 
        })

        const formattedMonth = format(new Date(`${month}-01T12:00:00`), "MMMM yyyy", { locale: ptBR })
        const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)

        const result = await sendEmail({
          to: this.recipientEmail,
          subject: `⚠️ Limite de orçamento atingido: ${categorySummary.categoryName}`,
          react: React.createElement(BudgetExceededEmail, {
            categoryName: categorySummary.categoryName,
            categoryColor: categorySummary.categoryColor,
            limitAmount,
            spentAmount,
            percentageUsed: Math.floor((spentAmount / limitAmount) * 100),
            month: capitalizedMonth,
            topTransactions: txs.data.map(t => ({
              description: t.description,
              amount: t.amount,
              date: format(t.date, 'dd/MM/yyyy')
            }))
          })
        })

        await this.notificationRepo.create(
          'budget_exceeded',
          { 
            recipient: this.recipientEmail, 
            referenceId: categoryId, 
            status: result.success ? 'sent' : 'failed',
            error: result.error 
          },
          new Date()
        )
      }
    }
  }

  async sendWeeklySummary(): Promise<void> {
    const today = new Date()
    const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
    const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
    
    const weekLabel = `${format(lastWeekStart, 'd')} a ${format(lastWeekEnd, 'd')} de ${format(lastWeekEnd, 'MMMM', { locale: ptBR })}`
    
    const currentWeekMetrics = await this.transactionRepo.findMany({ 
      startDate: lastWeekStart, 
      endDate: lastWeekEnd 
    })
    
    const prevWeekStart = subWeeks(lastWeekStart, 1)
    const prevWeekEnd = subWeeks(lastWeekEnd, 1)
    const prevWeekMetrics = await this.transactionRepo.findMany({ 
      startDate: prevWeekStart, 
      endDate: prevWeekEnd 
    })

    const income = currentWeekMetrics.data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const expense = currentWeekMetrics.data.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    const prevExpense = prevWeekMetrics.data.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    
    const diffPercent = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0

    const catSummary = await this.transactionRepo.sumByCategory(format(lastWeekEnd, 'yyyy-MM'))
    const topCat = catSummary.sort((a, b) => b.totalAmount - a.totalAmount)[0]

    await sendEmail({
      to: this.recipientEmail,
      subject: `📊 Resumo da Semana: ${weekLabel}`,
      react: React.createElement(WeeklySummaryEmail, {
        weekLabel,
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        transactionCount: currentWeekMetrics.total,
        comparedToLastWeek: Number(diffPercent.toFixed(1)),
        topCategory: topCat ? { name: topCat.categoryName, amount: topCat.totalAmount } : { name: 'Nenhuma', amount: 0 }
      })
    })
  }

  async sendMonthlySummary(month: string): Promise<void> {
    const summary = await this.transactionRepo.sumByMonth(1)
    const monthData = summary.find(s => s.month === month)
    if (!monthData) return

    const catSummary = await this.transactionRepo.sumByCategory(month)
    const totalExpense = monthData.totalExpense

    const formattedMonth = format(new Date(`${month}-01T12:00:00`), "MMMM yyyy", { locale: ptBR })
    const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)

    const categoriesWithMetas = await Promise.all(catSummary.map(async cat => {
      const budget = await this.budgetRepo.findByCategoryAndMonth(cat.categoryId, month)
      return {
        name: cat.categoryName,
        amount: cat.totalAmount,
        percentage: totalExpense > 0 ? Number(((cat.totalAmount / totalExpense) * 100).toFixed(1)) : 0,
        limitAmount: budget?.limitAmount ?? null,
        exceeded: budget ? cat.totalAmount > budget.limitAmount : false
      }
    }))

    await sendEmail({
      to: this.recipientEmail,
      subject: `📅 Fechamento de ${capitalizedMonth}`,
      react: React.createElement(MonthlySummaryEmail, {
        month: capitalizedMonth,
        totalIncome: monthData.totalIncome,
        totalExpense: totalExpense,
        balance: monthData.balance,
        categorySummary: categoriesWithMetas,
        goalsAchieved: categoriesWithMetas.filter(c => c.limitAmount && !c.exceeded).length,
        goalsExceeded: categoriesWithMetas.filter(c => c.exceeded).length
      })
    })
  }

  async sendRecurringReminders(): Promise<void> {
    const today = new Date()
    const upTo = new Date()
    upTo.setDate(today.getDate() + 3)

    const due = await this.transactionRepo.findRecurringDue(upTo)
    if (due.length === 0) return

    const txs = due.map(t => {
      const nextDate = t.nextOccurrence!
      const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
      
      return {
        description: t.description,
        amount: t.amount,
        categoryName: t.categoryId, // Idealmente buscar nome, mas usaremos id por simplicidade se não disponível
        nextOccurrence: format(nextDate, 'dd/MM/yyyy'),
        daysUntil: Math.max(0, diffDays)
      }
    })

    await sendEmail({
      to: this.recipientEmail,
      subject: `📅 ${txs.length} Pagamento(s) recorrente(s) vencem em breve`,
      react: React.createElement(RecurringReminderEmail, {
        transactions: txs
      })
    })
  }
}
