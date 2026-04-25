import { ImportDefinition } from './types'

export interface ExpenseImportRow {
  expense_type: 'kurum' | 'kisisel'
  category_label: string
  sub_category_label: string | null
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
  headers: ['expense_type', 'category_label', 'sub_category_label', 'record_date', 'amount', 'payment_method', 'description'],
  instructions: [
    "expense_type: kurum veya kisisel",
    'category_label gider kategorisi lookup label değeridir.',
    'sub_category_label varsa alt kategori label değeri olmalıdır.',
  ],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const expense_type = String(row.expense_type || '').trim().toLowerCase()
    const category_label = String(row.category_label || '').trim()
    const record_date = String(row.record_date || '').trim()
    const amount = normalizeNumber(row.amount)
    const payment_method = String(row.payment_method || '').trim()
    const errors: string[] = []

    if (expense_type !== 'kurum' && expense_type !== 'kisisel') errors.push('expense_type kurum veya kisisel olmalıdır')
    if (!category_label) errors.push('category_label zorunludur')
    if (!record_date) errors.push('record_date zorunludur')
    if (amount === null) errors.push('amount sayısal olmalıdır')
    if (!payment_method) errors.push('payment_method zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        expense_type: expense_type as 'kurum' | 'kisisel',
        category_label,
        sub_category_label: normalizeString(row.sub_category_label),
        record_date,
        amount: amount || 0,
        payment_method,
        description: normalizeString(row.description),
      },
    }
  },
}
