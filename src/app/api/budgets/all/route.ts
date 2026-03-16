import { budgetService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'

export async function DELETE() {
  try {
    await budgetService.deleteAll()
    return successResponse({ message: 'Todos os orçamentos foram excluídos.' })
  } catch (error) {
    return handleApiError(error)
  }
}
