import { eq, isNull, sql } from 'drizzle-orm'
import { Database } from '../client'
import { categories } from '../schema/categories'
import { transactions } from '../schema/transactions'
import { DatabaseError } from '../../errors'
import type { ICategoryRepository } from '../../../core/repositories/category.repository.interface'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../../core/entities/category.entity'

export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Category[]> {
    try {
      const records = await this.db
        .select()
        .from(categories)
        .where(isNull(categories.deletedAt))
        .orderBy(categories.name)
      
      return records.map(this.mapToEntity)
    } catch (error) {
      throw new DatabaseError(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const [record] = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1)

      if (!record || record.deletedAt) return null
      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to fetch category by ID: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    try {
      const [record] = await this.db
        .insert(categories)
        .values({
          name: input.name,
          icon: input.icon,
          color: input.color,
          budgetLimit: input.budgetLimit ? input.budgetLimit.toString() : null,
          type: input.type,
        })
        .returning()

      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    try {
      const updateData: Partial<typeof categories.$inferInsert> = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.icon !== undefined) updateData.icon = input.icon
      if (input.color !== undefined) updateData.color = input.color
      if (input.budgetLimit !== undefined) {
        updateData.budgetLimit = input.budgetLimit === null ? null : input.budgetLimit.toString()
      }

      const [record] = await this.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning()

      if (!record) throw new Error('Category not found for update')
      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.db
        .update(categories)
        .set({ deletedAt: new Date() })
        .where(eq(categories.id, id))
    } catch (error) {
      throw new DatabaseError(`Failed to soft delete category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async countTransactions(id: string): Promise<number> {
    try {
      const [result] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(transactions)
        .where(sql`${transactions.categoryId} = ${id} AND ${transactions.deletedAt} IS NULL`)
      
      return result?.count || 0
    } catch (error) {
      throw new DatabaseError(`Failed to count transactions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapToEntity(record: typeof categories.$inferSelect): Category {
    return {
      id: record.id,
      name: record.name,
      icon: record.icon,
      color: record.color,
      budgetLimit: record.budgetLimit ? parseFloat(record.budgetLimit) : null,
      type: record.type as Category['type'],
      createdAt: record.createdAt || new Date(),
      deletedAt: record.deletedAt,
    }
  }
}
