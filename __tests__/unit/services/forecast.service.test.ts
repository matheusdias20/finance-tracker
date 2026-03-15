import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ForecastService } from '@/core/services/forecast.service'
import { mockTransactionRepo, mockCategoryRepo } from '../../mocks/repositories.mock'

describe('ForecastService', () => {
  let service: ForecastService
  let txRepo: ReturnType<typeof mockTransactionRepo>
  let catRepo: ReturnType<typeof mockCategoryRepo>

  beforeEach(() => {
    txRepo = mockTransactionRepo()
    catRepo = mockCategoryRepo()
    service = new ForecastService(txRepo, catRepo)

    // Pre-setup dummy categories
    vi.mocked(catRepo.findAll).mockResolvedValue([
      { id: 'cat1', name: 'Cat1', type: 'expense', icon: 'test', color: '#000', budgetLimit: null, createdAt: new Date(), deletedAt: null }
    ])
  })

  describe('média ponderada com 3 meses', () => {
    it('retorna a previsão baseada nos pesos 0.5, 0.3, 0.2', async () => {
      vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
        { month: '2024-09', amount: 200 }, // antigo (0.2)
        { month: '2024-10', amount: 300 }, // penúltimo (0.3)
        { month: '2024-11', amount: 400 }  // recente (0.5)
      ])

      const forecasts = await service.getForecasts(1)
      const f = forecasts[0]
      // 400*0.5 + 300*0.3 + 200*0.2 = 200 + 90 + 40 = 330
      expect(f.predictedAmount).toBe(330)
      
      // StdDev of [200, 300, 400]
      // mean = 300. var = (10000 + 0 + 10000)/3 = 6666. std = 81.65
      // 20% of 300 = 60. std > 60 -> confidence medium
      expect(f.confidence).toBe('medium')
      expect(f.lowConfidence).toBe(true)
      expect(f.minAmount).toBe(180) // 200 * 0.9
      expect(f.maxAmount).toBe(440) // 400 * 1.1
    })
  })

  describe('menos de 3 meses — lowConfidence', () => {
    it('1 mês: média simples, confidence=low, lowConfidence=true', async () => {
      vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
        { month: '2024-11', amount: 400 }
      ])

      const forecasts = await service.getForecasts(1)
      const f = forecasts[0]
      expect(f.predictedAmount).toBe(400)
      expect(f.confidence).toBe('low')
      expect(f.lowConfidence).toBe(true)
    })

    it('2 meses: média simples dos 2, confidence=medium, lowConfidence=true', async () => {
      vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
        { month: '2024-10', amount: 300 },
        { month: '2024-11', amount: 400 }
      ])

      const forecasts = await service.getForecasts(1)
      const f = forecasts[0]
      expect(f.predictedAmount).toBe(350)
      expect(f.confidence).toBe('medium')
      expect(f.lowConfidence).toBe(true)
    })
  })

  describe('sem histórico', () => {
    it('retorna predicted=0, min=0, max=0, lowConfidence=true, confidence=low', async () => {
      vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([])

      const forecasts = await service.getForecasts(1)
      const f = forecasts[0]
      expect(f.predictedAmount).toBe(0)
      expect(f.minAmount).toBe(0)
      expect(f.maxAmount).toBe(0)
      expect(f.confidence).toBe('low')
      expect(f.lowConfidence).toBe(true)
    })
  })

  describe('arredondamento decimal', () => {
    it('resultado deve ter exatamente 2 casas decimais', async () => {
      vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
        { month: '2024-09', amount: 100.333 }, // w=0.2 => 20.0666
        { month: '2024-10', amount: 200.666 }, // w=0.3 => 60.1998
        { month: '2024-11', amount: 150.001 }  // w=0.5 => 75.0005
        // total = 155.2669 => rounded 155.27
      ])

      const forecasts = await service.getForecasts(1)
      const f = forecasts[0]
      expect(f.predictedAmount).toBe(155.27)
    })
  })
})
