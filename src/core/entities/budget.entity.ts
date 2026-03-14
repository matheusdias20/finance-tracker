export interface Budget {
  id: string
  categoryId: string
  month: Date
  limitAmount: number
  createdAt: Date
}

export interface BudgetWithSpent extends Budget {
  spentAmount: number
  percentageUsed: number
  isExceeded: boolean
}

export interface CreateBudgetInput {
  categoryId: string
  month: Date
  limitAmount: number
}
