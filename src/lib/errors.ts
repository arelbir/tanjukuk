export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export interface AppErrorShape {
  code: AppErrorCode
  message: string
  details?: string
  status?: number
  cause?: unknown
}

export class AppError extends Error implements AppErrorShape {
  code: AppErrorCode
  details?: string
  status?: number
  cause?: unknown

  constructor({ code, message, details, status, cause }: AppErrorShape) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.status = status
    this.cause = cause
  }
}

type ErrorLike = {
  message?: string
  details?: string
  code?: string
  status?: number
}

const genericMessages: Record<AppErrorCode, string> = {
  UNAUTHORIZED: 'Bu işlem için giriş yapmanız gerekiyor.',
  FORBIDDEN: 'Bu işlemi yapmak için yetkiniz yok.',
  NOT_FOUND: 'İstenen kayıt bulunamadı.',
  VALIDATION_ERROR: 'Lütfen formdaki bilgileri kontrol edin.',
  CONFLICT: 'Bu kayıt mevcut verilerle çakışıyor.',
  DATABASE_ERROR: 'Veritabanı işlemi sırasında hata oluştu.',
  NETWORK_ERROR: 'Ağ bağlantısı sırasında hata oluştu.',
  UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu.',
}

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === 'object' && error !== null && ('message' in error || 'code' in error || 'status' in error)
}

function getStatusCode(error: unknown): number | undefined {
  if (!isErrorLike(error)) return undefined
  return typeof error.status === 'number' ? error.status : undefined
}

function getRawMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message
  if (isErrorLike(error) && typeof error.message === 'string') return error.message
  if (typeof error === 'string') return error
  return undefined
}

function getRawCode(error: unknown): string | undefined {
  if (!isErrorLike(error)) return undefined
  return typeof error.code === 'string' ? error.code : undefined
}

export function inferAppErrorCode(error: unknown): AppErrorCode {
  const status = getStatusCode(error)
  const rawCode = getRawCode(error)?.toUpperCase()
  const rawMessage = getRawMessage(error)?.toLowerCase() || ''

  if (status === 401 || rawMessage.includes('unauthorized') || rawMessage.includes('jwt')) return 'UNAUTHORIZED'
  if (status === 403 || rawMessage.includes('forbidden') || rawMessage.includes('permission denied')) return 'FORBIDDEN'
  if (status === 404 || rawMessage.includes('not found') || rawCode === 'PGRST116') return 'NOT_FOUND'
  if (status === 409 || rawCode === '23505' || rawMessage.includes('duplicate')) return 'CONFLICT'
  if (status === 400 || rawCode === '23502' || rawCode === '23514' || rawCode === '22P02') return 'VALIDATION_ERROR'
  if (rawCode?.startsWith('23') || rawCode?.startsWith('PGRST')) return 'DATABASE_ERROR'
  if (rawMessage.includes('failed to fetch') || rawMessage.includes('network')) return 'NETWORK_ERROR'

  return 'UNKNOWN_ERROR'
}

export function getUserFriendlyErrorMessage(error: unknown, fallback?: string) {
  if (error instanceof AppError) {
    return error.message
  }

  const code = inferAppErrorCode(error)
  const rawMessage = getRawMessage(error)

  if (rawMessage) {
    const lowerMessage = rawMessage.toLowerCase()

    if (lowerMessage.includes('invalid login credentials')) {
      return 'E-posta veya şifre hatalı.'
    }

    if (lowerMessage.includes('email not confirmed')) {
      return 'E-posta adresiniz henüz doğrulanmamış.'
    }

    if (lowerMessage.includes('user already registered') || lowerMessage.includes('already registered')) {
      return 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.'
    }

    if (lowerMessage.includes('duplicate key')) {
      return 'Aynı bilgilerle kayıt zaten mevcut.'
    }

    if (lowerMessage.includes('violates row-level security')) {
      return 'Bu kayıt için işlem yetkiniz yok.'
    }

    if (!['UNKNOWN_ERROR', 'DATABASE_ERROR'].includes(code)) {
      return rawMessage
    }
  }

  return fallback || genericMessages[code]
}

export function toAppError(error: unknown, fallback?: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  const code = inferAppErrorCode(error)

  return new AppError({
    code,
    message: getUserFriendlyErrorMessage(error, fallback),
    details: isErrorLike(error) && typeof error.details === 'string' ? error.details : undefined,
    status: getStatusCode(error),
    cause: error,
  })
}

export function getErrorMessage(error: unknown, fallback = genericMessages.UNKNOWN_ERROR) {
  return toAppError(error, fallback).message
}

export function createApiErrorResponse(error: unknown, fallback?: string) {
  const appError = toAppError(error, fallback)

  return {
    error: appError.message,
    code: appError.code,
    ...(appError.details ? { details: appError.details } : {}),
  }
}
