import type { Expense } from './types'
import { todayKey } from './utils'

const now = new Date().toISOString()
const today = new Date()
const daysAgo = (days: number) => { const value = new Date(today); value.setDate(value.getDate() - days); return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }
export const demoExpenses: Expense[] = [
  { id: 'sample-1', amount: 420, category: 'Food', description: 'Coffee & croissant', date: todayKey(), paymentMethod: 'UPI', createdAt: now, updatedAt: now },
  { id: 'sample-2', amount: 1250, category: 'Transport', description: 'Ride to the office', date: daysAgo(1), paymentMethod: 'UPI', createdAt: now, updatedAt: now },
  { id: 'sample-3', amount: 2890, category: 'Groceries', description: 'Weekly groceries', date: daysAgo(2), paymentMethod: 'Credit Card', createdAt: now, updatedAt: now },
  { id: 'sample-4', amount: 799, category: 'Entertainment', description: 'Movie night', date: daysAgo(3), paymentMethod: 'Debit Card', createdAt: now, updatedAt: now },
  { id: 'sample-5', amount: 1800, category: 'Bills', description: 'Internet bill', date: daysAgo(5), paymentMethod: 'Bank Transfer', createdAt: now, updatedAt: now },
  { id: 'sample-6', amount: 650, category: 'Food', description: 'Lunch with Maya', date: daysAgo(8), paymentMethod: 'UPI', createdAt: now, updatedAt: now },
  { id: 'sample-7', amount: 3499, category: 'Shopping', description: 'Everyday essentials', date: daysAgo(12), paymentMethod: 'Credit Card', createdAt: now, updatedAt: now },
  { id: 'sample-8', amount: 1200, category: 'Health', description: 'Pharmacy', date: daysAgo(17), paymentMethod: 'Cash', createdAt: now, updatedAt: now },
  { id: 'sample-9', amount: 5400, category: 'Travel', description: 'Weekend getaway', date: daysAgo(39), paymentMethod: 'Credit Card', createdAt: now, updatedAt: now },
]
