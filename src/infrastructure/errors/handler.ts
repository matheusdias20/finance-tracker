import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { AppError } from './index'

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {}
    error.errors.forEach((e) => {
      const key = e.path.join('.')
      details[key] = [...(details[key] ?? []), e.message]
    })
    return NextResponse.json(
      { success: false, error: { message: 'Dados inválidos', code: 'VALIDATION_ERROR', details } },
      { status: 400 }
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    )
  }

  console.error('[Unhandled Error]', error)
  return NextResponse.json(
    { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}
