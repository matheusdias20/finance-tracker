export type NotificationType = 'budget_exceeded' | 'recurring_reminder' | 'weekly_summary' | 'monthly_summary'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface NotificationRecord {
  id: string
  type: NotificationType
  scheduledAt: Date
  sentAt: Date | null
  status: NotificationStatus
  payload: Record<string, unknown>
}

export interface INotificationRepository {
  findPending(): Promise<NotificationRecord[]>
  wasAlreadySentToday(type: NotificationType, referenceId: string): Promise<boolean>
  markSent(id: string): Promise<void>
  markFailed(id: string): Promise<void>
  create(type: NotificationType, payload: Record<string, unknown>, scheduledAt: Date): Promise<NotificationRecord>
}
