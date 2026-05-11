export interface Client {
  id: string
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
  tax_number: string | null
  address: string | null
  created_at: string
  updated_at: string | null
}

export interface ClientFormData {
  name: string
  type: 'individual' | 'company'
  phone: string
  email: string
  tax_number: string
  address: string
}

export const CLIENT_TYPE_LABELS: Record<Client['type'], string> = {
  individual: 'Bireysel',
  company: 'Şirket',
}