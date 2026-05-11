import { ImportDefinition } from './types'

export interface ClientImportRow {
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_number: string | null
  address: string | null
}

function normalizeString(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

export const clientImportDefinition: ImportDefinition<ClientImportRow> = {
  fileName: 'muvvekkil-sablon.xlsx',
  sheetName: 'Müvekkiller',
  headers: ['Ad', 'Tür', 'Telefon', 'E-posta', 'Vergi No', 'Adres'],
  columns: [
    {
      key: 'name',
      header: 'Ad',
      required: true,
      description: 'Müvekkilin adı veya şirket unvanı girilmelidir.',
      example: 'Acme Hukuk Danışmanlık Ltd. Şti.',
    },
    {
      key: 'type',
      header: 'Tür',
      required: true,
      description: 'Yalnızca Bireysel veya Şirket değeri kullanılmalıdır.',
      example: 'Şirket',
      options: ['Bireysel', 'Şirket'],
    },
    {
      key: 'phone',
      header: 'Telefon',
      description: 'Telefon numarasını başında 0 olmadan girin.',
      example: '5321112233',
    },
    {
      key: 'email',
      header: 'E-posta',
      description: 'Geçerli bir e-posta adresi girin.',
      example: 'info@acme.com',
    },
    {
      key: 'tax_number',
      header: 'Vergi No',
      description: 'Varsa 10 haneli vergi numarası girin.',
      example: '1234567890',
    },
    {
      key: 'address',
      header: 'Adres',
      description: 'Müvekkilin açık adresini girebilirsiniz.',
      example: 'İstanbul / Kadıköy',
    },
  ],
  instructions: [
    'Ad ve Tür alanları zorunludur.',
    'Tür alanında yalnızca Bireysel veya Şirket değeri kullanılmalıdır.',
    'Telefon gibi sayısal görünen alanları metin olarak girmeniz önerilir.',
  ],
  toRow: (item) => ({
    'Ad': item.name,
    'Tür': item.type === 'company' ? 'Şirket' : 'Bireysel',
    'Telefon': item.phone || '',
    'E-posta': item.email || '',
    'Vergi No': item.tax_number || '',
    'Adres': item.address || '',
  }),
  fromRow: (row) => {
    const name = String(row['Ad'] || '').trim()
    const rawType = String(row['Tür'] || '').trim().toLocaleLowerCase('tr-TR')
    const errors: string[] = []

    if (!name) {
      errors.push('Ad alanı zorunludur. Lütfen müvekkil adını veya şirket unvanını girin.')
    }

    if (rawType !== 'company' && rawType !== 'şirket' && rawType !== 'individual' && rawType !== 'bireysel') {
      errors.push("Tür alanı hatalı. Lütfen 'Bireysel' veya 'Şirket' değerlerinden birini kullanın.")
    }

    if (errors.length > 0) {
      return { errors }
    }

    const type: 'individual' | 'company' = rawType === 'company' || rawType === 'şirket' ? 'company' : 'individual'

    return {
      value: {
        name,
        type,
        phone: normalizeString(row['Telefon']),
        email: normalizeString(row['E-posta']),
        tax_number: normalizeString(row['Vergi No']),
        address: normalizeString(row['Adres']),
      },
    }
  },
}

export function mapClientForExport(client: {
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_number: string | null
  address?: string | null
}): ClientImportRow {
  return {
    name: client.name,
    type: client.type,
    phone: client.phone,
    email: client.email,
    tax_number: client.tax_number,
    address: client.address || null,
  }
}
