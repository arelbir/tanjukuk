import { ImportDefinition } from './types'

export interface IncomeImportRow {
  client_id: string | null
  category_id: string
  record_date: string
  amount: number
  payment_status: string
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

export const incomeImportDefinition: ImportDefinition<IncomeImportRow> = {
  fileName: 'gelir-sablon.xlsx',
  sheetName: 'Gelirler',
  headers: ['client_id', 'category_id', 'record_date', 'amount', 'payment_status', 'description'],
  instructions: [
    'client_id opsiyoneldir.',
    'category_id, record_date, amount ve payment_status zorunludur.',
    "payment_status örnekleri: paid, pending, partial",
  ],
  toRow: (item) => ({ ...item }),
  fromRow: (row) => {
    const category_id = String(row.category_id || '').trim()
    const record_date = String(row.record_date || '').trim()
    const amount = normalizeNumber(row.amount)
    const payment_status = String(row.payment_status || '').trim()
    const errors: string[] = []

    if (!category_id) errors.push('category_id zorunludur')
    if (!record_date) errors.push('record_date zorunludur')
    if (amount === null) errors.push('amount sayısal olmalıdır')
    if (!payment_status) errors.push('payment_status zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        client_id: normalizeString(row.client_id),
        category_id,
        record_date,
        amount: amount || 0,
        payment_status,
        description: normalizeString(row.description),
      },
    }
  },
}
