export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  budgetLimit: number | null
  type: CategoryType
  createdAt: Date
  deletedAt: Date | null
}

export interface CreateCategoryInput {
  name: string
  icon: string
  color: string
  budgetLimit?: number | null
  type: CategoryType
}

export interface UpdateCategoryInput {
  name?: string
  icon?: string
  color?: string
  budgetLimit?: number | null
}
