import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as React from 'react'

const mockSend = vi.fn()

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: mockSend
      }
    }
  }
})

// Import after the mock
import { sendEmail, __resetResend } from '@/infrastructure/notifications/email.client'

describe('EmailClient Unit Tests', () => {
  const options = {
    to: 'test@test.com',
    subject: 'Test Subject',
    react: React.createElement('div', {}, 'Hello')
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    __resetResend()
    
    process.env.RESEND_API_KEY = 're_test'
    process.env.RESEND_FROM_EMAIL = 'test@from.dev'
  })

  it('sucesso na primeira tentativa', async () => {
    mockSend.mockResolvedValue({ data: { id: '123' }, error: null })
    
    const promise = sendEmail(options)
    const result = await promise
    
    expect(result.success).toBe(true)
    expect(result.id).toBe('123')
    expect(mockSend).toHaveBeenCalledTimes(1)
  })

  it('sucesso após retentativa', async () => {
    mockSend
      .mockResolvedValueOnce({ data: null, error: { message: 'Temporary failure' } })
      .mockResolvedValueOnce({ data: { id: '456' }, error: null })
    
    const promise = sendEmail(options)
    await vi.runAllTimersAsync()
    
    const result = await promise
    expect(result.success).toBe(true)
    expect(result.id).toBe('456')
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('falha definitiva após 3 tentativas', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Persistent error' } })
    
    const promise = sendEmail(options)
    await vi.runAllTimersAsync()
    await vi.runAllTimersAsync()
    await vi.runAllTimersAsync()
    
    const result = await promise
    expect(result.success).toBe(false)
    expect(result.error).toBe('Persistent error')
    expect(mockSend).toHaveBeenCalledTimes(3)
  })

  it('lida com exceções Error', async () => {
    mockSend.mockRejectedValue(new Error('fatal'))
    
    const promise = sendEmail(options)
    await vi.runAllTimersAsync()
    await vi.runAllTimersAsync()
    
    const result = await promise
    expect(result.success).toBe(false)
    expect(result.error).toBe('fatal')
  })

  it('lida com exceções não-Error', async () => {
    mockSend.mockRejectedValue('something went wrong')
    
    const promise = sendEmail(options)
    await vi.runAllTimersAsync()
    await vi.runAllTimersAsync()
    
    const result = await promise
    expect(result.success).toBe(false)
    expect(result.error).toBe('Erro desconhecido ao enviar email')
  })

  it('fallback para RESEND_FROM_EMAIL', async () => {
    delete process.env.RESEND_FROM_EMAIL
    mockSend.mockResolvedValue({ data: { id: '123' }, error: null })
    
    await sendEmail(options)
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.stringContaining('onboarding@resend.dev')
    }))
  })

  it('dummy API key fallback', async () => {
    process.env.RESEND_API_KEY = 'invalid'
    __resetResend()
    mockSend.mockResolvedValue({ data: { id: '123' }, error: null })
    
    await sendEmail(options)
    // Se não quebrou ao instanciar Resend, o fallback 're_dummy...' funcionou
    expect(mockSend).toHaveBeenCalled()
  })
})
