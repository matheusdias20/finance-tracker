import { z } from 'zod'

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid('ID de categoria inválido'),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Formato inválido. Use YYYY-MM')
    .transform((s) => new Date(s + '-01T00:00:00.000Z')),
  limitAmount: z
    .number({ message: 'Limite é obrigatório' })
    .positive('Limite deve ser maior que zero')
    .max(9999999.99, 'Valor máximo excedido'),
})

export const updateBudgetSchema = z.object({
  limitAmount: z
    .number({ message: 'Limite é obrigatório' })
    .positive('Limite deve ser maior que zero')
    .max(9999999.99),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
