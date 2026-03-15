import type { ICategoryRepository } from '../repositories/category.repository.interface'
import type { CreateCategoryInput, UpdateCategoryInput, Category } from '../entities/category.entity'
import { NotFoundError, ValidationError } from '../../infrastructure/errors'

export class CategoryService {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return this.categoryRepo.findAll()
  }

  async getById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id)
    if (!category) throw new NotFoundError('Categoria')
    return category
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    return this.categoryRepo.create(input)
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    await this.getById(id) // lança NotFoundError se não existir
    return this.categoryRepo.update(id, input)
  }

  async delete(id: string): Promise<void> {
    await this.getById(id)
    const transactionCount = await this.categoryRepo.countTransactions(id)
    if (transactionCount > 0) {
      throw new ValidationError(
        `Não é possível excluir: categoria possui ${transactionCount} transação(ões) vinculada(s)`
      )
    }
    await this.categoryRepo.softDelete(id)
  }
}
