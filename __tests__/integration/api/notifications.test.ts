import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/notifications/settings/route'
import { NextRequest } from 'next/server'
import fs from 'fs'


vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn()
  }
}))

describe('Notifications Settings API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/notifications/settings', () => {
    it('retorna defaults se arquivo não existir', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)
      const response = await GET()
      const data = await response.json()
      expect(data).toHaveProperty('enabled', true)
      expect(response.status).toBe(200)
    })

    it('retorna dados do arquivo se existir', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ email: 'test@test.com', enabled: false }))
      const response = await GET()
      const data = await response.json()
      expect(data.email).toBe('test@test.com')
      expect(data.enabled).toBe(false)
    })

    it('retorna 500 em erro de leitura', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('fail') })
      const response = await GET()
      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/notifications/settings', () => {
    it('salva configurações com sucesso (e cria diretório)', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false) // dir missing
      const body = { 
        email: 'user@test.com', 
        enabled: true, 
        preferences: { budgetAlerts: true, weeklySummary: true, monthlySummary: true, recurringReminders: true } 
      }
      const request = new NextRequest('http://localhost/api/notifications/settings', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(200)
      expect(fs.mkdirSync).toHaveBeenCalled()
      expect(fs.writeFileSync).toHaveBeenCalled()
    })

    it('retorna 400 para email inválido', async () => {
      const body = { email: 'invalid' }
      const request = new NextRequest('http://localhost/api/notifications/settings', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('retorna 500 em erro de escrita', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.writeFileSync).mockImplementation(() => { throw new Error('fail') })
      const body = { 
        email: 'user@test.com', 
        enabled: true, 
        preferences: { budgetAlerts: true, weeklySummary: true, monthlySummary: true, recurringReminders: true } 
      }
      const request = new NextRequest('http://localhost/api/notifications/settings', { method: 'POST', body: JSON.stringify(body) })
      const response = await POST(request)
      expect(response.status).toBe(500)
    })
  })
})
