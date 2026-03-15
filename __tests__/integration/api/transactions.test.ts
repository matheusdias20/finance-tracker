import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET as GET_MANY } from '@/app/api/transactions/route'
import { GET, PUT, DELETE } from '@/app/api/transactions/[id]/route'
import { NextRequest } from 'next/server'
import { transactionService } from '@/infrastructure/di/container'

const categoryId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
const transactionId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'

vi.mock('@/infrastructure/di/container', () => ({
  transactionService: {
    create: vi.fn(),
    findMany: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Transactions API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(transactionService.create).mockResolvedValue({ id: transactionId, amount: 100 } as any)
    vi.mocked(transactionService.findMany).mockResolvedValue({ data: [], total: 0, page: 1 } as any)
    vi.mocked(transactionService.findById).mockResolvedValue({ id: transactionId, amount: 100 } as any)
    vi.mocked(transactionService.update).mockResolvedValue({ id: transactionId, amount: 100 } as any)
    vi.mocked(transactionService.delete).mockResolvedValue(undefined)
  })

  describe('GET /api/transactions', () => {
    it('retorna lista de transações', async () => {
      const request = new NextRequest('http://localhost/api/transactions')
      const response = await GET_MANY(request)
      expect(response.status).toBe(200)
    })

    it('retorna 400 para filtros inválidos', async () => {
      const request = new NextRequest('http://localhost/api/transactions?page=invalid')
      const response = await GET_MANY(request)
      expect(response.status).toBe(400)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(transactionService.findMany).mockRejectedValue(new Error('fail'))
      const request = new NextRequest('http://localhost/api/transactions')
      const response = await GET_MANY(request)
      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/transactions', () => {
    it('cria transação com sucesso', async () => {
      const body = { amount: 100, description: 'T', date: '2024-12-01', type: 'expense', categoryId }
      const request = new NextRequest('http://localhost/api/transactions', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(201)
    })

    it('retorna 400 para body inválido', async () => {
      const request = new NextRequest('http://localhost/api/transactions', { method: 'POST', body: JSON.stringify({}) })
      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(transactionService.create).mockRejectedValue(new Error('fail'))
      const body = { amount: 100, description: 'T', date: '2024-12-01', type: 'expense', categoryId }
      const request = new NextRequest('http://localhost/api/transactions', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })

  describe('GET /api/transactions/[id]', () => {
    it('retorna transação específica', async () => {
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`)
      const response = await GET(request, { params: { id: transactionId } })
      expect(response.status).toBe(200)
    })

    it('retorna 404 se não encontrada', async () => {
      vi.mocked(transactionService.findById).mockResolvedValue(null as any)
      const request = new NextRequest(`http://localhost/api/transactions/none`)
      const response = await GET(request, { params: { id: 'none' } })
      expect(response.status).toBe(404)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(transactionService.findById).mockRejectedValue(new Error('fail'))
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`)
      const response = await GET(request, { params: { id: transactionId } })
      expect(response.status).toBe(500)
    })
  })

  describe('PUT /api/transactions/[id]', () => {
    it('atualiza com sucesso', async () => {
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`, { method: 'PUT', body: JSON.stringify({ amount: 50 }) })
      const response = await PUT(request, { params: { id: transactionId } })
      expect(response.status).toBe(200)
    })

    it('retorna 400 para body inválido', async () => {
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`, { method: 'PUT', body: JSON.stringify({ amount: -1 }) })
      const response = await PUT(request, { params: { id: transactionId } })
      expect(response.status).toBe(400)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(transactionService.update).mockRejectedValue(new Error('fail'))
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`, { method: 'PUT', body: JSON.stringify({ amount: 50 }) })
      const response = await PUT(request, { params: { id: transactionId } })
      expect(response.status).toBe(500)
    })
  })

  describe('DELETE /api/transactions/[id]', () => {
    it('remove com sucesso', async () => {
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`, { method: 'DELETE' })
      const response = await DELETE(request, { params: { id: transactionId } })
      expect(response.status).toBe(204)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(transactionService.delete).mockRejectedValue(new Error('fail'))
      const request = new NextRequest(`http://localhost/api/transactions/${transactionId}`, { method: 'DELETE' })
      const response = await DELETE(request, { params: { id: transactionId } })
      expect(response.status).toBe(500)
    })
  })
})
