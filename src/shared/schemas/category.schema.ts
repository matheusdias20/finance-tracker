import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(100, 'Máximo 100 caracteres')
    .transform((s) => s.trim()),
  icon: z
    .string({ message: 'Ícone é obrigatório' })
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Nome de ícone inválido'),
  color: z
    .string({ message: 'Cor é obrigatória' })
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato #RRGGBB'),
  budgetLimit: z
    .number()
    .positive('Limite deve ser maior que zero')
    .max(9999999.99)
    .nullable()
    .optional(),
  type: z.enum(['income', 'expense'], {
    message: 'Tipo é obrigatório',
  }),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
