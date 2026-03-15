import { describe, it, expect, vi } from 'vitest'
import { POST, GET as GET_MANY } from '@/app/api/categories/route'
import { GET, PUT, DELETE } from '@/app/api/categories/[id]/route'
import { NextRequest } from 'next/server'

vi.mock('@/infrastructure/di/container', () => ({
  categoryService: {
    create: vi.fn((data) => Promise.resolve({ id: 'cat-1', ...data })),
    getAll: vi.fn(() => Promise.resolve([
      { id: 'cat-1', name: 'Test', type: 'expense' }
    ])),
    getById: vi.fn((id) => Promise.resolve({ id, name: 'Test', type: 'expense' })),
    update: vi.fn((id, data) => Promise.resolve({ id, ...data })),
    delete: vi.fn(() => Promise.resolve({ success: true }))
  }
}))

describe('Categories API Integration', () => {
  describe('GET /api/categories', () => {
    it('retorna lista de categorias', async () => {
      const response = await GET_MANY()
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })
  })

  describe('POST /api/categories', () => {
    it('cria categoria com sucesso', async () => {
      const body = { name: 'Comida', icon: 'utensils', color: '#ff0000', type: 'expense' }
      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify(body)
      })
      const response = await POST(request)
      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.data.name).toBe('Comida')
    })
  })

  describe('GET /api/categories/[id]', () => {
    it('retorna categoria específica', async () => {
      const request = new NextRequest('http://localhost/api/categories/cat-1')
      const response = await GET(request, { params: { id: 'cat-1' } })
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.data.id).toBe('cat-1')
    })
  })

  describe('PUT /api/categories/[id]', () => {
    it('atualiza categoria', async () => {
      const body = { name: 'Updated' }
      const request = new NextRequest('http://localhost/api/categories/cat-1', {
        method: 'PUT',
        body: JSON.stringify(body)
      })
      const response = await PUT(request, { params: { id: 'cat-1' } })
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.data.name).toBe('Updated')
    })
  })

  describe('DELETE /api/categories/[id]', () => {
    it('remove categoria', async () => {
      const request = new NextRequest('http://localhost/api/categories/cat-1', {
        method: 'DELETE'
      })
      const response = await DELETE(request, { params: { id: 'cat-1' } })
      expect(response.status).toBe(204)
    })
  })
})
