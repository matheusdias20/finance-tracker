import { Resend } from 'resend'
import type * as React from 'react'

const getResendApiKey = () => {
  const key = process.env.RESEND_API_KEY
  if (key && key.startsWith('re_')) {
    return key
  }
  // Dummy key to prevent crash during next build (Collecting page data)
  return 're_dummy_1234567890'
}

const resend = new Resend(getResendApiKey())

interface SendEmailOptions {
  to: string
  subject: string
  react: React.ReactElement
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Envia um email via Resend com política de retry e backoff exponencial.
 * Tenta até 3 vezes (1s, 2s, 4s de espera).
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const maxAttempts = 3
  const backoffs = [1000, 2000, 4000]

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: `Finance Tracker <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: [options.to],
        subject: options.subject,
        react: options.react,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data) {
        // eslint-disable-next-line no-console
        console.log('[Email] Enviado:', options.subject)
        return { success: true, id: data.id }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao enviar email'
      
      if (attempt === maxAttempts) {
        return { success: false, error: errorMessage }
      }

      // eslint-disable-next-line no-console
      console.warn(`[Email] Falha na tentativa ${attempt} (${options.subject}): ${errorMessage}. Retentando...`)
      await sleep(backoffs[attempt - 1])
    }
  }

  return { success: false, error: 'Falha após múltiplas tentativas' }
}
