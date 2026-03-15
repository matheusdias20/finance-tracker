import { NextResponse } from 'next/server'
import { categoryService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import { updateCategorySchema } from '@/shared/schemas/category.schema'
import type { UpdateCategoryInput } from '@/core/entities/category.entity'

interface Context {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const category = await categoryService.getById(params.id)
    return successResponse(category)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)
    const updatedCategory = await categoryService.update(params.id, validatedData as unknown as UpdateCategoryInput)
    return successResponse(updatedCategory)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    await categoryService.delete(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
