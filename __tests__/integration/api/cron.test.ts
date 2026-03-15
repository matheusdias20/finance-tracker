import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/cron/process-recurring/route'
import { NextRequest } from 'next/server'
import { recurringService, notificationService } from '@/infrastructure/di/container'

vi.mock('@/infrastructure/di/container', () => ({
  recurringService: {
    processRecurring: vi.fn()
  },
  notificationService: {
    sendRecurringReminders: vi.fn()
  }
}))

describe('Cron API Integration', () => {
  const secret = 'test-secret'
  
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = secret
  })

  it('retorna 401 se não autorizado', async () => {
    const request = new NextRequest('http://localhost/api/cron/process-recurring', {
      method: 'POST',
      headers: { 'authorization': 'Bearer wrong' }
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('processa recorrências com sucesso', async () => {
    vi.mocked(recurringService.processRecurring).mockResolvedValue({ processed: 5, errors: [] })
    
    const request = new NextRequest('http://localhost/api/cron/process-recurring', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${secret}` }
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(recurringService.processRecurring).toHaveBeenCalled()
    expect(notificationService.sendRecurringReminders).toHaveBeenCalled()
  })

  it('retorna 500 em erro interno', async () => {
    vi.mocked(recurringService.processRecurring).mockRejectedValue(new Error('fail'))
    
    const request = new NextRequest('http://localhost/api/cron/process-recurring', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${secret}` }
    })
    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})
