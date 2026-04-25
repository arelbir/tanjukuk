import { ImportDefinition } from './types'

export interface ExpenseImportRow {
  expense_type: 'kurum' | 'kisisel'
  category_id: string
  sub_category_id: string | null
  record_date: string
  amount: number
  payment_method: string
  description: string | null
}

function normalizeString(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const expenseImportDefinition: ImportDefinition<ExpenseImportRow> = {
  fileName: 'gider-sablon.xlsx',
  sheetName: 'Giderler',
  headers: ['expense_type', 'category_id', 'sub_category_id', 'record_date', 'amount', 'payment_method', 'description'],
  instructions: [
    "expense_type: kurum veya kisisel",
    'category_id, record_date, amount ve payment_method zorunludur.',
  ],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const expense_type = String(row.expense_type || '').trim().toLowerCase()
    const category_id = String(row.category_id || '').trim()
    const record_date = String(row.record_date || '').trim()
    const amount = normalizeNumber(row.amount)
    const payment_method = String(row.payment_method || '').trim()
    const errors: string[] = []

    if (expense_type !== 'kurum' && expense_type !== 'kisisel') errors.push('expense_type kurum veya kisisel olmalıdır')
    if (!category_id) errors.push('category_id zorunludur')
    if (!record_date) errors.push('record_date zorunludur')
    if (amount === null) errors.push('amount sayısal olmalıdır')
    if (!payment_method) errors.push('payment_method zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        expense_type: expense_type as 'kurum' | 'kisisel',
        category_id,
        sub_category_id: normalizeString(row.sub_category_id),
        record_date,
        amount: amount || 0,
        payment_method,
        description: normalizeString(row.description),
      },
    }
  },
}
