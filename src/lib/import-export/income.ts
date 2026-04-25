import { ImportDefinition } from './types'

export interface IncomeImportRow {
  client_name: string | null
  category_label: string
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
  headers: ['Müvekkil Adı', 'Kategori', 'Tarih', 'Tutar', 'Ödeme Durumu', 'Açıklama'],
  instructions: [
    'Müvekkil Adı opsiyoneldir ancak varsa sistemdeki müvekkil adıyla eşleşmelidir.',
    'Kategori gelir kategorisi lookup label değeridir.',
    "Ödeme Durumu örnekleri: Ödendi, Beklemede, Kısmi",
  ],
  toRow: (item) => ({
    'Müvekkil Adı': item.client_name,
    'Kategori': item.category_label,
    'Tarih': item.record_date,
    'Tutar': item.amount,
    'Ödeme Durumu': item.payment_status,
    'Açıklama': item.description,
  }),
  fromRow: (row) => {
    const category_label = String(row['Kategori'] || '').trim()
    const record_date = String(row['Tarih'] || '').trim()
    const amount = normalizeNumber(row['Tutar'])
    const payment_status = String(row['Ödeme Durumu'] || '').trim()
    const errors: string[] = []

    if (!category_label) errors.push('Kategori zorunludur')
    if (!record_date) errors.push('Tarih zorunludur')
    if (amount === null) errors.push('Tutar sayısal olmalıdır')
    if (!payment_status) errors.push('Ödeme Durumu zorunludur')

    if (errors.length > 0) return { errors }

    return {
      value: {
        client_name: normalizeString(row['Müvekkil Adı']),
        category_label,
        record_date,
        amount: amount || 0,
        payment_status,
        description: normalizeString(row['Açıklama']),
      },
    }
  },
}
