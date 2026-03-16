import { notificationSettingsSchema } from '@/shared/schemas/settings.schema'
import { handleApiError, successResponse } from '@/infrastructure/errors/handler'
import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data', 'notification-settings.json')

export async function GET() {
  try {
    if (!fs.existsSync(settingsPath)) {
      return successResponse({
        email: process.env.RESEND_FROM_EMAIL || '',
        budgetExceeded: true,
        recurringReminder: true,
        weeklySummary: true,
        monthlySummary: true,
      })
    }

    const data = fs.readFileSync(settingsPath, 'utf-8')
    const saved = JSON.parse(data)
    
    // Mapear de estrutura antiga (aninhada) para nova (flat) se necessário
    const flatData = {
      email: saved.email || '',
      budgetExceeded: saved.preferences?.budgetAlerts ?? saved.budgetExceeded ?? true,
      recurringReminder: saved.preferences?.recurringReminders ?? saved.recurringReminder ?? true,
      weeklySummary: saved.preferences?.weeklySummary ?? saved.weeklySummary ?? true,
      monthlySummary: saved.preferences?.monthlySummary ?? saved.monthlySummary ?? true,
    }

    return successResponse(flatData)
  } catch (error) {
    return handleApiError(error)
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
    return successResponse(validated)
  } catch (error) {
    return handleApiError(error)
  }
}
