import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { forecastService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'

export const dynamic = 'force-dynamic'

const getCachedForecast = unstable_cache(
  async (months: number) => {
    return forecastService.getForecasts(months)
  },
  ['report-forecast'],
  { revalidate: 300, tags: ['reports', 'forecast'] }
)

export async function GET(request: NextRequest) {
  try {
    const monthsParam = request.nextUrl.searchParams.get('months')
    let months = 3
    
    if (monthsParam) {
      const parsed = parseInt(monthsParam, 10)
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
        months = parsed
      } else {
        return NextResponse.json(
          { success: false, error: { message: 'O parâmetro months deve ser um número entre 1 e 6', code: 'VALIDATION_ERROR' } },
          { status: 400 }
        )
      }
    }

    const report = await getCachedForecast(months)
    return successResponse(report)
  } catch (error) {
    return handleApiError(error)
  }
}
