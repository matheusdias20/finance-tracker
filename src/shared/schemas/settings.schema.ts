import { z } from 'zod'

export const notificationSettingsSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  budgetExceeded: z.boolean(),
  recurringReminder: z.boolean(),
  weeklySummary: z.boolean(),
  monthlySummary: z.boolean(),
})

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
