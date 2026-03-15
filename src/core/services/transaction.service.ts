import { addDays, addWeeks, addMonths, addYears } from 'date-fns'
import type { ITransactionRepository } from '../repositories/transaction.repository.interface'
import type { 
  Transaction, 
  CreateTransactionInput, 
  UpdateTransactionInput, 
  TransactionFilters, 
  PaginatedTransactions,
  RecurrenceRule
} from '../entities/transaction.entity'
import type { BudgetService } from './budget.service'
import { NotFoundError } from '../../infrastructure/errors'

export class TransactionService {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly budgetService: BudgetService
  ) {}

  async findMany(filters: TransactionFilters): Promise<PaginatedTransactions> {
    return this.transactionRepo.findMany(filters)
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findById(id)
    if (!transaction) throw new NotFoundError('Transação')
    return transaction
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    // Definir nextOccurrence default se for recorrente
    if (input.isRecurring && !input.recurrenceRule) {
      throw new Error('Regra de recorrência não definida para transação recorrente')
    }

    const transaction = await this.transactionRepo.create(input)
    
    if (transaction.type === 'expense') {
      const monthStr = transaction.date.toISOString().substring(0, 7)
      await this.budgetService.checkAndNotify(transaction.categoryId, monthStr)
    }

    return transaction
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    await this.findById(id)
    const transaction = await this.transactionRepo.update(id, input)

    if (transaction.type === 'expense') {
      const monthStr = transaction.date.toISOString().substring(0, 7)
      await this.budgetService.checkAndNotify(transaction.categoryId, monthStr)
    }

    return transaction
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await this.transactionRepo.softDelete(id)
  }

  calculateNextOccurrence(date: Date, rule: RecurrenceRule): Date {
    const baseDate = new Date(date)
    
    if (rule.frequency === 'monthly' && rule.day) {
      baseDate.setDate(rule.day)
    }

    switch (rule.frequency) {
      case 'daily':
        return addDays(baseDate, 1)
      case 'weekly':
        return addWeeks(baseDate, 1)
      case 'monthly':
        return addMonths(baseDate, 1)
      case 'yearly':
        return addYears(baseDate, 1)
      default:
        throw new Error('Frequência de recorrência inválida')
    }
  }
}
