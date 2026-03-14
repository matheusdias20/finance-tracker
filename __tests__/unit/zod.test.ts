import { describe, it, expect } from 'vitest';
import { createTransactionSchema, createCategorySchema } from '@/shared/schemas';

describe('Shared Zod Schemas Validation', () => {
  it('should invalidate negative amounts', () => {
    const res = createTransactionSchema.safeParse({ amount: -10, description: 'Test', date: '2024-01-01', type: 'expense', categoryId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toBe('Valor deve ser maior que zero');
  });

  it('should invalidate empty descriptions', () => {
    const res = createTransactionSchema.safeParse({ amount: 100, description: '', date: '2024-01-01', type: 'expense', categoryId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(res.success).toBe(false);
    if (!res.success) {
      // It can either be 'Descrição é obrigatória' due to empty string, or min length
      expect(res.error.issues[0].message).toBe('Descrição é obrigatória');
    }
  });

  it('should invalidate invalid hex colors', () => {
    const res = createCategorySchema.safeParse({ name: 'Cat', icon: 'home', color: 'vermelho', type: 'expense' });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toBe('Cor deve estar no formato #RRGGBB');
  });
});
