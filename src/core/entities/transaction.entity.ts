export type TransactionType = 'income' | 'expense'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  day?: number // dia do mês (1-31) para monthly
}

export interface Transaction {
  id: string
  amount: number
  description: string
  date: Date
  type: TransactionType
  categoryId: string
  isRecurring: boolean
  recurrenceRule: RecurrenceRule | null
  nextOccurrence: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface CreateTransactionInput {
  amount: number
  description: string
  date: Date
  type: TransactionType
  categoryId: string
  isRecurring?: boolean
  recurrenceRule?: RecurrenceRule | null
}

export interface UpdateTransactionInput {
  amount?: number
  description?: string
  date?: Date
  type?: TransactionType
  categoryId?: string
}

export interface TransactionFilters {
  startDate?: Date
  endDate?: Date
  month?: string // formato YYYY-MM
  type?: TransactionType
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}

export interface TransactionWithCategory extends Transaction {
  categoryName: string
  categoryColor: string
  categoryIcon: string
}

export interface PaginatedTransactions {
  data: TransactionWithCategory[]
  total: number
  page: number
  limit: number
  totalPages: number
}
