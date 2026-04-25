import { ImportDefinition } from './types'

export interface ClientImportRow {
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_no: string | null
  address: string | null
}

function normalizeString(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

export const clientImportDefinition: ImportDefinition<ClientImportRow> = {
  fileName: 'muvvekkil-sablon.xlsx',
  sheetName: 'Müvekkiller',
  headers: ['name', 'type', 'phone', 'email', 'tax_no', 'address'],
  toRow: (item) => ({
    name: item.name,
    type: item.type,
    phone: item.phone || '',
    email: item.email || '',
    tax_no: item.tax_no || '',
    address: item.address || '',
  }),
  fromRow: (row) => {
    const name = String(row.name || '').trim()
    const rawType = String(row.type || '').trim().toLowerCase()
    const errors: string[] = []

    if (!name) {
      errors.push('name zorunludur')
    }

    if (rawType !== 'company' && rawType !== 'şirket' && rawType !== 'individual' && rawType !== 'bireysel') {
      errors.push("type 'individual' veya 'company' olmalıdır")
    }

    if (errors.length > 0) {
      return { errors }
    }

    const type: 'individual' | 'company' = rawType === 'company' || rawType === 'şirket' ? 'company' : 'individual'

    return {
      value: {
        name,
        type,
        phone: normalizeString(row.phone),
        email: normalizeString(row.email),
        tax_no: normalizeString(row.tax_no),
        address: normalizeString(row.address),
      },
    }
  },
}

export function mapClientForExport(client: {
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_no: string | null
  address?: string | null
}): ClientImportRow {
  return {
    name: client.name,
    type: client.type,
    phone: client.phone,
    email: client.email,
    tax_no: client.tax_no,
    address: client.address || null,
  }
}
