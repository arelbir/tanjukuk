type NullableString = string | null | undefined

type UyapKind = 'E' | 'K' | 'D_IS' | 'TAL' | string | null | undefined

export const UYAP_FILE_KIND_OPTIONS = [
  { value: 'E', label: 'Esas (E.)' },
  { value: 'K', label: 'Karar (K.)' },
  { value: 'D_IS', label: 'Değişik İş (D. İş)' },
  { value: 'TAL', label: 'Talimat (Tal.)' },
]

export function formatUyapKind(kind: UyapKind) {
  switch (kind) {
    case 'K':
      return 'K.'
    case 'D_IS':
      return 'D. İş'
    case 'TAL':
      return 'Tal.'
    case 'E':
    default:
      return 'E.'
  }
}

function compact(parts: Array<NullableString | number>) {
  return parts
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

function formatYearNo(year?: number | string | null, no?: string | null, kind?: UyapKind) {
  const cleanYear = String(year ?? '').trim()
  const cleanNo = String(no ?? '').trim()
  if (!cleanYear || !cleanNo) return ''
  return `${cleanYear}/${cleanNo} ${formatUyapKind(kind)}`
}

export function formatCaseUyapFileName(input: {
  courtCity?: NullableString
  courtDistrict?: NullableString
  courtNo?: NullableString
  courtType?: NullableString
  fileYear?: number | string | null
  fileNo?: NullableString
  uyapFileKind?: UyapKind
}) {
  const cleanCourtNo = String(input.courtNo ?? '').trim()
  const courtNumber = cleanCourtNo ? (/^\d+$/.test(cleanCourtNo) ? `${cleanCourtNo}.` : cleanCourtNo) : ''
  const hasCourtIdentity = Boolean(input.courtCity || input.courtDistrict || courtNumber || input.courtType)
  const courtLabel = hasCourtIdentity ? compact([input.courtCity, input.courtDistrict, courtNumber, input.courtType]) : ''
  const yearNo = formatYearNo(input.fileYear, input.fileNo, input.uyapFileKind)
  return compact([courtLabel, yearNo])
}

export function formatEnforcementUyapFileName(input: {
  officeCity?: NullableString
  officeDistrict?: NullableString
  enforcementOffice?: NullableString
  fileYear?: number | string | null
  fileNo?: NullableString
  uyapFileKind?: UyapKind
}) {
  const officeLabel = compact([input.officeDistrict || input.officeCity, input.enforcementOffice])
  const normalizedOffice = officeLabel ? (officeLabel.toLocaleLowerCase('tr-TR').includes('icra') ? officeLabel : compact([officeLabel, 'İcra Dairesi'])) : ''
  const yearNo = formatYearNo(input.fileYear, input.fileNo, input.uyapFileKind || 'E')
  return compact([normalizedOffice, yearNo])
}
