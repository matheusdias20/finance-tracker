import type { ITransactionRepository } from '../repositories/transaction.repository.interface'
import type { ICategoryRepository } from '../repositories/category.repository.interface'
import type { ForecastItem } from '../entities/report.entity'

export class ForecastService {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly categoryRepo: ICategoryRepository
  ) {}

  async getForecasts(monthsAhead: number): Promise<ForecastItem[]> {
    if (monthsAhead <= 0) return []

    const categories = await this.categoryRepo.findAll()
    const activeExpenseCategories = categories.filter(c => c.type === 'expense')
    
    const forecasts: ForecastItem[] = []

    for (const category of activeExpenseCategories) {
      // Obter 3 meses de histórico
      const history = await this.transactionRepo.getHistoryByCategory(category.id, 3)
      
      let predictedAmount = 0
      let confidence: 'high' | 'medium' | 'low' = 'low'
      let lowConfidence = true
      let minAmount = 0
      let maxAmount = 0

      if (history.length === 0) {
        predictedAmount = 0
      } else if (history.length >= 1 && history.length <= 2) {
        const sum = history.reduce((acc, curr) => acc + curr.amount, 0)
        predictedAmount = sum / history.length
        confidence = history.length === 1 ? 'low' : 'medium'
      } else {
        // history retornado é do mais antigo para o mais recente
        const w1 = 0.2 // mais antigo
        const w2 = 0.3 // penúltimo
        const w3 = 0.5 // mais recente
        const len = history.length
        
        predictedAmount = 
          (history[len - 3].amount * w1) + 
          (history[len - 2].amount * w2) + 
          (history[len - 1].amount * w3)
        
        const mean = history.reduce((acc, curr) => acc + curr.amount, 0) / 3
        const variance = history.reduce((acc, curr) => acc + Math.pow(curr.amount - mean, 2), 0) / 3
        const stdDev = Math.sqrt(variance)

        if (mean > 0 && stdDev < mean * 0.2) {
          confidence = 'high'
          lowConfidence = false
        } else {
          confidence = 'medium'
        }
      }

      if (history.length > 0) {
        const amounts = history.map(h => h.amount)
        minAmount = Math.min(...amounts) * 0.9
        maxAmount = Math.max(...amounts) * 1.1
      }

      forecasts.push({
        categoryId: category.id,
        categoryName: category.name,
        predictedAmount: Number(predictedAmount.toFixed(2)),
        minAmount: Number(minAmount.toFixed(2)),
        maxAmount: Number(maxAmount.toFixed(2)),
        confidence,
        lowConfidence
      })
    }

    return forecasts
  }
}
