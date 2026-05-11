export type LookupGroupKey = 
  | 'case_type'
  | 'court_type'
  | 'client_role'
  | 'entity_type'
  | 'client_type'
  | 'expense_category'
  | 'income_category'
  | 'payment_status'
  | 'payment_method'
  | 'currency'
  | 'court_instance'
  | 'user_role'
  | 'city'
  | 'status'
  | 'court_city'
  | 'court_district'
  | `expense_sub_${string}`
  | `income_sub_${string}`

type LookupIconKey = 'Scale' | 'Building2' | 'User' | 'Wallet' | 'FileText' | 'Gavel' | 'MapPin' | 'Users'

export interface LookupGroupConfig {
  label: string
  icon: LookupIconKey
  hierarchical?: boolean
  subKeyPrefix?: string
  subKeyTransform?: (label: string) => string
  description?: string
  category?: string
}

export const LOOKUP_CONFIG: Record<string, LookupGroupConfig> = {
  case_type: {
    label: 'Dava Türleri',
    icon: 'Scale',
    description: 'Dava dosyalarının türlerini tanımlayın',
    category: 'Dava'
  },
  court_type: {
    label: 'Mahkeme Türleri',
    icon: 'Building2',
    description: 'Mahkeme ve tribunal türlerini tanımlayın',
    category: 'Mahkeme'
  },
  client_role: {
    label: 'Müvekkil Sıfatları',
    icon: 'User',
    description: 'Müvekkil sıfatlarını tanımlayın',
    category: 'Müvekkil'
  },
  entity_type: {
    label: 'Kişi Türleri',
    icon: 'Users',
    description: 'Gerçek ve tüzel kişi türlerini tanımlayın',
    category: 'Müvekkil'
  },
  client_type: {
    label: 'Müvekkil Türleri',
    icon: 'User',
    description: 'Bireysel ve şirket müvekkil türlerini tanımlayın',
    category: 'Müvekkil'
  },
  expense_category: {
    label: 'Gider Kategorileri',
    icon: 'Wallet',
    hierarchical: true,
    subKeyPrefix: 'expense_sub_',
    subKeyTransform: (label: string) => 
      `expense_sub_${label.toLowerCase().replace(/[^a-z]/g, '')}`,
    description: 'Gider kategorilerini ve alt kategorilerini yönetin',
    category: 'Mali'
  },
  income_category: {
    label: 'Gelir Kategorileri',
    icon: 'FileText',
    hierarchical: true,
    subKeyPrefix: 'income_sub_',
    subKeyTransform: (label: string) => 
      `income_sub_${label.toLowerCase().replace(/[^a-z]/g, '')}`,
    description: 'Gelir kategorilerini ve alt kategorilerini yönetin',
    category: 'Mali'
  },
  payment_status: {
    label: 'Ödeme Durumları',
    icon: 'FileText',
    description: 'Ödeme durumlarını tanımlayın',
    category: 'Mali'
  },
  payment_method: {
    label: 'Ödeme Yöntemleri',
    icon: 'Wallet',
    description: 'Ödeme yöntemlerini tanımlayın',
    category: 'Mali'
  },
  currency: {
    label: 'Para Birimleri',
    icon: 'Wallet',
    description: 'Para birimlerini tanımlayın',
    category: 'Mali'
  },
  court_instance: {
    label: 'Mahkeme Dereceleri',
    icon: 'Gavel',
    description: 'Mahkeme derecelerini tanımlayın',
    category: 'Mahkeme'
  },
  user_role: {
    label: 'Kullanıcı Rolleri',
    icon: 'Users',
    description: 'Kullanıcı rollerini tanımlayın',
    category: 'Sistem'
  },
  city: {
    label: 'Şehirler',
    icon: 'MapPin',
    description: 'Türkiye şehirlerini tanımlayın',
    category: 'Konum'
  },
  status: {
    label: 'Dosya Durumları',
    icon: 'Gavel',
    description: 'Dosya durumlarını tanımlayın',
    category: 'Dava'
  },
  court_city: {
    label: 'Mahkeme Şehirleri',
    icon: 'MapPin',
    description: 'Mahkeme şehirlerini tanımlayın',
    category: 'Mahkeme'
  },
  court_district: {
    label: 'Mahkeme İlçeleri',
    icon: 'MapPin',
    description: 'Mahkeme ilçelerini tanımlayın',
    category: 'Mahkeme'
  },
}

export function getLookupConfig(groupKey: string): LookupGroupConfig | undefined {
  return LOOKUP_CONFIG[groupKey]
}

export function getLookupLabel(groupKey: string): string {
  const config = getLookupConfig(groupKey)
  return config?.label || groupKey
}

export function getSubCategoryKey(categoryLabel: string, prefix: string): string {
  return `${prefix}${categoryLabel.toLowerCase().replace(/[^a-z]/g, '')}`
}

export function isHierarchicalGroup(groupKey: string): boolean {
  const config = getLookupConfig(groupKey)
  return config?.hierarchical || false
}

export function getHierarchicalGroups(): string[] {
  return Object.entries(LOOKUP_CONFIG)
    .filter(([, config]) => config.hierarchical)
    .map(([key]) => key)
}
