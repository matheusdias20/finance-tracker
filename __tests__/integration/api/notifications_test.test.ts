import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/notifications/test/route'
import { NextRequest } from 'next/server'
import { notificationService } from '@/infrastructure/di/container'

vi.mock('@/infrastructure/di/container', () => ({
  notificationService: {
    checkBudgetExceeded: vi.fn(),
    sendRecurringReminders: vi.fn(),
    sendWeeklySummary: vi.fn(),
    sendMonthlySummary: vi.fn()
  }
}))

describe('Notifications Test API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(notificationService.checkBudgetExceeded).mockResolvedValue(undefined)
    vi.mocked(notificationService.sendRecurringReminders).mockResolvedValue(undefined)
    vi.mocked(notificationService.sendWeeklySummary).mockResolvedValue(undefined)
    vi.mocked(notificationService.sendMonthlySummary).mockResolvedValue(undefined)
  })

  it('dispara budget_exceeded com sucesso', async () => {
    const req = new NextRequest('http://localhost/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type: 'budget_exceeded' })
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(notificationService.checkBudgetExceeded).toHaveBeenCalled()
  })

  it('dispara recurring_reminder com sucesso', async () => {
    const req = new NextRequest('http://localhost/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type: 'recurring_reminder' })
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(notificationService.sendRecurringReminders).toHaveBeenCalled()
  })

  it('dispara weekly_summary com sucesso', async () => {
    const req = new NextRequest('http://localhost/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type: 'weekly_summary' })
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(notificationService.sendWeeklySummary).toHaveBeenCalled()
  })

  it('dispara monthly_summary com sucesso', async () => {
    const req = new NextRequest('http://localhost/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type: 'monthly_summary' })
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(notificationService.sendMonthlySummary).toHaveBeenCalled()
  })

  it('retorna 400 para tipo inválido', async () => {
    const req = new NextRequest('http://localhost/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type: 'unknown_type' })
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 500 em erro do serviço', async () => {
    vi.mocked(notificationService.sendWeeklySummary).mockRejectedValue(new Error('falha'))
    const req = new NextRequest('http://localhost/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type: 'weekly_summary' })
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
