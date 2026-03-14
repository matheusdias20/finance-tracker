import { z } from 'zod'

export const recurrenceRuleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  day: z.number().int().min(1).max(31).optional(),
})

export const baseTransactionSchema = z.object({
  amount: z
    .number({ message: 'Valor é obrigatório' })
    .positive('Valor deve ser maior que zero')
    .max(9999999.99, 'Valor máximo excedido')
    .multipleOf(0.01, 'Máximo 2 casas decimais'),
  description: z
    .string({ message: 'Descrição é obrigatória' })
    .min(1, 'Descrição é obrigatória')
    .max(255, 'Máximo 255 caracteres')
    .transform((s) => s.replace(/<[^>]*>/g, '').trim()),
  date: z
    .string({ message: 'Data é obrigatória' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD')
    .transform((s) => new Date(s + 'T12:00:00.000Z')), // meio-dia UTC evita problema de timezone
  type: z.enum(['income', 'expense'], {
    message: 'Tipo é obrigatório ou inválido',
  }),
  categoryId: z.string().uuid('ID de categoria inválido'),
  isRecurring: z.boolean().default(false),
  recurrenceRule: recurrenceRuleSchema.nullable().optional(),
})

export const createTransactionSchema = baseTransactionSchema.refine(
  (data) => !data.isRecurring || data.recurrenceRule != null,
  { message: 'Regra de recorrência obrigatória para transações recorrentes', path: ['recurrenceRule'] }
)

export const updateTransactionSchema = baseTransactionSchema.partial().omit({ isRecurring: true, recurrenceRule: true })

export const transactionFiltersSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>
