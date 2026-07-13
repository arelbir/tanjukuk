import type { Database } from '@/types/database.generated'

export type DocumentRow = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type DocumentEntityType = 'client' | 'case_file' | 'enforcement_file' | 'calendar_event' | 'receivable' | 'payment' | 'expense'
export type DocumentArchiveFilter = 'active' | 'archived' | 'all'

export interface DocumentFilters {
  search?: string
  entityType?: DocumentEntityType | 'all'
  entityId?: string
  archive?: DocumentArchiveFilter
  uploadedBy?: string | 'all'
}

export interface DocumentOwner {
  id: string
  label: string
  entityType: DocumentEntityType
  subtitle?: string | null
}

export interface DocumentListItem extends DocumentRow {
  uploader?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  archiver?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  owner?: DocumentOwner | null
}

export interface DocumentFormOptions {
  clients: Array<{ id: string; label: string }>
  caseFiles: Array<{ id: string; label: string; client_id?: string | null }>
  enforcementFiles: Array<{ id: string; label: string; client_id?: string | null }>
}

export interface DocumentUploadFormValues {
  entity_type: DocumentEntityType
  entity_id: string
  description: string
  file: File | null
}

export interface DocumentUploadPayload {
  entity_type: DocumentEntityType
  entity_id: string
  description?: string | null
  file_name: string
  file_size: number
  mime_type: string
}

export interface DocumentUploadResponse {
  document: DocumentRow
  upload: {
    bucket: string
    path: string
    token: string
    signedUrl: string
  }
}
