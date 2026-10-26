import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDown, ArrowDownUp, ArrowUp, Banknote, CalendarDays, Check, ChevronDown, CircleHelp, CreditCard, Download, Ellipsis, FileText, Filter, LayoutDashboard, Pencil, Plus, Search, Settings, ShoppingBag, Sun, Moon, Trash2, TrendingDown, Wallet, X, type LucideIcon } from 'lucide-react'
import { categories, paymentMethods, type Expense, type ExpenseCategory, type PaymentMethod } from './types'
import { demoExpenses } from './data'
import { formatCurrency, formatDate, monthKey, monthLabel, todayKey, isExpense } from './utils'

type Page = 'Overview' | 'Transactions' | 'Settings'
type FormValue = { amount: string; category: ExpenseCategory; description: string; date: string; paymentMethod: PaymentMethod }
const storageKey = 'moneta-expenses-v1'
const themeKey = 'moneta-theme-v1'
const colors = ['#7865e8', '#54b8a5', '#f0aa62', '#e87c8a', '#72a6e8', '#bd83d8', '#9cbb67', '#e39771', '#6bb8ca', '#a1a4b5']
const categoryIcon: Record<ExpenseCategory, LucideIcon> = { Food: Banknote, Transport: TrendingDown, Shopping: ShoppingBag, Bills: FileText, Entertainment: Sun, Health: Check, Education: FileText, Travel: CalendarDays, Groceries: ShoppingBag, Other: Ellipsis }
const initialForm = (): FormValue => ({ amount: '', category: 'Food', description: '', date: todayKey(), paymentMethod: 'UPI' })

function loadExpenses(): Expense[] {
  try {
    const value = localStorage.getItem(storageKey)
    if (value === null) { localStorage.setItem(storageKey, JSON.stringify(demoExpenses)); return demoExpenses }
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(isExpense) : []
  } catch { return demoExpenses }
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem(themeKey) === 'dark' ? 'dark' : 'light')
  const [page, setPage] = useState<Page>('Overview')
  const [modal, setModal] = useState<'form' | 'delete' | null>(null)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [form, setForm] = useState<FormValue>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [paymentFilter, setPaymentFilter] = useState('All methods')
  const [monthFilter, setMonthFilter] = useState('All months')
  const [sort, setSort] = useState<{ key: 'date' | 'amount' | 'description'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' })

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem(themeKey, theme) }, [theme])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2600); return () => window.clearTimeout(timer) }, [toast])

  const currentMonth = monthKey(todayKey())
  const monthExpenses = expenses.filter(item => monthKey(item.date) === currentMonth)
  const todayExpenses = expenses.filter(item => item.date === todayKey())
  const total = expenses.reduce((sum, item) => sum + item.amount, 0)
  const thisMonth = monthExpenses.reduce((sum, item) => sum + item.amount, 0)
  const todayTotal = todayExpenses.reduce((sum, item) => sum + item.amount, 0)
  const months = [...new Set([...expenses.map(item => monthKey(item.date)), currentMonth])].sort().reverse()
  const filtered = useMemo(() => expenses.filter(item => {
    const matchesQuery = `${item.description} ${item.category} ${item.paymentMethod}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesQuery && (categoryFilter === 'All categories' || item.category === categoryFilter) && (paymentFilter === 'All methods' || item.paymentMethod === paymentFilter) && (monthFilter === 'All months' || monthKey(item.date) === monthFilter)
  }).sort((a, b) => {
    const comparison = sort.key === 'amount' ? a.amount - b.amount : sort.key === 'description' ? a.description.localeCompare(b.description) : a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
    return comparison * (sort.direction === 'asc' ? 1 : -1)
  }), [expenses, query, categoryFilter, paymentFilter, monthFilter, sort])
  const categoryData = categories.map(category => ({ name: category, value: expenses.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0) })).filter(item => item.value > 0)
  const chartMonths = [...new Set([...months, currentMonth])].sort().slice(-6)
  const monthlyData = chartMonths.map(month => ({ month: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1)), amount: expenses.filter(item => monthKey(item.date) === month).reduce((sum, item) => sum + item.amount, 0) }))

  const openForm = (expense?: Expense) => {
    setEditing(expense ?? null)
    setForm(expense ? { amount: String(expense.amount), category: expense.category, description: expense.description, date: expense.date, paymentMethod: expense.paymentMethod } : initialForm())
    setErrors({}); setModal('form')
  }
  const saveExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    const amount = Number(form.amount)
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) nextErrors.amount = 'Enter an amount greater than zero.'
    if (!form.description.trim()) nextErrors.description = 'Add a short description.'
    if (form.description.length > 80) nextErrors.description = 'Keep the description under 80 characters.'
    if (!form.date || Number.isNaN(new Date(`${form.date}T12:00:00`).getTime())) nextErrors.date = 'Choose a valid date.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const now = new Date().toISOString()
    if (editing) setExpenses(list => list.map(item => item.id === editing.id ? { ...item, ...form, amount, description: form.description.trim(), updatedAt: now } : item))
    else setExpenses(list => [{ id: crypto.randomUUID(), ...form, amount, description: form.description.trim(), createdAt: now, updatedAt: now }, ...list])
    setModal(null); setToast(editing ? 'Expense updated' : 'Expense added')
  }
  const confirmDelete = () => { if (!deleting) return; setExpenses(list => list.filter(item => item.id !== deleting.id)); setModal(null); setDeleting(null); setToast('Expense deleted') }
  const clearFilters = () => { setQuery(''); setCategoryFilter('All categories'); setPaymentFilter('All methods'); setMonthFilter('All months') }
  const activeFilters = query || categoryFilter !== 'All categories' || paymentFilter !== 'All methods' || monthFilter !== 'All months'
  const exportCsv = () => {
    const rows = [['Date', 'Description', 'Category', 'Payment method', 'Amount'], ...filtered.map(item => [item.date, item.description, item.category, item.paymentMethod, String(item.amount)])]
    const csv = rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'moneta-expenses.csv'; link.click(); URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={() => setPage('Overview')}><span className="brand-mark"><Wallet size={20} strokeWidth={2.4} /></span><span>moneta<span className="brand-period">.</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        <button className={page === 'Overview' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('Overview')}><LayoutDashboard size={18} /> Overview</button>
        <button className={page === 'Transactions' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('Transactions')}><ArrowDownUp size={18} /> Transactions <span className="nav-count">{expenses.length}</span></button>
        <button className={page === 'Settings' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('Settings')}><Settings size={18} /> Settings</button>
      </nav>
      <div className="sidebar-bottom"><div className="tip-card"><span className="tip-icon"><CircleHelp size={17} /></span><strong>Good to know</strong><p>Your data stays private on this device.</p></div><button className="profile-row" onClick={() => setPage('Settings')}><span className="avatar">R</span><span className="profile-copy"><strong>Personal space</strong><small>Free plan</small></span><Ellipsis size={19} className="muted-icon" /></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div><div className="top-actions"><span className="local-badge"><span className="status-dot" /> All changes saved</span><button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><span className="avatar top-avatar">R</span></div></header>
      <div className="page-content">
        {page === 'Overview' && <>
          <div className="page-heading"><div><div className="eyebrow">YOUR MONEY, IN FOCUS</div><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, there <span className="wave">✳</span></h1><p className="page-subtitle">Here’s what’s happening with your spending.</p></div><button className="button primary" onClick={() => openForm()}><Plus size={17} /> Add expense</button></div>
          <section className="stats-grid" aria-label="Spending summary"><StatCard title="Total expenses" amount={formatCurrency(total)} icon={Wallet} note="Across all transactions" accent="lavender" /><StatCard title="This month" amount={formatCurrency(thisMonth)} icon={CalendarDays} note={monthLabel(currentMonth)} accent="mint" /><StatCard title="Today" amount={formatCurrency(todayTotal)} icon={CreditCard} note={`${todayExpenses.length} transaction${todayExpenses.length === 1 ? '' : 's'}`} accent="peach" /><StatCard title="Transactions" amount={String(expenses.length)} icon={ArrowDownUp} note="All time" accent="blue" /></section>
          <section className="charts-grid"><article className="panel spending-panel"><div className="panel-header"><div><h2>Spending overview</h2><p>Your monthly activity at a glance</p></div><button className="select-like" onClick={() => setPage('Transactions')}>Last 6 months <ChevronDown size={14} /></button></div><div className="chart-total"><strong>{formatCurrency(thisMonth)}</strong><span className="chart-period">This month</span></div><div className="area-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyData} margin={{ top: 14, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7865e8" stopOpacity={0.18} /><stop offset="95%" stopColor="#7865e8" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={11} /><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={value => value >= 1000 ? `₹${value / 1000}k` : `₹${value}`} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="amount" stroke="#7865e8" strokeWidth={2.5} fill="url(#spendingFill)" activeDot={{ r: 5, strokeWidth: 3, stroke: 'var(--surface)' }} /></AreaChart></ResponsiveContainer></div></article>
            <article className="panel category-panel"><div className="panel-header"><div><h2>By category</h2><p>Where your money goes</p></div><button className="more-button" aria-label="View transactions" onClick={() => setPage('Transactions')}><Ellipsis size={19} /></button></div>{categoryData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="91%" paddingAngle={3} stroke="none">{categoryData.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer><div className="donut-center"><span>Total spent</span><strong>{formatCurrency(total)}</strong></div></div><div className="legend-list">{categoryData.slice(0, 4).map((item, index) => <div className="legend-row" key={item.name}><span className="legend-name"><i style={{ background: colors[index % colors.length] }} />{item.name}</span><strong>{formatCurrency(item.value)}</strong></div>)}{categoryData.length > 4 && <button className="see-all" onClick={() => setPage('Transactions')}>See all {categoryData.length} categories <ArrowDown size={14} /></button>}</div></> : <EmptyChart label="Your category breakdown will appear here." />}</article></section>
          <section className="panel recent-panel"><div className="panel-header recent-heading"><div><h2>Recent transactions</h2><p>A little snapshot of your latest spending</p></div><button className="text-button" onClick={() => setPage('Transactions')}>View all <ArrowUp size={14} className="rotate-arrow" /></button></div><ExpenseTable expenses={[...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5)} onEdit={openForm} onDelete={item => { setDeleting(item); setModal('delete') }} /></section>
          <footer className="page-footer"><span>Made for a clearer view of your money.</span><span><span className="footer-dot" /> Private by design</span></footer>
        </>}
        {page === 'Transactions' && <>
          <div className="page-heading"><div><div className="eyebrow">YOUR ACTIVITY</div><h1>Transactions</h1><p className="page-subtitle">Every little thing, all in one place.</p></div><button className="button primary" onClick={() => openForm()}><Plus size={17} /> Add expense</button></div>
          <div className="panel transactions-panel"><div className="transaction-toolbar"><div className="searchbox"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search transactions..." aria-label="Search transactions" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}</div><div className="toolbar-filters"><label className="filter-select"><Filter size={15} /><select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} aria-label="Filter by category"><option>All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label className="filter-select"><CreditCard size={15} /><select value={paymentFilter} onChange={event => setPaymentFilter(event.target.value)} aria-label="Filter by payment method"><option>All methods</option>{paymentMethods.map(value => <option key={value}>{value}</option>)}</select></label><label className="filter-select"><CalendarDays size={15} /><select value={monthFilter} onChange={event => setMonthFilter(event.target.value)} aria-label="Filter by month"><option value="All months">All months</option>{months.map(value => <option key={value} value={value}>{monthLabel(value)}</option>)}</select></label><button className="icon-button export-button" aria-label="Export CSV" title="Export CSV" onClick={exportCsv}><Download size={16} /></button></div></div>
            {activeFilters && <div className="filter-summary"><span>{filtered.length} result{filtered.length === 1 ? '' : 's'} found</span><button onClick={clearFilters}>Clear filters <X size={13} /></button></div>}
            <ExpenseTable expenses={filtered} onEdit={openForm} onDelete={item => { setDeleting(item); setModal('delete') }} sorting={sort} onSort={key => setSort(current => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }))} emptyMessage={activeFilters ? 'No expenses found' : 'No expenses yet'} emptyDescription={activeFilters ? 'Try changing your search or filters.' : 'Start tracking your spending by adding your first expense.'} emptyAction={!activeFilters ? () => openForm() : undefined} />
            <div className="table-bottom"><span>Showing <strong>{filtered.length}</strong> of <strong>{expenses.length}</strong> transactions</span><span>Amounts in INR <i className="currency-dot" /></span></div></div>
        </>}
        {page === 'Settings' && <>
          <div className="page-heading"><div><div className="eyebrow">MAKE IT YOURS</div><h1>Settings</h1><p className="page-subtitle">A few things to make Moneta feel like yours.</p></div></div>
          <div className="settings-layout"><section className="panel settings-panel"><div className="setting-section"><div><h2>Appearance</h2><p>Choose a look that feels right for you.</p></div><div className="theme-options"><button className={theme === 'light' ? 'theme-option chosen' : 'theme-option'} onClick={() => setTheme('light')}><Sun size={18} /> Light {theme === 'light' && <Check size={15} />}</button><button className={theme === 'dark' ? 'theme-option chosen' : 'theme-option'} onClick={() => setTheme('dark')}><Moon size={18} /> Dark {theme === 'dark' && <Check size={15} />}</button></div></div><div className="setting-section"><div><h2>Your data</h2><p>All your expense data is saved privately in this browser.</p></div><div className="data-actions"><button className="button secondary" onClick={exportCsv}><Download size={16} /> Export transactions</button><button className="button secondary danger-button" onClick={() => { setDeleting(null); setModal('delete') }}><Trash2 size={16} /> Reset all data</button></div></div><div className="setting-section about-section"><div><h2>About Moneta</h2><p>A calm, simple way to understand your spending.</p></div><span className="version-pill">VERSION 1.0</span></div></section><aside className="privacy-card"><span className="privacy-icon"><Wallet size={21} /></span><h2>Your money is your business.</h2><p>Moneta stores everything on this device. Your transactions are never sent to a server or shared with anyone.</p><span className="privacy-status"><i /> Local storage is on</span></aside></div>
        </>}
      </div>
    </main>
    {modal === 'form' && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null) }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title"><div className="modal-heading"><div><span className="modal-kicker">{editing ? 'MAKE AN UPDATE' : 'NEW TRANSACTION'}</span><h2 id="expense-modal-title">{editing ? 'Edit expense' : 'Add an expense'}</h2><p>Keep the details handy. You can always change them later.</p></div><button className="icon-button close-button" onClick={() => setModal(null)} aria-label="Close"><X size={18} /></button></div><form onSubmit={saveExpense} noValidate><label className="form-label">Amount <span className="required">*</span><div className={`amount-field ${errors.amount ? 'invalid' : ''}`}><span>₹</span><input autoFocus type="number" min="0.01" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} placeholder="0.00" aria-label="Amount" /></div>{errors.amount && <small className="error-text">{errors.amount}</small>}</label><div className="form-grid"><label className="form-label">Category <span className="required">*</span><select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as ExpenseCategory })}>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label className="form-label">Payment method <span className="required">*</span><select value={form.paymentMethod} onChange={event => setForm({ ...form, paymentMethod: event.target.value as PaymentMethod })}>{paymentMethods.map(value => <option key={value}>{value}</option>)}</select></label></div><label className="form-label">Description <span className="required">*</span><input maxLength={80} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="What was it for?" />{errors.description && <small className="error-text">{errors.description}</small>}</label><label className="form-label">Date <span className="required">*</span><input type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} />{errors.date && <small className="error-text">{errors.date}</small>}</label><div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="button primary"><Check size={16} /> {editing ? 'Save changes' : 'Add expense'}</button></div></form></section></div>}
    {modal === 'delete' && <div className="modal-backdrop" role="presentation"><section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><span className="confirm-icon"><Trash2 size={20} /></span><h2 id="delete-title">{deleting ? 'Delete this expense?' : 'Reset all your data?'}</h2><p>{deleting ? <>Are you sure you want to delete <strong>{deleting.description}</strong>? This action can’t be undone.</> : 'This will permanently remove all saved transactions from this device.'}</p><div className="modal-actions"><button className="button secondary" onClick={() => { setModal(null); setDeleting(null) }}>Cancel</button><button className="button delete-button" onClick={() => deleting ? confirmDelete() : (setExpenses([]), setModal(null), setToast('All transactions removed'))}><Trash2 size={16} /> {deleting ? 'Delete expense' : 'Reset data'}</button></div></section></div>}
    {toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
  </div>
}

function StatCard({ title, amount, icon: Icon, note, accent }: { title: string; amount: string; icon: LucideIcon; note: string; accent: string }) {
  return <article className="stat-card"><div className="stat-top"><span className={`stat-icon ${accent}`}><Icon size={18} strokeWidth={2} /></span><span className="stat-period">{title === 'This month' ? 'MONTHLY' : title === 'Today' ? 'DAILY' : 'ALL TIME'}</span></div><div className="stat-title">{title}</div><strong className="stat-value">{amount}</strong><span className="stat-note">{note}</span></article>
}

function ExpenseTable({ expenses, onEdit, onDelete, sorting, onSort, emptyMessage = 'No expenses yet', emptyDescription = 'Start tracking your spending by adding your first expense.', emptyAction }: { expenses: Expense[]; onEdit: (item: Expense) => void; onDelete: (item: Expense) => void; sorting?: { key: 'date' | 'amount' | 'description'; direction: 'asc' | 'desc' }; onSort?: (key: 'date' | 'amount' | 'description') => void; emptyMessage?: string; emptyDescription?: string; emptyAction?: () => void }) {
  const sortButton = (label: string, key: 'date' | 'amount' | 'description') => <button className="sort-button" onClick={() => onSort?.(key)}>{label}{sorting?.key === key ? sorting.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} /> : <ArrowDownUp size={12} />}</button>
  return <div className="table-wrap">{expenses.length ? <table><thead><tr><th>{sortButton('Date', 'date')}</th><th>{sortButton('Description', 'description')}</th><th>Category</th><th>Payment method</th><th className="amount-col">{sortButton('Amount', 'amount')}</th><th className="actions-col">Actions</th></tr></thead><tbody>{expenses.map(item => { const Icon = categoryIcon[item.category]; return <tr key={item.id}><td className="date-cell">{formatDate(item.date)}</td><td><div className="description-cell"><span className="category-icon"><Icon size={16} /></span><strong>{item.description}</strong></div></td><td><span className={`category-pill category-${item.category.toLowerCase()}`}>{item.category}</span></td><td><span className="payment-cell"><span className="payment-mark"><CreditCard size={13} /></span>{item.paymentMethod}</span></td><td className="amount-col amount-cell">{formatCurrency(item.amount)}</td><td className="actions-col"><div className="row-actions"><button aria-label={`Edit ${item.description}`} title="Edit" onClick={() => onEdit(item)}><Pencil size={15} /></button><button aria-label={`Delete ${item.description}`} title="Delete" onClick={() => onDelete(item)}><Trash2 size={15} /></button></div></td></tr> })}</tbody></table> : <div className="empty-state"><span className="empty-icon"><Search size={20} /></span><h3>{emptyMessage}</h3><p>{emptyDescription}</p>{emptyAction && <button className="button primary" onClick={emptyAction}><Plus size={16} /> Add expense</button>}</div>}</div>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value: number; payload?: { name?: string } }>; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><span>{payload[0].payload?.name ?? label}</span><strong>{formatCurrency(payload[0].value)}</strong></div>
}

function EmptyChart({ label }: { label: string }) { return <div className="empty-chart"><span className="empty-chart-mark"><Wallet size={20} /></span><p>{label}</p></div> }

export default App
