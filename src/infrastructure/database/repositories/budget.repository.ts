import { and, eq, isNull, sql } from 'drizzle-orm'
import type { Database } from '../client'
import { budgets } from '../schema/budgets'
import { transactions } from '../schema/transactions'
import { DatabaseError } from '../../errors'
import type { IBudgetRepository } from '../../../core/repositories/budget.repository.interface'
import type { Budget, BudgetWithSpent, CreateBudgetInput } from '../../../core/entities/budget.entity'

interface BudgetRecord {
  id: string
  categoryId: string
  month: string
  limitAmount: string
  createdAt: Date | null
  updatedAt: Date | null
  deletedAt: Date | null
}

export class BudgetRepository implements IBudgetRepository {
  constructor(private readonly db: Database) {}

  async findByMonth(month: string): Promise<BudgetWithSpent[]> {
    try {
      const records = await this.db
        .select({
          id: budgets.id,
          categoryId: budgets.categoryId,
          month: budgets.month,
          limitAmount: budgets.limitAmount,
          createdAt: budgets.createdAt,
          updatedAt: budgets.updatedAt,
          deletedAt: budgets.deletedAt,
          spentAmount: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)::numeric`,
        })
        .from(budgets)
        .leftJoin(
          transactions,
          and(
            eq(transactions.categoryId, budgets.categoryId),
            eq(transactions.type, 'expense'),
            sql`DATE_TRUNC('month', ${transactions.date}::date) = ${budgets.month}::date`,
            isNull(transactions.deletedAt)
          )
        )
        .where(
          and(
            eq(sql`DATE_TRUNC('month', ${budgets.month}::date)`, sql`DATE_TRUNC('month', ${month}::date)`),
            isNull(budgets.deletedAt)
          )
        )
        .groupBy(budgets.id)

      return (records as (BudgetRecord & { spentAmount: number })[]).map(r => this.mapToWithSpent(r, r.spentAmount))
    } catch (error) {
      throw new DatabaseError(`Failed to fetch budgets by month: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findByCategoryAndMonth(categoryId: string, month: string): Promise<BudgetWithSpent | null> {
    try {
      const monthPrefix = month.substring(0, 7)
      
      const records = await this.db
        .select({
          id: budgets.id,
          categoryId: budgets.categoryId,
          month: budgets.month,
          limitAmount: budgets.limitAmount,
          createdAt: budgets.createdAt,
          updatedAt: budgets.updatedAt,
          deletedAt: budgets.deletedAt,
          spentAmount: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)::numeric`,
        })
        .from(budgets)
        .leftJoin(
          transactions,
          and(
            eq(transactions.categoryId, budgets.categoryId),
            eq(transactions.type, 'expense'),
            sql`DATE_TRUNC('month', ${transactions.date}::date) = DATE_TRUNC('month', ${budgets.month}::date)`,
            isNull(transactions.deletedAt)
          )
        )
        .where(
          and(
            eq(budgets.categoryId, categoryId),
            sql`TO_CHAR(${budgets.month}::date, 'YYYY-MM') = ${monthPrefix}`,
            isNull(budgets.deletedAt)
          )
        )
        .groupBy(budgets.id)
        .limit(1)

      if (records.length === 0) return null
      const record = records[0] as BudgetRecord & { spentAmount: number }
      return this.mapToWithSpent(record, record.spentAmount)
    } catch (error) {
      throw new DatabaseError(`Failed to fetch budget by category and month: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    try {
      const [record] = await this.db
        .insert(budgets)
        .values({
          categoryId: input.categoryId,
          month: input.month.toISOString().split('T')[0],
          limitAmount: input.limitAmount.toString(),
        })
        .returning()

      return this.mapToEntity(record as BudgetRecord)
    } catch (error) {
      throw new DatabaseError(`Failed to create budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async update(id: string, limitAmount: number): Promise<Budget> {
    try {
      const [record] = await this.db
        .update(budgets)
        .set({ limitAmount: limitAmount.toString(), updatedAt: new Date() })
        .where(and(eq(budgets.id, id), isNull(budgets.deletedAt)))
        .returning()

      if (!record) throw new Error('Budget not found for update')
      return this.mapToEntity(record as BudgetRecord)
    } catch (error) {
      throw new DatabaseError(`Failed to update budget: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await this.db
        .update(budgets)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(isNull(budgets.deletedAt))
    } catch (error) {
      throw new DatabaseError(`Failed to delete all budgets: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapToEntity(record: BudgetRecord): Budget {
    return {
      id: record.id,
      categoryId: record.categoryId,
      month: new Date(record.month),
      limitAmount: parseFloat(record.limitAmount),
      createdAt: record.createdAt || new Date(),
      updatedAt: record.updatedAt || new Date(),
      deletedAt: record.deletedAt,
    }
  }

  private mapToWithSpent(record: BudgetRecord, spentAmountStr: number | string): BudgetWithSpent {
    const budget = this.mapToEntity(record)
    const spentAmount = Number(spentAmountStr)
    const percentageUsed = budget.limitAmount > 0 ? (spentAmount / budget.limitAmount) * 100 : 0
    
    return {
      ...budget,
      spentAmount,
      percentageUsed,
      isExceeded: spentAmount > budget.limitAmount,
    }
  }
}
