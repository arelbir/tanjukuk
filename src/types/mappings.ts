export interface FieldMapping {
  value: string
  label: string
}

export interface FieldMappingGroup {
  key: string
  fields: FieldMapping[]
}

export const ENTITY_TYPE_MAPPING: FieldMapping[] = [
  { value: 'Gerçek Kişi', label: 'Gerçek Kişi' },
  { value: 'Tüzel Kişi', label: 'Tüzel Kişi' },
]

export const CLIENT_ROLE_MAPPING: FieldMapping[] = [
  { value: 'Davacı', label: 'Davacı' },
  { value: 'Davalı', label: 'Davalı' },
  { value: 'Müdahil', label: 'Müdahil' },
  { value: 'Şikayetçi', label: 'Şikayetçi' },
  { value: 'Şüpheli', label: 'Şüpheli' },
]

export const CURRENCY_MAPPING: FieldMapping[] = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

export const PAYMENT_STATUS_MAPPING: FieldMapping[] = [
  { value: 'paid', label: 'Ödendi' },
  { value: 'pending', label: 'Bekliyor' },
  { value: 'partial', label: 'Kısmi' },
]

export const PAYMENT_METHOD_MAPPING: FieldMapping[] = [
  { value: 'cash', label: 'Nakit' },
  { value: 'transfer', label: 'Havale' },
  { value: 'card', label: 'Kart' },
]

export const CLIENT_TYPE_MAPPING: FieldMapping[] = [
  { value: 'individual', label: 'Bireysel' },
  { value: 'company', label: 'Şirket' },
]

export const getFieldLabel = (
  mappings: FieldMapping[],
  value: string
): string => {
  const found = mappings.find(m => m.value === value)
  return found?.label || value
}

export const toSelectItems = (mappings: FieldMapping[]) => {
  return mappings
}

export const CITIES = [
  'Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul',
  'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya',
  'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Samsun', 'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van',
  'Yalova', 'Zonguldak'
] as const

export type City = typeof CITIES[number]