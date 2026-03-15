import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting simples por IP usando headers
// Armazenar contagem em memória (Map) - adequado para uso pessoal
const rateLimitMap = new Map()
const LIMIT = 60 // requisições
const WINDOW = 60 * 1000 // 1 minuto em ms

export function middleware(request: NextRequest) {
  // Aplicar rate limit apenas em rotas de mutação (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record || now > record.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW })
    } else {
      record.count++
      if (record.count > LIMIT) {
        return NextResponse.json(
          { success: false, error: { message: 'Muitas requisições. Tente novamente em 1 minuto.', code: 'RATE_LIMITED' } },
          {
            status: 429,
            headers: { 'Retry-After': '60' },
          }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
