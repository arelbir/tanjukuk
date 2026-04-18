export interface LookupValue {
  id: string
  group_key: string
  label: string
  sort_order: number
  is_active: boolean
}

export interface LookupGroup {
  key: string
  label: string
}

export const LOOKUP_GROUPS: LookupGroup[] = [
  { key: 'case_type', label: 'Dava Türleri' },
  { key: 'file_type', label: 'Dosya Türleri' },
  { key: 'case_status', label: 'Dosya Durumları' },
  { key: 'court_type', label: 'Mahkeme Türleri' },
  { key: 'income_category', label: 'Gelir Kategorileri' },
  { key: 'expense_category', label: 'Gider Kategorileri' },
  { key: 'client_type', label: 'Müvekkil Türleri' },
  { key: 'entity_type', label: 'Kişi Türleri' },
  { key: 'client_role', label: 'Müvekkil Sıfatları' },
  { key: 'payment_status', label: 'Ödeme Durumları' },
  { key: 'payment_method', label: 'Ödeme Yöntemleri' },
  { key: 'currency', label: 'Para Birimleri' },
  { key: 'court_instance', label: 'Mahkeme Instance' },
  { key: 'user_role', label: 'Kullanıcı Rolleri' },
  { key: 'city', label: 'İller' },
]

export const getLookupLabel = (groupKey: string): string => {
  const group = LOOKUP_GROUPS.find(g => g.key === groupKey)
  return group?.label || groupKey
}