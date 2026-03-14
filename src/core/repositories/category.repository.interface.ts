import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../entities/category.entity'

export interface ICategoryRepository {
  findAll(): Promise<Category[]>
  findById(id: string): Promise<Category | null>
  create(input: CreateCategoryInput): Promise<Category>
  update(id: string, input: UpdateCategoryInput): Promise<Category>
  softDelete(id: string): Promise<void>
  countTransactions(id: string): Promise<number>
}
