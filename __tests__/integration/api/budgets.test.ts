import { describe, it, expect, vi } from 'vitest'
import { POST, GET } from '@/app/api/budgets/route'
import { PUT } from '@/app/api/budgets/[id]/route'
import { NextRequest } from 'next/server'

const categoryId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'

vi.mock('@/infrastructure/di/container', () => ({
  budgetService: {
    getByMonth: vi.fn(() => Promise.resolve([
      { id: 'b1', categoryId, month: new Date(), limitAmount: 1000, spentAmount: 500, percentageUsed: 50, isExceeded: false }
    ])),
    create: vi.fn((data) => Promise.resolve({ id: 'b1', ...data, createdAt: new Date() })),
    update: vi.fn((id, limitAmount) => Promise.resolve({ id, categoryId, month: new Date(), limitAmount, createdAt: new Date() }))
  }
}))

describe('Budgets API Integration', () => {
  describe('GET /api/budgets', () => {
    it('retorna orçamentos do mês', async () => {
      const request = new NextRequest('http://localhost/api/budgets?month=2024-12')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toBeDefined()
    })
  })

  describe('POST /api/budgets', () => {
    it('cria orçamento com sucesso', async () => {
      const body = {
        categoryId,
        month: '2024-12',
        limitAmount: 1500
      }
      const request = new NextRequest('http://localhost/api/budgets', {
        method: 'POST',
        body: JSON.stringify(body)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.limitAmount).toBe(1500)
    })
  })

  describe('PUT /api/budgets/[id]', () => {
    it('atualiza limite do orçamento', async () => {
      const body = { limitAmount: 2000 }
      const request = new NextRequest('http://localhost/api/budgets/b1', {
        method: 'PUT',
        body: JSON.stringify(body)
      })

      const response = await PUT(request, { params: { id: 'b1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.limitAmount).toBe(2000)
    })
  })
})
