import { and, eq, lte, sql, gte } from 'drizzle-orm'
import { Database } from '../client'
import { emailNotifications } from '../schema/email_notifications'
import { DatabaseError } from '../../errors'
import type { 
  INotificationRepository, 
  NotificationRecord, 
  NotificationType 
} from '../../../core/repositories/notification.repository.interface'

export class NotificationRepository implements INotificationRepository {
  constructor(private readonly db: Database) {}

  async findPending(): Promise<NotificationRecord[]> {
    try {
      const records = await this.db
        .select()
        .from(emailNotifications)
        .where(
          and(
            eq(emailNotifications.status, 'pending'),
            lte(emailNotifications.scheduledAt, new Date())
          )
        )

      return records.map(this.mapToEntity)
    } catch (error) {
      throw new DatabaseError(`Failed to fetch pending notifications: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async wasAlreadySentToday(type: NotificationType, referenceId: string): Promise<boolean> {
    try {
      const [result] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(emailNotifications)
        .where(
          and(
            eq(emailNotifications.type, type),
            sql`${emailNotifications.payload}->>'referenceId' = ${referenceId}`,
            gte(emailNotifications.sentAt, sql`CURRENT_DATE`)
          )
        )

      return (result?.count || 0) > 0
    } catch (error) {
      throw new DatabaseError(`Failed to check if notification was sent today: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async markSent(id: string): Promise<void> {
    try {
      await this.db
        .update(emailNotifications)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(emailNotifications.id, id))
    } catch (error) {
      throw new DatabaseError(`Failed to mark notification as sent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async markFailed(id: string): Promise<void> {
    try {
      await this.db
        .update(emailNotifications)
        .set({ status: 'failed' })
        .where(eq(emailNotifications.id, id))
    } catch (error) {
      throw new DatabaseError(`Failed to mark notification as failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async create(type: NotificationType, payload: Record<string, unknown>, scheduledAt: Date): Promise<NotificationRecord> {
    try {
      const [record] = await this.db
        .insert(emailNotifications)
        .values({
          type,
          payload,
          scheduledAt,
          status: 'pending'
        })
        .returning()

      return this.mapToEntity(record)
    } catch (error) {
      throw new DatabaseError(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapToEntity(record: typeof emailNotifications.$inferSelect): NotificationRecord {
    return {
      id: record.id,
      type: record.type as NotificationType,
      scheduledAt: record.scheduledAt,
      sentAt: record.sentAt,
      status: record.status as NotificationRecord['status'],
      payload: record.payload as Record<string, unknown>,
    }
  }
}
