import { ImportDefinition } from './types'

export interface CaseImportRow {
  lawyer_email: string
  client_name: string
  opposing_party: string
  client_role_label: string | null
  entity_type: string
  court_city: string | null
  court_district: string | null
  court_type_label: string | null
  court_no: number | null
  file_year: number | null
  file_no: string | null
  file_type_label: string | null
  case_type_label: string | null
  status_label: string | null
  opened_at: string
  case_value: number
  currency: string
  description: string | null
  notes: string | null
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

export const caseImportDefinition: ImportDefinition<CaseImportRow> = {
  fileName: 'dosya-sablon.xlsx',
  sheetName: 'Dosyalar',
  headers: [
    'Avukat E-posta',
    'Müvekkil Adı',
    'Karşı Taraf',
    'Müvekkil Rolü',
    'Varlık Türü',
    'Mahkeme Şehri',
    'Mahkeme İlçesi',
    'Mahkeme Türü',
    'Mahkeme No',
    'Dosya Yılı',
    'Dosya No',
    'Dosya Türü',
    'Dava Türü',
    'Durum',
    'Açılış Tarihi',
    'Dava Değeri',
    'Para Birimi',
    'Açıklama',
    'Notlar',
  ],
  columns: [
    {
      key: 'lawyer_email',
      header: 'Avukat E-posta',
      required: true,
      description: 'Sistemde kayıtlı aktif avukat e-posta adresi ile eşleşmelidir.',
      example: 'avukat@firma.com',
    },
    {
      key: 'client_name',
      header: 'Müvekkil Adı',
      required: true,
      description: 'Sistemde kayıtlı müvekkil adı ile birebir eşleşmelidir.',
      example: 'Acme Ltd.',
    },
    {
      key: 'opposing_party',
      header: 'Karşı Taraf',
      required: true,
      description: 'Davanın karşı taraf bilgisi girilmelidir.',
      example: 'XYZ Sigorta A.Ş.',
    },
    {
      key: 'client_role_label',
      header: 'Müvekkil Rolü',
      description: 'Varsa sistemde tanımlı rol etiketi ile eşleşmelidir.',
      example: 'Davacı',
    },
    {
      key: 'entity_type',
      header: 'Varlık Türü',
      description: 'Opsiyoneldir. individual veya company değeri kullanılabilir.',
      example: 'individual',
      options: ['individual', 'company'],
    },
    {
      key: 'court_city',
      header: 'Mahkeme Şehri',
      description: 'Varsa mahkemenin bulunduğu şehir bilgisini girin.',
      example: 'İstanbul',
    },
    {
      key: 'court_district',
      header: 'Mahkeme İlçesi',
      description: 'Varsa mahkemenin bulunduğu ilçe bilgisini girin.',
      example: 'Kadıköy',
    },
    {
      key: 'court_type_label',
      header: 'Mahkeme Türü',
      description: 'Sistemde tanımlı mahkeme türü etiketi kullanılmalıdır.',
      example: 'Asliye Hukuk Mahkemesi',
    },
    {
      key: 'court_no',
      header: 'Mahkeme No',
      description: 'Varsa yalnızca sayısal değer girin.',
      example: 12,
    },
    {
      key: 'file_year',
      header: 'Dosya Yılı',
      description: 'Varsa dosya yılını sayısal olarak girin.',
      example: 2026,
    },
    {
      key: 'file_no',
      header: 'Dosya No',
      description: 'Varsa dosya numarasını girin.',
      example: '125',
    },
    {
      key: 'file_type_label',
      header: 'Dosya Türü',
      description: 'Sistemde tanımlı dosya türü etiketi kullanılmalıdır.',
      example: 'Esas',
    },
    {
      key: 'case_type_label',
      header: 'Dava Türü',
      description: 'Sistemde tanımlı dava türü etiketi kullanılmalıdır.',
      example: 'İş Davası',
    },
    {
      key: 'status_label',
      header: 'Durum',
      description: 'Sistemde tanımlı durum etiketi kullanılmalıdır.',
      example: 'Açık',
    },
    {
      key: 'opened_at',
      header: 'Açılış Tarihi',
      required: true,
      description: 'YYYY-MM-DD formatında girilmelidir.',
      example: '2026-04-26',
    },
    {
      key: 'case_value',
      header: 'Dava Değeri',
      description: 'Varsa sayısal değer girin.',
      example: 50000,
    },
    {
      key: 'currency',
      header: 'Para Birimi',
      description: 'Boş bırakılırsa TRY kabul edilir.',
      example: 'TRY',
      options: ['TRY', 'USD', 'EUR'],
    },
    {
      key: 'description',
      header: 'Açıklama',
      description: 'Dosya açıklaması ekleyebilirsiniz.',
      example: 'İşe iade davası',
    },
    {
      key: 'notes',
      header: 'Notlar',
      description: 'Opsiyonel not alanıdır.',
      example: 'İlk duruşma bekleniyor',
    },
  ],
  instructions: [
    'Avukat E-posta ve Müvekkil Adı alanları sistemde mevcut kayıtlarla eşleşmelidir.',
    'Dava Türü, Durum, Mahkeme Türü, Dosya Türü ve Müvekkil Rolü alanlarında sistemdeki etiket değerleri kullanılmalıdır.',
    'Açılış Tarihi zorunludur ve YYYY-MM-DD formatında olmalıdır.',
  ],
  toRow: (item) => ({
    'Avukat E-posta': item.lawyer_email,
    'Müvekkil Adı': item.client_name,
    'Karşı Taraf': item.opposing_party,
    'Müvekkil Rolü': item.client_role_label,
    'Varlık Türü': item.entity_type,
    'Mahkeme Şehri': item.court_city,
    'Mahkeme İlçesi': item.court_district,
    'Mahkeme Türü': item.court_type_label,
    'Mahkeme No': item.court_no,
    'Dosya Yılı': item.file_year,
    'Dosya No': item.file_no,
    'Dosya Türü': item.file_type_label,
    'Dava Türü': item.case_type_label,
    'Durum': item.status_label,
    'Açılış Tarihi': item.opened_at,
    'Dava Değeri': item.case_value,
    'Para Birimi': item.currency,
    'Açıklama': item.description,
    'Notlar': item.notes,
  }),
  fromRow: (row) => {
    const lawyer_email = String(row['Avukat E-posta'] || '').trim()
    const client_name = String(row['Müvekkil Adı'] || '').trim()
    const opposing_party = String(row['Karşı Taraf'] || '').trim()
    const opened_at = String(row['Açılış Tarihi'] || '').trim()
    const currency = String(row['Para Birimi'] || 'TRY').trim() || 'TRY'
    const entity_type = String(row['Varlık Türü'] || 'individual').trim() || 'individual'
    const errors: string[] = []

    if (!lawyer_email) errors.push('Avukat E-posta alanı zorunludur. Lütfen sistemde kayıtlı avukat e-posta adresini girin.')
    if (!client_name) errors.push('Müvekkil Adı alanı zorunludur. Lütfen sistemde kayıtlı müvekkil adını girin.')
    if (!opposing_party) errors.push('Karşı Taraf alanı zorunludur. Lütfen karşı taraf bilgisini girin.')
    if (!opened_at) errors.push('Açılış Tarihi alanı zorunludur. Lütfen tarihi YYYY-MM-DD formatında girin.')

    if (errors.length > 0) {
      return { errors }
    }

    return {
      value: {
        lawyer_email,
        client_name,
        opposing_party,
        client_role_label: normalizeString(row['Müvekkil Rolü']),
        entity_type,
        court_city: normalizeString(row['Mahkeme Şehri']),
        court_district: normalizeString(row['Mahkeme İlçesi']),
        court_type_label: normalizeString(row['Mahkeme Türü']),
        court_no: normalizeNumber(row['Mahkeme No']),
        file_year: normalizeNumber(row['Dosya Yılı']),
        file_no: normalizeString(row['Dosya No']),
        file_type_label: normalizeString(row['Dosya Türü']),
        case_type_label: normalizeString(row['Dava Türü']),
        status_label: normalizeString(row['Durum']),
        opened_at,
        case_value: normalizeNumber(row['Dava Değeri']) || 0,
        currency,
        description: normalizeString(row['Açıklama']),
        notes: normalizeString(row['Notlar']),
      },
    }
  },
}
