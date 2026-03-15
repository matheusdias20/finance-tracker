import { and, eq, gte, ilike, isNull, lte, sql, desc, asc } from 'drizzle-orm'
import { Database } from '../client'
import { transactions } from '../schema/transactions'
import { categories } from '../schema/categories'
import { DatabaseError } from '../../errors'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'
import type { ITransactionRepository } from '../../../core/repositories/transaction.repository.interface'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  PaginatedTransactions,
  RecurrenceRule
} from '../../../core/entities/transaction.entity'
import type { CategoryReport, MonthlyEvolution } from '../../../core/entities/report.entity'

export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly db: Database) {}

  async findMany(filters: TransactionFilters): Promise<PaginatedTransactions> {
    try {
      const page = filters.page || 1
      const limit = filters.limit || 20
      const offset = (page - 1) * limit

      const conditions = [isNull(transactions.deletedAt)]

      if (filters.month) {
        const monthDate = parseISO(`${filters.month}-01T00:00:00Z`)
        conditions.push(
          gte(transactions.date, startOfMonth(monthDate).toISOString().split('T')[0]),
          lte(transactions.date, endOfMonth(monthDate).toISOString().split('T')[0])
        )
      }

      if (filters.type) {
        conditions.push(eq(transactions.type, filters.type))
      }

      if (filters.categoryId) {
        conditions.push(eq(transactions.categoryId, filters.categoryId))
      }

      if (filters.search) {
        conditions.push(ilike(transactions.description, `%${filters.search}%`))
      }

      const whereClause = and(...conditions)

      const [countResult] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(transactions)
        .where(whereClause)

      const total = countResult?.count || 0

      const records = await this.db
        .select()
        .from(transactions)
        .where(whereClause)
        .orderBy(desc(transactions.date), desc(transactions.createdAt))
        .limit(limit)
        .offset(offset)

      return {
        data: records.map(this.mapToEntity),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      throw new DatabaseError(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    try {
      const [record] = await this.db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
        .limit(1)

      if (!record) return null
      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to fetch transaction by ID: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findRecurringDue(upToDate: Date): Promise<Transaction[]> {
    try {
      const upToDateString = upToDate.toISOString().split('T')[0]
      const records = await this.db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.isRecurring, true),
            lte(transactions.nextOccurrence, upToDateString),
            isNull(transactions.deletedAt)
          )
        )

      return records.map(this.mapToEntity)
    } catch (error) {
      throw new DatabaseError(`Failed to fetch due recurring transactions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    try {
      const [record] = await this.db
        .insert(transactions)
        .values({
          amount: input.amount.toString(),
          description: input.description,
          date: input.date.toISOString().split('T')[0],
          type: input.type,
          categoryId: input.categoryId,
          isRecurring: input.isRecurring ?? false,
          recurrenceRule: input.recurrenceRule ?? null,
          nextOccurrence: input.isRecurring && input.date ? input.date.toISOString().split('T')[0] : null
        })
        .returning()

      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    try {
      const updateData: Partial<typeof transactions.$inferInsert> = { updatedAt: new Date() }
      if (input.amount !== undefined) updateData.amount = input.amount.toString()
      if (input.description !== undefined) updateData.description = input.description
      if (input.date !== undefined) updateData.date = input.date.toISOString().split('T')[0]
      if (input.type !== undefined) updateData.type = input.type
      if (input.categoryId !== undefined) updateData.categoryId = input.categoryId

      const [record] = await this.db
        .update(transactions)
        .set(updateData)
        .where(eq(transactions.id, id))
        .returning()

      if (!record) throw new Error('Transaction not found for update')
      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to update transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateNextOccurrence(id: string, nextOccurrence: Date): Promise<Transaction> {
    try {
      const [record] = await this.db
        .update(transactions)
        .set({ 
          nextOccurrence: nextOccurrence.toISOString().split('T')[0],
          updatedAt: new Date() 
        })
        .where(eq(transactions.id, id))
        .returning()

      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to update next occurrence: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.db
        .update(transactions)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(transactions.id, id))
    } catch (error) {
      throw new DatabaseError(`Failed to soft delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sumByCategory(month: string): Promise<CategoryReport[]> {
    try {
      const monthDate = parseISO(`${month}-01T00:00:00Z`)
      const start = startOfMonth(monthDate).toISOString().split('T')[0]
      const end = endOfMonth(monthDate).toISOString().split('T')[0]

      const records = await this.db
        .select({
          categoryId: transactions.categoryId,
          categoryName: categories.name,
          categoryColor: categories.color,
          categoryIcon: categories.icon,
          totalAmount: sql<number>`SUM(${transactions.amount}::numeric)::numeric`,
          transactionCount: sql<number>`COUNT(*)::int`,
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(transactions.type, 'expense'),
            gte(transactions.date, start),
            lte(transactions.date, end),
            isNull(transactions.deletedAt)
          )
        )
        .groupBy(transactions.categoryId, categories.id)

      const totalOverall = records.reduce((sum, r) => sum + Number(r.totalAmount), 0)
      
      return records.map(r => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        categoryColor: r.categoryColor,
        categoryIcon: r.categoryIcon,
        totalAmount: Number(r.totalAmount),
        percentage: totalOverall > 0 ? (Number(r.totalAmount) / totalOverall) * 100 : 0,
        transactionCount: r.transactionCount,
      }))
    } catch (error) {
      throw new DatabaseError(`Failed to sum by category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sumByMonth(months: number): Promise<MonthlyEvolution[]> {
    try {
      const records = await this.db
        .select({
          month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
          income: sql<number>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END)::numeric`,
          expense: sql<number>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END)::numeric`,
        })
        .from(transactions)
        .where(
          and(
            sql`${transactions.date} >= (CURRENT_DATE - INTERVAL '${sql.raw(months.toString())} months')`,
            isNull(transactions.deletedAt)
          )
        )
        .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
        .orderBy(asc(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`))

      return records.map(r => ({
        month: r.month,
        totalIncome: Number(r.income),
        totalExpense: Number(r.expense),
        balance: Number(r.income) - Number(r.expense),
      }))
    } catch (error) {
      throw new DatabaseError(`Failed to sum by month: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getHistoryByCategory(categoryId: string, months: number): Promise<Array<{ month: string; amount: number }>> {
    try {
      const records = await this.db
        .select({
          month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
          amount: sql<number>`COALESCE(SUM(${transactions.amount}::numeric), 0)::numeric`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.categoryId, categoryId),
            eq(transactions.type, 'expense'),
            sql`${transactions.date} >= (CURRENT_DATE - INTERVAL '${sql.raw(months.toString())} months')`,
            isNull(transactions.deletedAt)
          )
        )
        .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`)
        .orderBy(asc(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`))

      return records.map(r => ({
        month: r.month,
        amount: Number(r.amount),
      }))
    } catch (error) {
      throw new DatabaseError(`Failed to get history by category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapToEntity(record: typeof transactions.$inferSelect): Transaction {
    return {
      id: record.id,
      amount: parseFloat(record.amount),
      description: record.description,
      date: new Date(record.date),
      type: record.type as Transaction['type'],
      categoryId: record.categoryId,
      isRecurring: record.isRecurring || false,
      recurrenceRule: record.recurrenceRule as RecurrenceRule | null,
      nextOccurrence: record.nextOccurrence ? new Date(record.nextOccurrence) : null,
      createdAt: record.createdAt || new Date(),
      updatedAt: record.updatedAt || new Date(),
      deletedAt: record.deletedAt,
    }
  }
}
