import type { Expense } from './types'

export const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
export const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const todayKey = () => dateKey(new Date())
export const formatDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day))
}
export const monthKey = (value: string) => value.slice(0, 7)
export const monthLabel = (value: string) => {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1))
}
export const isExpense = (value: unknown): value is Expense => {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<Expense>
  return typeof item.id === 'string' && typeof item.amount === 'number' && item.amount > 0 && typeof item.category === 'string' && typeof item.description === 'string' && typeof item.date === 'string' && typeof item.paymentMethod === 'string' && typeof item.createdAt === 'string' && typeof item.updatedAt === 'string'
}
