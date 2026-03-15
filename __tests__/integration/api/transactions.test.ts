import { describe, it, expect, vi } from 'vitest'
import { POST, GET } from '@/app/api/transactions/route'
import { NextRequest } from 'next/server'

// Mock stateful services
vi.mock('@/infrastructure/di/container', () => ({
  transactionService: {
    create: vi.fn((data) => Promise.resolve({ id: 'tx-1', ...data })),
    findMany: vi.fn(() => Promise.resolve({ data: [], total: 0, pages: 1 })),
    delete: vi.fn(() => Promise.resolve({ success: true }))
  }
}))

describe('Transactions API Integration', () => {
  const categoryId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'

  describe('POST /api/transactions', () => {
    it('cria transação com dados válidos → retorna 201', async () => {
      const body = {
        amount: 50.5,
        description: 'Lanche',
        date: '2024-12-01',
        type: 'expense',
        categoryId
      }
      const request = new NextRequest('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify(body)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.amount).toBe(50.5)
    })
  })

  describe('GET /api/transactions', () => {
    it('retorna lista paginada', async () => {
      const request = new NextRequest('http://localhost/api/transactions?page=1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.total).toBeDefined()
    })
  })
})
