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
  headers: ['Gider Türü', 'Kategori', 'Alt Kategori', 'Tarih', 'Tutar', 'Ödeme Yöntemi', 'Açıklama'],
  instructions: [
    "Gider Türü: Kurum veya Kişisel",
    'Kategori gider kategorisi lookup label değeridir.',
    'Alt Kategori varsa alt kategori label değeri olmalıdır.',
  ],
  toRow: (item) => ({
    'Gider Türü': item.expense_type === 'kurum' ? 'Kurum' : 'Kişisel',
    'Kategori': item.category_label,
    'Alt Kategori': item.sub_category_label,
    'Tarih': item.record_date,
    'Tutar': item.amount,
    'Ödeme Yöntemi': item.payment_method,
    'Açıklama': item.description,
  }),
  fromRow: (row) => {
    const expense_type = String(row['Gider Türü'] || '').trim().toLowerCase()
    const category_label = String(row['Kategori'] || '').trim()
    const record_date = String(row['Tarih'] || '').trim()
    const amount = normalizeNumber(row['Tutar'])
    const payment_method = String(row['Ödeme Yöntemi'] || '').trim()
    const errors: string[] = []

    if (expense_type !== 'kurum' && expense_type !== 'kisisel' && expense_type !== 'kişisel') errors.push('Gider Türü Kurum veya Kişisel olmalıdır')
    if (!category_label) errors.push('Kategori zorunludur')
    if (!record_date) errors.push('Tarih zorunludur')
    if (amount === null) errors.push('Tutar sayısal olmalıdır')
    if (!payment_method) errors.push('Ödeme Yöntemi zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        expense_type: (expense_type === 'kurum' || expense_type === 'kişisel') ? (expense_type === 'kurum' ? 'kurum' : 'kisisel') : 'kurum',
        category_label,
        sub_category_label: normalizeString(row['Alt Kategori']),
        record_date,
        amount: amount || 0,
        payment_method,
        description: normalizeString(row['Açıklama']),
      },
    }
  },
}
