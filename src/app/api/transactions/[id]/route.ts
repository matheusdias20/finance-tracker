import { NextResponse } from 'next/server'
import { transactionService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import { updateTransactionSchema } from '@/shared/schemas/transaction.schema'
import type { UpdateTransactionInput } from '@/core/entities/transaction.entity'

interface Context {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const transaction = await transactionService.findById(params.id)
    return successResponse(transaction)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)
    const updatedTransaction = await transactionService.update(params.id, validatedData as unknown as UpdateTransactionInput)
    return successResponse(updatedTransaction)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    await transactionService.delete(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
