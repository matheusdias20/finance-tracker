import { NextResponse } from 'next/server'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data', 'notification-settings.json')

const notificationSettingsSchema = z.object({
  email: z.string().email('Email inválido'),
  enabled: z.boolean().default(true),
  preferences: z.object({
    budgetAlerts: z.boolean().default(true),
    weeklySummary: z.boolean().default(true),
    monthlySummary: z.boolean().default(true),
    recurringReminders: z.boolean().default(true)
  })
})

export async function GET() {
  try {
    if (!fs.existsSync(settingsPath)) {
      return NextResponse.json({
        email: process.env.RESEND_FROM_EMAIL || '',
        enabled: true,
        preferences: {
          budgetAlerts: true,
          weeklySummary: true,
          monthlySummary: true,
          recurringReminders: true
        }
      })
    }

    const data = fs.readFileSync(settingsPath, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json({ error: 'Erro ao ler configurações' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = notificationSettingsSchema.parse(body)

    const dir = path.dirname(settingsPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(settingsPath, JSON.stringify(validated, null, 2))
    return NextResponse.json({ success: true, data: validated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 })
  }
}
