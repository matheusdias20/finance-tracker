import { categoryService } from '@/infrastructure/di/container'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import { createCategorySchema } from '@/shared/schemas/category.schema'
import type { CreateCategoryInput } from '@/core/entities/category.entity'

export async function GET() {
  try {
    const categories = await categoryService.getAll()
    return successResponse(categories)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)
    const newCategory = await categoryService.create(validatedData as unknown as CreateCategoryInput)
    return successResponse(newCategory, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
