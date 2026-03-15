import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/cron/process-recurring/route'
import { NextRequest } from 'next/server'

vi.mock('@/infrastructure/di/container', () => ({
  recurringService: {
    processRecurring: vi.fn(() => Promise.resolve({ processed: 5, errors: [] }))
  },
  notificationService: {
    sendRecurringReminders: vi.fn(() => Promise.resolve())
  }
}))

describe('Cron API Integration', () => {
  it('processa recorrências com sucesso', async () => {
    process.env.CRON_SECRET = 'test-secret'
    const request = new NextRequest('http://localhost/api/cron/process-recurring', {
      method: 'POST',
      headers: { 'authorization': 'Bearer test-secret' }
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.processed).toBe(5)
  })
})
