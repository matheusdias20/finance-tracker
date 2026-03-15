import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { transactionService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'

export const dynamic = 'force-dynamic'

const getCachedEvolution = unstable_cache(
  async (months: number) => {
    const evolution = await transactionService.getMonthlyEvolution(months)
    return evolution.map(item => ({
      month: item.month,
      income: item.totalIncome,
      expense: item.totalExpense,
      balance: item.totalIncome - item.totalExpense
    }))
  },
  ['report-monthly-evolution'],
  { revalidate: 300, tags: ['reports', 'evolution'] }
)

export async function GET(request: NextRequest) {
  try {
    const monthsParam = request.nextUrl.searchParams.get('months')
    let months = 12
    
    if (monthsParam) {
      const parsed = parseInt(monthsParam, 10)
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 24) {
        months = parsed
      } else {
        return NextResponse.json(
          { success: false, error: { message: 'O parâmetro months deve ser um número entre 1 e 24', code: 'VALIDATION_ERROR' } },
          { status: 400 }
        )
      }
    }

    const report = await getCachedEvolution(months)
    return successResponse(report)
  } catch (error) {
    return handleApiError(error)
  }
}
