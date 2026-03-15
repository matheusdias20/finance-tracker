import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { transactionService, categoryService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'

export const dynamic = 'force-dynamic'

const getCachedReport = unstable_cache(
  async (month: string) => {
    const summary = await transactionService.getSummaryByCategory(month)
    if (summary.length === 0) return []

    const categories = await categoryService.getAll()
    const categoryMap = new Map(categories.map(c => [c.id, c]))

    const total = summary.reduce((acc, curr) => acc + curr.totalAmount, 0)

    return summary.map(item => {
      const category = categoryMap.get(item.categoryId)
      return {
        categoryId: item.categoryId,
        name: category?.name ?? 'Desconhecida',
        color: category?.color ?? '#9ca3af',
        icon: category?.icon ?? 'help-circle',
        totalAmount: item.totalAmount,
        percentage: total > 0 ? (item.totalAmount / total) * 100 : 0
      }
    }).sort((a, b) => b.totalAmount - a.totalAmount)
  },
  ['report-by-category'],
  { revalidate: 300, tags: ['reports'] }
)

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get('month')
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: { message: 'Mês no formato YYYY-MM é obrigatório', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      )
    }

    const report = await getCachedReport(month)
    return successResponse(report)
  } catch (error) {
    return handleApiError(error)
  }
}
