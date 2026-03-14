import { vi } from 'vitest'
import '@testing-library/jest-dom'

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'mock-email-id', error: null }),
    },
  })),
}))

vi.setSystemTime(new Date('2024-12-01T10:00:00.000Z'))
