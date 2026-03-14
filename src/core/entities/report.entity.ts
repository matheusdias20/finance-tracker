export interface CategoryReport {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  totalAmount: number
  percentage: number
  transactionCount: number
}

export interface MonthlyEvolution {
  month: string // YYYY-MM
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface ForecastItem {
  categoryId: string
  categoryName: string
  predictedAmount: number
  minAmount: number
  maxAmount: number
  confidence: 'high' | 'medium' | 'low'
  lowConfidence: boolean
}
