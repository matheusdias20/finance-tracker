import { describe, it, expect } from 'vitest'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react'

import {
  BudgetExceededEmail,
  RecurringReminderEmail,
  WeeklySummaryEmail,
  MonthlySummaryEmail
} from '@/infrastructure/notifications/templates'

describe('Email Templates Branch Coverage', () => {
  it('BudgetExceededEmail handles default props', () => {
    // @ts-ignore - testing default props
    const element = BudgetExceededEmail({})
    expect(element).toBeDefined()
  })

  it('RecurringReminderEmail handles default props', () => {
    // @ts-ignore
    const element = RecurringReminderEmail({})
    expect(element).toBeDefined()
  })

  it('WeeklySummaryEmail handles default props', () => {
    // @ts-ignore
    const element = WeeklySummaryEmail({})
    expect(element).toBeDefined()
  })

  it('MonthlySummaryEmail handles default props', () => {
    // @ts-ignore
    const element = MonthlySummaryEmail({})
    expect(element).toBeDefined()
  })
  
  it('WeeklySummaryEmail renders with positive comparisons', () => {
    const element = WeeklySummaryEmail({
      weekLabel: 'Test',
      totalIncome: 100,
      totalExpense: 50,
      balance: 50,
      transactionCount: 5,
      comparedToLastWeek: 15.5,
      topCategory: { name: 'Food', amount: 30 }
    })
    expect(element).toBeDefined()
  })
});
