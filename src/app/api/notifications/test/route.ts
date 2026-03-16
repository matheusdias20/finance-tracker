import { notificationService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import { ValidationError } from '@/infrastructure/errors'

export async function POST(request: Request) {
  try {
    const { type } = await request.json()

    if (!notificationService) {
      throw new Error('NotificationService not initialized')
    }

    switch (type) {
      case 'budget_exceeded':
        // Tentar enviar para qualquer categoria existente se houver, senão usar dummy
        await notificationService.checkBudgetExceeded('test-cat', '2024-12')
        break
      case 'recurring_reminder':
        await notificationService.sendRecurringReminders()
        break
      case 'weekly_summary':
        await notificationService.sendWeeklySummary()
        break
      case 'monthly_summary':
        const currentMonth = new Date().toISOString().substring(0, 7)
        await notificationService.sendMonthlySummary(currentMonth)
        break
      default:
        throw new ValidationError('Tipo de teste inválido')
    }

    return successResponse({ 
      message: `Teste de "${type}" disparado! Verifique os logs do servidor para detalhes de entrega.` 
    })
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
