import { NextResponse } from 'next/server'
import { notificationService } from '@/infrastructure/di/container'

export async function POST(request: Request) {
  try {
    const { type } = await request.json()

    switch (type) {
      case 'budget_exceeded':
        // Teste com ID genérico
        await notificationService.checkBudgetExceeded('test-cat', '2024-12')
        break
      case 'recurring_reminder':
        await notificationService.sendRecurringReminders()
        break
      case 'weekly_summary':
        await notificationService.sendWeeklySummary()
        break
      case 'monthly_summary':
        await notificationService.sendMonthlySummary('2024-11')
        break
      default:
        return NextResponse.json({ error: 'Tipo de teste inválido' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `Email de teste (${type}) disparado!` })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
