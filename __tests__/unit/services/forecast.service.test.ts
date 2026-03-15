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

    vi.mocked(catRepo.findAll).mockResolvedValue([
      { id: 'cat1', name: 'Cat1', type: 'expense' } as any
    ])
  })

  it('confidence high: baixa variância', async () => {
    vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
      { month: '2024-09', amount: 100 },
      { month: '2024-10', amount: 100 },
      { month: '2024-11', amount: 100 }
    ])
    // mean=100, stdDev=0. stdDev < 100*0.2 (20)
    const res = await service.getForecasts(1)
    expect(res[0].confidence).toBe('high')
    expect(res[0].lowConfidence).toBe(false)
  })

  it('confidence medium: alta variância', async () => {
    vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
      { month: '2024-09', amount: 100 },
      { month: '2024-10', amount: 200 },
      { month: '2024-11', amount: 300 }
    ])
    // mean=200, stdDev=81.65. stdDev > 200*0.2 (40)
    const res = await service.getForecasts(1)
    expect(res[0].confidence).toBe('medium')
    expect(res[0].lowConfidence).toBe(true)
  })

  it('history.length 2: confidence medium', async () => {
    vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
      { month: '2024-10', amount: 200 },
      { month: '2024-11', amount: 200 }
    ])
    const res = await service.getForecasts(1)
    expect(res[0].confidence).toBe('medium')
  })

  it('history.length 1: confidence low', async () => {
    vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
      { month: '2024-11', amount: 200 }
    ])
    const res = await service.getForecasts(1)
    expect(res[0].confidence).toBe('low')
  })

  it('retorna vazio se monthsAhead <= 0', async () => {
    const res = await service.getForecasts(0)
    expect(res).toHaveLength(0)
  })

  it('history.length 0: predictedAmount 0', async () => {
    vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([])
    const res = await service.getForecasts(1)
    expect(res[0].predictedAmount).toBe(0)
  })

  it('arredondamento decimal', async () => {
    vi.mocked(txRepo.getHistoryByCategory).mockResolvedValue([
      { month: '2024-09', amount: 100.111 },
      { month: '2024-10', amount: 100.111 },
      { month: '2024-11', amount: 100.111 }
    ])
    const res = await service.getForecasts(1)
    expect(res[0].predictedAmount).toBe(100.11)
  })
})
