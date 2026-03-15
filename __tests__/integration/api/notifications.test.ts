import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '@/app/api/notifications/settings/route'
import { POST as DISPATCH_TEST } from '@/app/api/notifications/test/route'
import { NextRequest } from 'next/server'
import fs from 'fs'

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    dirname: vi.fn()
  }
}))

vi.mock('path', () => ({
  default: {
    join: vi.fn().mockReturnValue('mocked-path'),
    dirname: vi.fn().mockReturnValue('mocked-dir')
  }
}))

vi.mock('@/infrastructure/di/container', () => ({
  notificationService: {
    checkBudgetExceeded: vi.fn(() => Promise.resolve()),
    sendRecurringReminders: vi.fn(() => Promise.resolve()),
    sendWeeklySummary: vi.fn(() => Promise.resolve()),
    sendMonthlySummary: vi.fn(() => Promise.resolve())
  }
}))

describe('Notifications API Integration', () => {
  describe('Settings API', () => {
    it('GET retorna configurações padrão se arquivo não existir', async () => {
      (fs.existsSync as any).mockReturnValue(false)
      const response = await GET()
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.enabled).toBe(true)
    })

    it('POST salva novas configurações', async () => {
      const body = {
        email: 'test@example.com',
        enabled: true,
        preferences: {
          budgetAlerts: true,
          weeklySummary: false,
          monthlySummary: true,
          recurringReminders: true
        }
      }
      const request = new NextRequest('http://localhost/api/notifications/settings', {
        method: 'POST',
        body: JSON.stringify(body)
      })
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data.email).toBe('test@example.com')
    })
  })

  describe('Dispatch Test API', () => {
    it('dispara email de teste com sucesso', async () => {
      const body = { type: 'budget_exceeded' }
      const request = new NextRequest('http://localhost/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify(body)
      })
      const response = await DISPATCH_TEST(request)
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
