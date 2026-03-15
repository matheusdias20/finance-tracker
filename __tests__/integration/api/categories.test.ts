import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET as GET_MANY } from '@/app/api/categories/route'
import { GET, PUT, DELETE } from '@/app/api/categories/[id]/route'
import { NextRequest } from 'next/server'
import { categoryService } from '@/infrastructure/di/container'

vi.mock('@/infrastructure/di/container', () => ({
  categoryService: {
    create: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Categories API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(categoryService.create).mockResolvedValue({ id: 'cat-1', name: 'Test' } as any)
    vi.mocked(categoryService.getAll).mockResolvedValue([{ id: 'cat-1', name: 'Test' } as any])
    vi.mocked(categoryService.getById).mockResolvedValue({ id: 'cat-1', name: 'Test' } as any)
    vi.mocked(categoryService.update).mockResolvedValue({ id: 'cat-1', name: 'Updated' } as any)
    vi.mocked(categoryService.delete).mockResolvedValue(undefined)
  })

  describe('GET /api/categories', () => {
    it('retorna lista de categorias', async () => {
      const response = await GET_MANY()
      expect(response.status).toBe(200)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(categoryService.getAll).mockRejectedValue(new Error('fail'))
      const response = await GET_MANY()
      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/categories', () => {
    it('cria categoria com sucesso', async () => {
      const body = { name: 'Comida', icon: 'utensils', color: '#ff0000', type: 'expense' }
      const request = new NextRequest('http://localhost/api/categories', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(201)
    })

    it('retorna 400 para body inválido', async () => {
      const request = new NextRequest('http://localhost/api/categories', { method: 'POST', body: JSON.stringify({}) })
      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(categoryService.create).mockRejectedValue(new Error('fail'))
      const body = { name: 'Comida', icon: 'utensils', color: '#ff0000', type: 'expense' }
      const request = new NextRequest('http://localhost/api/categories', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })

  describe('GET /api/categories/[id]', () => {
    it('retorna categoria específica', async () => {
      const request = new NextRequest('http://localhost/api/categories/cat-1')
      const response = await GET(request, { params: { id: 'cat-1' } })
      expect(response.status).toBe(200)
    })

    it('retorna 404 se não encontrada', async () => {
      vi.mocked(categoryService.getById).mockResolvedValue(null as any) // Force null
      const response = await GET(new NextRequest('http://localhost/api/categories/none'), { params: { id: 'none' } })
      expect(response.status).toBe(404)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(categoryService.getById).mockRejectedValue(new Error('fail'))
      const response = await GET(new NextRequest('http://localhost/api/categories/cat-1'), { params: { id: 'cat-1' } })
      expect(response.status).toBe(500)
    })
  })

  describe('PUT /api/categories/[id]', () => {
    it('atualiza com sucesso', async () => {
      const request = new NextRequest('http://localhost/api/categories/cat-1', { method: 'PUT', body: JSON.stringify({ name: 'New' }) })
      const response = await PUT(request, { params: { id: 'cat-1' } })
      expect(response.status).toBe(200)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(categoryService.update).mockRejectedValue(new Error('fail'))
      const request = new NextRequest('http://localhost/api/categories/cat-1', { method: 'PUT', body: JSON.stringify({ name: 'New' }) })
      const response = await PUT(request, { params: { id: 'cat-1' } })
      expect(response.status).toBe(500)
    })
    
    it('retorna 400 para body invalido', async () => {
      const request = new NextRequest('http://localhost/api/categories/cat-1', { method: 'PUT', body: JSON.stringify({ name: '' }) })
      const response = await PUT(request, { params: { id: 'cat-1' } })
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/categories/[id]', () => {
    it('remove com sucesso', async () => {
      const request = new NextRequest('http://localhost/api/categories/cat-1', { method: 'DELETE' })
      const response = await DELETE(request, { params: { id: 'cat-1' } })
      expect(response.status).toBe(204)
    })

    it('retorna 500 em erro do serviço', async () => {
      vi.mocked(categoryService.delete).mockRejectedValue(new Error('fail'))
      const request = new NextRequest('http://localhost/api/categories/cat-1', { method: 'DELETE' })
      const response = await DELETE(request, { params: { id: 'cat-1' } })
      expect(response.status).toBe(500)
    })
  })
})
