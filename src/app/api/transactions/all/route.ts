import { transactionService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'

export async function DELETE() {
  try {
    await transactionService.deleteAll()
    return successResponse({ message: 'Todas as transações foram excluídas.' })
  } catch (error) {
    return handleApiError(error)
  }
}
