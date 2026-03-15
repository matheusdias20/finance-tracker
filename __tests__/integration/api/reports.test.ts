import { describe, it, expect, vi } from 'vitest'
import { GET as getByCategory } from '@/app/api/reports/by-category/route'
import { NextRequest } from 'next/server'

vi.mock('@/infrastructure/di/container', () => ({
  transactionService: {
    getSummaryByCategory: vi.fn(() => Promise.resolve([
      { categoryId: 'cat-1', totalAmount: 100 },
      { categoryId: 'cat-2', totalAmount: 300 }
    ]))
  },
  categoryService: {
    getAll: vi.fn(() => Promise.resolve([
      { id: 'cat-1', name: 'Food', color: '#FF0000', icon: 'fastfood' },
      { id: 'cat-2', name: 'Rent', color: '#0000FF', icon: 'home' }
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
      expect(data.data).toHaveLength(2)
      expect(data.data[0].percentage).toBe(75)
      expect(data.data[1].percentage).toBe(25)
    })
  })
})
