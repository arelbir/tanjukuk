import { z } from 'zod'
import type { DocumentEntityType, DocumentUploadFormValues } from './types'

export const documentEntityTypes = [
  'client',
  'case_file',
  'enforcement_file',
  'calendar_event',
  'receivable',
  'payment',
  'expense',
] as const

export const allowedDocumentMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
] as const

export const maxDocumentFileSize = 50 * 1024 * 1024

export const documentUploadMetadataSchema = z.object({
  entity_type: z.enum(documentEntityTypes),
  entity_id: z.string().uuid('Bağlanacak kayıt seçin'),
  description: z.string().max(1000, 'Açıklama en fazla 1000 karakter olabilir').optional().default(''),
  file_name: z.string().min(1, 'Dosya adı zorunludur').max(255, 'Dosya adı çok uzun'),
  file_size: z.number().int().positive('Dosya boyutu geçersiz').max(maxDocumentFileSize, 'Dosya 50 MB’den büyük olamaz'),
  mime_type: z.enum(allowedDocumentMimeTypes, { message: 'Bu dosya türü desteklenmiyor' }),
})

export const documentArchiveSchema = z.object({
  archived: z.boolean(),
})

export type DocumentUploadMetadataInput = z.input<typeof documentUploadMetadataSchema>
export type DocumentUploadMetadataOutput = z.output<typeof documentUploadMetadataSchema>
export type DocumentArchiveInput = z.input<typeof documentArchiveSchema>

export const documentUploadDefaultValues: DocumentUploadFormValues = {
  entity_type: 'client' satisfies DocumentEntityType,
  entity_id: '',
  description: '',
  file: null,
}

export function validateDocumentFile(file: File | null): string | null {
  if (!file) {
    return 'Dosya seçin'
  }

  if (file.size <= 0) {
    return 'Dosya boş olamaz'
  }

  if (file.size > maxDocumentFileSize) {
    return 'Dosya 50 MB’den büyük olamaz'
  }

  if (!allowedDocumentMimeTypes.includes(file.type as (typeof allowedDocumentMimeTypes)[number])) {
    return 'Bu dosya türü desteklenmiyor'
  }

  return null
}
