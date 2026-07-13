export type SupportedCurrency = 'TRY' | 'USD' | 'EUR'

export type DateInput = Date | string | number | null | undefined

export type MoneyInput = number | string | null | undefined

export interface MoneyAmount {
  amount: MoneyInput
  currency?: string | null
}

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  fallback?: string
  locale?: string
}

export interface FormatMoneyOptions extends Omit<Intl.NumberFormatOptions, 'currency'> {
  fallback?: string
  locale?: string
  currency?: string | null
  showCurrency?: boolean
}

const DEFAULT_LOCALE = 'tr-TR'
const DEFAULT_CURRENCY: SupportedCurrency = 'TRY'
const DEFAULT_FALLBACK = '-'

const currencySymbols: Record<SupportedCurrency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
}

function parseDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function parseAmount(value: MoneyInput): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const amount = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(amount)) {
    return null
  }

  return amount
}

export function normalizeCurrency(currency?: string | null): SupportedCurrency {
  const normalized = currency?.trim().toUpperCase()

  if (normalized === 'USD' || normalized === 'EUR' || normalized === 'TRY') {
    return normalized
  }

  return DEFAULT_CURRENCY
}

export function formatDate(value: DateInput, options: FormatDateOptions = {}) {
  const { fallback = DEFAULT_FALLBACK, locale = DEFAULT_LOCALE, ...dateOptions } = options
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...dateOptions,
  }).format(date)
}

export function formatDateTime(value: DateInput, options: FormatDateOptions = {}) {
  const { fallback = DEFAULT_FALLBACK, locale = DEFAULT_LOCALE, ...dateOptions } = options
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...dateOptions,
  }).format(date)
}

export function formatRelativeDate(value: DateInput, options: FormatDateOptions = {}) {
  const { fallback = DEFAULT_FALLBACK, locale = DEFAULT_LOCALE } = options
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfDate.getTime() - startOfToday.getTime()) / 86_400_000)

  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Yarın'
  if (diffDays === -1) return 'Dün'

  if (Math.abs(diffDays) <= 7) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(diffDays, 'day')
  }

  return formatDate(date, options)
}

export function formatMoney(value: MoneyInput, options: FormatMoneyOptions = {}) {
  const {
    fallback = DEFAULT_FALLBACK,
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    showCurrency = true,
    ...numberOptions
  } = options
  const amount = parseAmount(value)

  if (amount === null) {
    return fallback
  }

  const normalizedCurrency = normalizeCurrency(currency)

  if (showCurrency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: normalizedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...numberOptions,
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...numberOptions,
  }).format(amount)
}

export function formatNumber(value: MoneyInput, options: Intl.NumberFormatOptions & { fallback?: string; locale?: string } = {}) {
  const { fallback = DEFAULT_FALLBACK, locale = DEFAULT_LOCALE, ...numberOptions } = options
  const amount = parseAmount(value)

  if (amount === null) {
    return fallback
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    ...numberOptions,
  }).format(amount)
}

export function getCurrencySymbol(currency?: string | null) {
  return currencySymbols[normalizeCurrency(currency)]
}

export function sumMoneyByCurrency<T extends MoneyAmount>(items: T[]) {
  return items.reduce<Record<SupportedCurrency, number>>(
    (totals, item) => {
      const amount = parseAmount(item.amount) ?? 0
      const currency = normalizeCurrency(item.currency)

      totals[currency] += amount

      return totals
    },
    { TRY: 0, USD: 0, EUR: 0 }
  )
}

export function formatMoneyTotals(totals: Partial<Record<string, MoneyInput>>, options: FormatMoneyOptions = {}) {
  const entries = Object.entries(totals)
    .map(([currency, amount]) => ({ currency: normalizeCurrency(currency), amount: parseAmount(amount) ?? 0 }))
    .filter((entry) => entry.amount !== 0)

  if (entries.length === 0) {
    return formatMoney(0, { ...options, currency: options.currency ?? DEFAULT_CURRENCY })
  }

  return entries.map((entry) => formatMoney(entry.amount, { ...options, currency: entry.currency })).join(' / ')
}

export function calculateMoneyTotal<T extends MoneyAmount>(items: T[], currency?: string | null) {
  const normalizedCurrency = normalizeCurrency(currency)

  return items.reduce((total, item) => {
    if (normalizeCurrency(item.currency) !== normalizedCurrency) {
      return total
    }

    return total + (parseAmount(item.amount) ?? 0)
  }, 0)
}
