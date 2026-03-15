import { describe, it, expect, beforeEach } from 'vitest'
import { ForecastService } from '../../../src/core/services/forecast.service'
import { createMockTransactionRepository, createMockCategoryRepository } from './mocks'

describe('ForecastService', () => {
  let service: ForecastService
  let mockTxRepo: ReturnType<typeof createMockTransactionRepository>
  let mockCatRepo: ReturnType<typeof createMockCategoryRepository>

  beforeEach(() => {
    mockTxRepo = createMockTransactionRepository()
    mockCatRepo = createMockCategoryRepository()
    service = new ForecastService(mockTxRepo, mockCatRepo)
  })

  it('should return empty list if _monthsAhead <= 0', async () => {
    const result = await service.getForecasts(0)
    expect(result).toEqual([])
  })

  it('should compute forecasting based on history categories', async () => {
    const fakeCats = [
      { id: '1', name: 'Alimentação', type: 'expense' },
      { id: '2', name: 'Salário', type: 'income' }, // Should be ignored
      { id: '3', name: 'Assinaturas', type: 'expense' },
      { id: '4', name: 'Energia', type: 'expense' },
    ]
    mockCatRepo.findAll.mockResolvedValue(fakeCats as any)
    
    // mock history items oldest to newest
    // Alimentação - 0 months
    mockTxRepo.getHistoryByCategory.mockImplementation(async (catId) => {
      if (catId === '1') return []
      if (catId === '3') return [{ month: '2024-01', amount: 100 }] // 1 month
      if (catId === '4') return [
        { month: '2024-01', amount: 105 },
        { month: '2024-02', amount: 100 },
        { month: '2024-03', amount: 95 }
      ] // 3 months -> stable variance
      return []
    })

    const result = await service.getForecasts(1)
    expect(result).toHaveLength(3) // 3 expense categories
    
    // Category 1 - 0 months
    expect(result[0].categoryId).toBe('1')
    expect(result[0].predictedAmount).toBe(0)
    expect(result[0].confidence).toBe('low')

    // Category 3 - 1 month
    expect(result[1].categoryId).toBe('3')
    expect(result[1].predictedAmount).toBe(100)
    expect(result[1].confidence).toBe('low')
    
    // Category 4 - 3 months
    // avg = 100. Weights: w1=0.2 (105)=21, w2=0.3 (100)=30, w3=0.5 (95)=47.5 -> 21+30+47.5 = 98.5
    expect(result[2].categoryId).toBe('4')
    expect(result[2].predictedAmount).toBeCloseTo(98.5)
    // Variance is (25 + 0 + 25) / 3 = 16.66. StdDev = 4.08 < 20% of 100 (20) -> confidence HIGH!
    expect(result[2].confidence).toBe('high')
    expect(result[2].lowConfidence).toBe(false)
  })
})
