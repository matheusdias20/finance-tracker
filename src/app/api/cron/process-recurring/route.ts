import { NextResponse } from 'next/server'
import { recurringService } from '@/infrastructure/di/container'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const result = await recurringService.processRecurring(new Date())
    // eslint-disable-next-line no-console
    console.log(`[CRON] Processadas: ${result.processed}`, result.errors)
    
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[CRON Error]', error)
    return NextResponse.json({ error: 'Erro interno ao processar recorrências' }, { status: 500 })
  }
}
