import { createTransactionSchema, createCategorySchema } from './src/shared/schemas'; 

const t1 = createTransactionSchema.safeParse({ amount: -10, description: 'Test', date: '2024-01-01', type: 'expense', categoryId: '123e4567-e89b-12d3-a456-426614174000' });
console.log('T1:', !t1.success ? t1.error.issues[0].message : 'Success'); 

const t2 = createTransactionSchema.safeParse({ amount: 100, description: '', date: '2024-01-01', type: 'expense', categoryId: '123e4567-e89b-12d3-a456-426614174000' });
console.log('T2:', !t2.success ? t2.error.issues[0].message : 'Success'); 

const t3 = createCategorySchema.safeParse({ name: 'Cat', icon: 'home', color: 'vermelho', type: 'expense' });
console.log('T3:', !t3.success ? t3.error.issues[0].message : 'Success');
