import type { NextRequest } from 'next/server'
import { transactionService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import { createTransactionSchema, transactionFiltersSchema } from '@/shared/schemas/transaction.schema'
import type { CreateTransactionInput, TransactionFilters } from '@/core/entities/transaction.entity'

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const validatedFilters = transactionFiltersSchema.parse(searchParams)
    const paginatedResult = await transactionService.findMany(validatedFilters as unknown as TransactionFilters)
    return successResponse(paginatedResult)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)
    const newTransaction = await transactionService.create(validatedData as unknown as CreateTransactionInput)
    return successResponse(newTransaction, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
