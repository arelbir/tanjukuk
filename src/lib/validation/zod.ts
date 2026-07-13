import { z } from 'zod'

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>

export function zodErrorToFieldErrors<T extends string = string>(error: z.ZodError): FieldErrors<T> {
  return error.issues.reduce<FieldErrors<T>>((acc, issue) => {
    const key = issue.path.join('.') as T
    if (key && !acc[key]) {
      acc[key] = issue.message
    }
    return acc
  }, {})
}

export function getFirstZodError(error: z.ZodError, fallback = 'Form alanlarını kontrol edin') {
  return error.issues[0]?.message || fallback
}

export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}
