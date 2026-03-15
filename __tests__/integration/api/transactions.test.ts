import { describe, it, expect, vi } from 'vitest'
import { POST, GET as GET_MANY } from '@/app/api/transactions/route'
import { GET, PUT, DELETE } from '@/app/api/transactions/[id]/route'
import { NextRequest } from 'next/server'

const categoryId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
const transactionId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'

vi.mock('@/infrastructure/di/container', () => ({
  transactionService: {
    create: vi.fn((data) => Promise.resolve({ id: transactionId, ...data })),
    findMany: vi.fn(() => Promise.resolve({ data: [], total: 0, pages: 1 })),
    findById: vi.fn((id) => Promise.resolve({ id, amount: 100, description: 'Test', date: new Date(), type: 'expense' })),
    update: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    delete: vi.fn(() => Promise.resolve({ success: true }))
  }
}))

describe('Transactions API Integration', () => {
  describe('GET /api/transactions', () => {
    it('retorna lista de transações', async () => {
      const request = new NextRequest('http://localhost/api/transactions')
      const response = await GET_MANY(request)
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.data.total).toBe(0)
    })
  })

  describe('POST /api/transactions', () => {
    it('cria transação com sucesso', async () => {
      const body = {
        amount: 100,
        description: 'Test',
        date: '2024-12-01',
        type: 'expense',
        categoryId: categoryId
      }
      const request = new NextRequest('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify(body)
      })
      const response = await POST(request)
      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.data.amount).toBe(100)
    })
  })

  describe('GET /api/transactions/[id]', () => {
    it('retorna transação específica', async () => {
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`)
      const response = await GET(request, { params: { id: transactionId } })
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.data.id).toBe(transactionId)
    })
  })

  describe('PUT /api/transactions/[id]', () => {
    it('atualiza transação', async () => {
      const body = { amount: 200 }
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      })
      const response = await PUT(request, { params: { id: transactionId } })
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.data.amount).toBe(200)
    })
  })

  describe('DELETE /api/transactions/[id]', () => {
    it('remove transação', async () => {
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`, {
        method: 'DELETE'
      })
      const response = await DELETE(request, { params: { id: transactionId } })
      expect(response.status).toBe(204)
    })
  })
})
