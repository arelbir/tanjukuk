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
  columns: [
    {
      key: 'client_name',
      header: 'Müvekkil Adı',
      description: 'Opsiyoneldir. Girilirse sistemdeki müvekkil adıyla birebir eşleşmelidir.',
      example: 'Ahmet Yılmaz',
    },
    {
      key: 'category_label',
      header: 'Kategori',
      required: true,
      description: 'Gelir kategorisi adı girilmelidir.',
      example: 'Dava Ücreti',
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
      example: 15000,
    },
    {
      key: 'payment_status',
      header: 'Ödeme Durumu',
      required: true,
      description: 'Ödendi, Bekliyor veya Kısmi değerlerinden biri olmalıdır.',
      example: 'Ödendi',
      options: ['Ödendi', 'Bekliyor', 'Kısmi'],
    },
    {
      key: 'description',
      header: 'Açıklama',
      description: 'Gelir kaydına ait kısa açıklama girebilirsiniz.',
      example: 'Nisan ayı danışmanlık tahsilatı',
    },
  ],
  instructions: [
    'Kategori alanı sistemde tanımlı gelir kategorilerinden biri olmalıdır.',
    'Müvekkil Adı alanı opsiyoneldir ancak doldurulursa sistemde kayıtlı isimle eşleşmelidir.',
    'Tarih alanını YYYY-MM-DD formatında girin.',
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

    if (!category_label) errors.push('Kategori alanı zorunludur. Lütfen kategori bilgisini girin.')
    if (!record_date) errors.push('Tarih alanı zorunludur. Lütfen tarihi YYYY-MM-DD formatında girin.')
    if (amount === null) errors.push('Tutar alanı hatalı. Lütfen yalnızca sayısal bir değer girin.')
    if (!payment_status) errors.push('Ödeme Durumu alanı zorunludur. Lütfen geçerli bir durum seçin.')

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
