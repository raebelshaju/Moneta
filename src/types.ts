export const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Travel', 'Groceries', 'Other'] as const
export const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other'] as const
export type ExpenseCategory = typeof categories[number]
export type PaymentMethod = typeof paymentMethods[number]
export type Expense = { id: string; amount: number; category: ExpenseCategory; description: string; date: string; paymentMethod: PaymentMethod; createdAt: string; updatedAt: string }
