import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as GET_CATEGORY } from '@/app/api/reports/by-category/route'
import { GET as GET_FORECAST } from '@/app/api/reports/forecast/route'
import { GET as GET_EVOLUTION } from '@/app/api/reports/monthly-evolution/route'
import { NextRequest } from 'next/server'
import { transactionService, categoryService, forecastService } from '@/infrastructure/di/container'

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn)
}))

vi.mock('@/infrastructure/di/container', () => ({
  transactionService: {
    getSummaryByCategory: vi.fn(),
    getMonthlyEvolution: vi.fn()
  },
  categoryService: {
    getAll: vi.fn()
  },
  forecastService: {
    getForecasts: vi.fn()
  }
}))

describe('Reports API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(transactionService.getSummaryByCategory).mockResolvedValue([])
    vi.mocked(transactionService.getMonthlyEvolution).mockResolvedValue([])
    vi.mocked(categoryService.getAll).mockResolvedValue([])
    vi.mocked(forecastService.getForecasts).mockResolvedValue([])
  })

  describe('GET /api/reports/by-category', () => {
    it('retorna 400 se mês não for fornecido', async () => {
      const request = new NextRequest('http://localhost/api/reports/by-category')
      const response = await GET_CATEGORY(request)
      expect(response.status).toBe(400)
    })

    it('retorna 400 se formato do mês for inválido', async () => {
      const request = new NextRequest('http://localhost/api/reports/by-category?month=2024-1')
      const response = await GET_CATEGORY(request)
      expect(response.status).toBe(400)
    })

    it('retorna relatório com sucesso e mapeia categorias', async () => {
      vi.mocked(transactionService.getSummaryByCategory).mockResolvedValue([
        { categoryId: 'cat-1', totalAmount: 100 } as any
      ])
      vi.mocked(categoryService.getAll).mockResolvedValue([
        { id: 'cat-1', name: 'Comida', color: '#ff0000', icon: 'i' } as any
      ])
      
      const request = new NextRequest('http://localhost/api/reports/by-category?month=2024-12')
      const response = await GET_CATEGORY(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data[0].name).toBe('Comida')
    })
    
    it('fallback para categoria desconhecida', async () => {
      vi.mocked(transactionService.getSummaryByCategory).mockResolvedValue([
        { categoryId: 'cat-none', totalAmount: 100 } as any
      ])
      const request = new NextRequest('http://localhost/api/reports/by-category?month=2024-12')
      const response = await GET_CATEGORY(request)
      const data = await response.json()
      expect(data.data[0].name).toBe('Desconhecida')
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(transactionService.getSummaryByCategory).mockRejectedValue(new Error('fail'))
      const request = new NextRequest('http://localhost/api/reports/by-category?month=2024-12')
      const response = await GET_CATEGORY(request)
      expect(response.status).toBe(500)
    })
  })

  describe('GET /api/reports/forecast', () => {
    it('retorna previsão com sucesso (default 3 months)', async () => {
      const request = new NextRequest('http://localhost/api/reports/forecast')
      const response = await GET_FORECAST(request)
      expect(response.status).toBe(200)
      expect(forecastService.getForecasts).toHaveBeenCalledWith(3)
    })

    it('retorna 400 para months inválido', async () => {
      const request = new NextRequest('http://localhost/api/reports/forecast?months=10')
      const response = await GET_FORECAST(request)
      expect(response.status).toBe(400)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(forecastService.getForecasts).mockRejectedValue(new Error('fail'))
      const request = new NextRequest('http://localhost/api/reports/forecast')
      const response = await GET_FORECAST(request)
      expect(response.status).toBe(500)
    })
  });

  describe('GET /api/reports/monthly-evolution', () => {
    it('retorna evolução com sucesso (default 12 months)', async () => {
      const request = new NextRequest('http://localhost/api/reports/monthly-evolution')
      const response = await GET_EVOLUTION(request)
      expect(response.status).toBe(200)
      expect(transactionService.getMonthlyEvolution).toHaveBeenCalledWith(12)
    })

    it('retorna 400 para months inválido', async () => {
      const request = new NextRequest('http://localhost/api/reports/monthly-evolution?months=30')
      const response = await GET_EVOLUTION(request)
      expect(response.status).toBe(400)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(transactionService.getMonthlyEvolution).mockRejectedValue(new Error('fail'))
      const request = new NextRequest('http://localhost/api/reports/monthly-evolution')
      const response = await GET_EVOLUTION(request)
      expect(response.status).toBe(500)
    })
  })
})
