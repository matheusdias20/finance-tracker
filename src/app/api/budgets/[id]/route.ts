import { budgetService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import { updateBudgetSchema } from '@/shared/schemas/budget.schema'

interface Context {
  params: { id: string }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const body = await request.json()
    const validatedData = updateBudgetSchema.parse(body)
    const updatedBudget = await budgetService.update(params.id, validatedData.limitAmount)
    return successResponse(updatedBudget)
  } catch (error) {
    return handleApiError(error)
  }
}
