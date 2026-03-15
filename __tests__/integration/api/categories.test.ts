import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/categories/route'
import { DELETE as DELETE_ID } from '@/app/api/categories/[id]/route'
import { NextRequest } from 'next/server'

// Mock simples e síncrono para evitar problemas de hoisting/ESM
vi.mock('@/infrastructure/di/container', () => ({
  categoryService: {
    create: vi.fn((data) => Promise.resolve({ id: 'cat-test', ...data })),
    getAll: vi.fn(() => Promise.resolve([])),
    delete: vi.fn(() => Promise.resolve({ success: true }))
  }
}))

describe('Categories API Integration', () => {
  const categoryId = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
  
  describe('POST /api/categories', () => {
    it('cria categoria com dados válidos → retorna 201', async () => {
      const body = {
        name: 'Novacategoria',
        icon: 'plus',
        color: '#000000',
        type: 'expense'
      }
      const request = new NextRequest('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify(body)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.name).toBe('Novacategoria')
    })
  })

  describe('DELETE /api/categories/[id]', () => {
    it('deleta categoria → retorna 204', async () => {
      const request = new NextRequest(`http://localhost/api/categories/${categoryId}`, {
        method: 'DELETE'
      })
      const response = await DELETE_ID(request, { params: { id: categoryId } })
      expect(response.status).toBe(204)
    })
  })
})
