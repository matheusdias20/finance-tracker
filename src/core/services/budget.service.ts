import type { IBudgetRepository } from '../repositories/budget.repository.interface'
import type { Budget, BudgetWithSpent, CreateBudgetInput } from '../entities/budget.entity'
import { NotFoundError, ValidationError } from '../../infrastructure/errors'

export class BudgetService {
  constructor(private readonly budgetRepo: IBudgetRepository) {}

  async getByMonth(month: string): Promise<BudgetWithSpent[]> {
    return this.budgetRepo.findByMonth(month)
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    const monthStr = input.month.toISOString().substring(0, 7)
    const existing = await this.budgetRepo.findByCategoryAndMonth(input.categoryId, monthStr)
    
    if (existing) {
      throw new ValidationError('Orçamento já existe para esta categoria e mês')
    }

    return this.budgetRepo.create(input)
  }

  async update(id: string, limitAmount: number): Promise<Budget> {
    try {
      return await this.budgetRepo.update(id, limitAmount)
    } catch {
      throw new NotFoundError('Orçamento não encontrado para a atualização')
    }
  }

  async checkAndNotify(categoryId: string, month: string): Promise<{ exceeded: boolean; percentageUsed: number; budget: BudgetWithSpent | null }> {
    const budget = await this.budgetRepo.findByCategoryAndMonth(categoryId, month)
    
    if (!budget) {
      return { exceeded: false, percentageUsed: 0, budget: null }
    }

    const { isExceeded, percentageUsed } = budget

    // Futuramente, notificar o NotificationService ou Repository se necessário
    return { exceeded: isExceeded, percentageUsed, budget }
  }

  async deleteAll(): Promise<void> {
    await this.budgetRepo.deleteAll()
  }
}
