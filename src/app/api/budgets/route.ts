import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { budgetService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import { createBudgetSchema } from '@/shared/schemas/budget.schema'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get('month')
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: { message: 'Mês (month YYYY-MM) é obrigatório e deve ser válido', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      )
    }

    const budgets = await budgetService.getByMonth(month)
    return successResponse(budgets)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createBudgetSchema.parse(body)
    const newBudget = await budgetService.create(validatedData)
    return successResponse(newBudget, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
