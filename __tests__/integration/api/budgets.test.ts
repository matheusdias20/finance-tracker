import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET as GET_MANY } from '@/app/api/budgets/route'
import { PUT } from '@/app/api/budgets/[id]/route'
import { NextRequest } from 'next/server'
import { budgetService } from '@/infrastructure/di/container'

const categoryId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
const budgetId = 'b1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'

vi.mock('@/infrastructure/di/container', () => ({
  budgetService: {
    create: vi.fn(),
    getByMonth: vi.fn(),
    update: vi.fn()
  }
}))

describe('Budgets API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(budgetService.create).mockResolvedValue({ id: budgetId, categoryId, month: '2024-12-01', limitAmount: 100 } as any)
    vi.mocked(budgetService.getByMonth).mockResolvedValue([{ id: budgetId, categoryId, month: '2024-12-01', limitAmount: 100, spentAmount: 50, percentageUsed: 50 } as any])
    vi.mocked(budgetService.update).mockResolvedValue({ id: budgetId, limitAmount: 200 } as any)
  })

  describe('GET /api/budgets', () => {
    it('retorna orçamentos do mês', async () => {
      const request = new NextRequest('http://localhost/api/budgets?month=2024-12')
      const response = await GET_MANY(request)
      expect(response.status).toBe(200)
    })

    it('retorna 400 se mês não for fornecido', async () => {
      const request = new NextRequest('http://localhost/api/budgets')
      const response = await GET_MANY(request)
      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/budgets', () => {
    it('cria orçamento com sucesso', async () => {
      const body = { categoryId, month: '2024-12', limitAmount: 100 }
      const request = new NextRequest('http://localhost/api/budgets', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(201)
    })
  })

  describe('PUT /api/budgets/[id]', () => {
    it('atualiza orçamento com sucesso', async () => {
      const request = new NextRequest(`http://localhost/api/budgets/${budgetId}`, { method: 'PUT', body: JSON.stringify({ limitAmount: 200 }) })
      const response = await PUT(request, { params: { id: budgetId } })
      expect(response.status).toBe(200)
    })
  })
})
