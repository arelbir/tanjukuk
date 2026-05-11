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
  columns: [
    {
      key: 'expense_type',
      header: 'Gider Türü',
      required: true,
      description: 'Yalnızca Kurum veya Kişisel değeri kullanılmalıdır.',
      example: 'Kurum',
      options: ['Kurum', 'Kişisel'],
    },
    {
      key: 'category_label',
      header: 'Kategori',
      required: true,
      description: 'Sistemde tanımlı gider kategorilerinden biri girilmelidir.',
      example: 'Ofis Gideri',
    },
    {
      key: 'sub_category_label',
      header: 'Alt Kategori',
      description: 'Varsa ilgili kategoriye bağlı alt kategori girilmelidir.',
      example: 'Kırtasiye',
    },
    {
      key: 'record_date',
      header: 'Tarih',
      required: true,
      description: 'YYYY-MM-DD formatında tarih girin.',
      example: '2026-04-26',
    },
    {
      key: 'amount',
      header: 'Tutar',
      required: true,
      description: 'Yalnızca sayısal değer girin.',
      example: 2750,
    },
    {
      key: 'payment_method',
      header: 'Ödeme Yöntemi',
      required: true,
      description: 'Nakit, Havale veya Kart değerlerinden biri kullanılmalıdır.',
      example: 'Kart',
      options: ['Nakit', 'Havale', 'Kart'],
    },
    {
      key: 'description',
      header: 'Açıklama',
      description: 'Gider açıklamasını opsiyonel olarak girebilirsiniz.',
      example: 'Kırtasiye siparişi',
    },
  ],
  instructions: [
    'Gider Türü alanında yalnızca Kurum veya Kişisel kullanın.',
    'Kategori ve Alt Kategori alanları sistemdeki tanımlı değerlerle eşleşmelidir.',
    'Tarih alanını YYYY-MM-DD formatında girin.',
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
    const expense_type = String(row['Gider Türü'] || '').trim().toLocaleLowerCase('tr-TR')
    const category_label = String(row['Kategori'] || '').trim()
    const record_date = String(row['Tarih'] || '').trim()
    const amount = normalizeNumber(row['Tutar'])
    const payment_method = String(row['Ödeme Yöntemi'] || '').trim()
    const errors: string[] = []

    if (expense_type !== 'kurum' && expense_type !== 'kisisel' && expense_type !== 'kişisel') {
      errors.push('Gider Türü alanı hatalı. Lütfen Kurum veya Kişisel değerlerinden birini kullanın.')
    }
    if (!category_label) errors.push('Kategori alanı zorunludur. Lütfen kategori bilgisi girin.')
    if (!record_date) errors.push('Tarih alanı zorunludur. Lütfen tarihi YYYY-MM-DD formatında girin.')
    if (amount === null) errors.push('Tutar alanı hatalı. Lütfen yalnızca sayısal bir değer girin.')
    if (!payment_method) errors.push('Ödeme Yöntemi alanı zorunludur. Lütfen geçerli bir yöntem seçin.')

    if (errors.length > 0) return { errors }

    return {
      value: {
        expense_type: expense_type === 'kurum' ? 'kurum' : 'kisisel',
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
