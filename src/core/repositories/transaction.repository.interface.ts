import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  PaginatedTransactions,
} from '../entities/transaction.entity'
import type { CategoryReport, MonthlyEvolution } from '../entities/report.entity'

export interface ITransactionRepository {
  findMany(filters: TransactionFilters): Promise<PaginatedTransactions>
  findById(id: string): Promise<Transaction | null>
  findRecurringDue(upToDate: Date): Promise<Transaction[]>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, input: UpdateTransactionInput): Promise<Transaction>
  updateNextOccurrence(id: string, nextOccurrence: Date): Promise<Transaction>
  softDelete(id: string): Promise<void>
  sumByCategory(month: string): Promise<CategoryReport[]>
  sumByMonth(months: number): Promise<MonthlyEvolution[]>
  getHistoryByCategory(categoryId: string, months: number): Promise<Array<{ month: string; amount: number }>>
  deleteAll(): Promise<void>
}
