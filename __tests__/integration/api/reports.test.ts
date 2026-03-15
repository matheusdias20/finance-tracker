import { describe, it, expect, vi } from 'vitest'
import { GET as getByCategory } from '@/app/api/reports/by-category/route'
import { GET as getForecast } from '@/app/api/reports/forecast/route'
import { GET as getMonthlyEvolution } from '@/app/api/reports/monthly-evolution/route'
import { NextRequest } from 'next/server'

vi.mock('@/infrastructure/di/container', () => ({
  transactionService: {
    getSummaryByCategory: vi.fn(() => Promise.resolve([
      { categoryId: 'cat-2', totalAmount: 300 },
      { categoryId: 'cat-1', totalAmount: 100 }
    ])),
    getMonthlyEvolution: vi.fn(() => Promise.resolve([
      { month: '2024-11', totalIncome: 5000, totalExpense: 4000 },
      { month: '2024-12', totalIncome: 6000, totalExpense: 3000 }
    ]))
  },
  categoryService: {
    getAll: vi.fn(() => Promise.resolve([
      { id: 'cat-1', name: 'Food', color: '#FF0000', icon: 'fastfood' },
      { id: 'cat-2', name: 'Rent', color: '#0000FF', icon: 'home' }
    ]))
  },
  forecastService: {
    getForecasts: vi.fn(() => Promise.resolve([
      { month: '2025-01', predictedIncome: 5000, predictedExpense: 4000, confidence: 0.8 }
    ]))
  }
}))

describe('Reports API Integration', () => {
  describe('GET /api/reports/by-category', () => {
    it('retorna relatório formatado com percentuais', async () => {
      const request = new NextRequest('http://localhost/api/reports/by-category?month=2024-12')
      const response = await getByCategory(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data[0].percentage).toBe(75)
    })
  })

  describe('GET /api/reports/forecast', () => {
    it('retorna previsões futuras', async () => {
      const request = new NextRequest('http://localhost/api/reports/forecast?months=3')
      const response = await getForecast(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })
  })

  describe('GET /api/reports/monthly-evolution', () => {
    it('retorna evolução mensal', async () => {
      const request = new NextRequest('http://localhost/api/reports/monthly-evolution?months=12')
      const response = await getMonthlyEvolution(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(2)
      expect(data.data[1].balance).toBe(3000)
    })
  })
})
