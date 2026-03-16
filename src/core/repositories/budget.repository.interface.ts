import type { Budget, BudgetWithSpent, CreateBudgetInput } from '../entities/budget.entity'

export interface IBudgetRepository {
  findByMonth(month: string): Promise<BudgetWithSpent[]>
  findByCategoryAndMonth(categoryId: string, month: string): Promise<BudgetWithSpent | null>
  create(input: CreateBudgetInput): Promise<Budget>
  update(id: string, limitAmount: number): Promise<Budget>
  deleteAll(): Promise<void>
}
