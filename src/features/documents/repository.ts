import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type {
  DocumentEntityType,
  DocumentFilters,
  DocumentFormOptions,
  DocumentListItem,
} from './types'
import type { DocumentUploadMetadataOutput } from './schemas'

export type TypedSupabaseClient = SupabaseClient<Database>

export const DOCUMENTS_BUCKET = 'documents'

const entityLabels: Record<DocumentEntityType, string> = {
  client: 'Müvekkil',
  case_file: 'Dava dosyası',
  enforcement_file: 'İcra dosyası',
  calendar_event: 'Ajanda kaydı',
  receivable: 'Beklenen ödeme',
  payment: 'Tahsilat',
  expense: 'Gider',
}

export function getDocumentEntityLabel(entityType: string) {
  return entityLabels[entityType as DocumentEntityType] || entityType
}

export async function listDocuments(
  supabase: TypedSupabaseClient,
  filters: DocumentFilters = {}
): Promise<DocumentListItem[]> {
  let query = supabase
    .from('documents')
    .select(
      `
      *,
      uploader:profiles!documents_uploaded_by_fkey(id, full_name, email),
      archiver:profiles!documents_archived_by_fkey(id, full_name, email)
    `
    )
    .order('created_at', { ascending: false })

  if (!filters.archive || filters.archive === 'active') {
    query = query.is('archived_at', null)
  }

  if (filters.archive === 'archived') {
    query = query.not('archived_at', 'is', null)
  }

  if (filters.entityType && filters.entityType !== 'all') {
    query = query.eq('entity_type', filters.entityType)
  }

  if (filters.entityId) {
    query = query.eq('entity_id', filters.entityId)
  }

  if (filters.uploadedBy && filters.uploadedBy !== 'all') {
    query = query.eq('uploaded_by', filters.uploadedBy)
  }

  const search = filters.search?.trim()
  if (search) {
    query = query.or(`file_name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error

  return attachOwners(supabase, (data || []) as DocumentListItem[])
}

export async function getDocumentById(supabase: TypedSupabaseClient, id: string): Promise<DocumentListItem | null> {
  const { data, error } = await supabase
    .from('documents')
    .select(
      `
      *,
      uploader:profiles!documents_uploaded_by_fkey(id, full_name, email),
      archiver:profiles!documents_archived_by_fkey(id, full_name, email)
    `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const [document] = await attachOwners(supabase, [data as DocumentListItem])
  return document || null
}

export async function getDocumentFormOptions(supabase: TypedSupabaseClient): Promise<DocumentFormOptions> {
  const [clientsResult, casesResult, enforcementsResult] = await Promise.all([
    supabase.from('clients').select('id, name').eq('is_active', true).order('name'),
    supabase
      .from('case_files')
      .select('id, file_code, opposing_party, client_id')
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('enforcement_files')
      .select('id, file_code, debtor_party, client_id')
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),
  ])

  if (clientsResult.error) throw clientsResult.error
  if (casesResult.error) throw casesResult.error
  if (enforcementsResult.error) throw enforcementsResult.error

  return {
    clients: (clientsResult.data || []).map((client) => ({ id: client.id, label: client.name })),
    caseFiles: (casesResult.data || []).map((caseFile) => ({
      id: caseFile.id,
      label: `${caseFile.file_code}${caseFile.opposing_party ? ` • ${caseFile.opposing_party}` : ''}`,
      client_id: caseFile.client_id,
    })),
    enforcementFiles: (enforcementsResult.data || []).map((file) => ({
      id: file.id,
      label: `${file.file_code}${file.debtor_party ? ` • ${file.debtor_party}` : ''}`,
      client_id: file.client_id,
    })),
  }
}

export function toDocumentInsertPayload(values: DocumentUploadMetadataOutput, storagePath: string, uploadedBy: string) {
  return {
    entity_type: values.entity_type,
    entity_id: values.entity_id,
    description: values.description?.trim() || null,
    file_name: values.file_name.trim(),
    file_size: values.file_size,
    mime_type: values.mime_type,
    storage_bucket: DOCUMENTS_BUCKET,
    storage_path: storagePath,
    uploaded_by: uploadedBy,
  }
}

export function buildDocumentStoragePath(values: Pick<DocumentUploadMetadataOutput, 'entity_type' | 'entity_id' | 'file_name'>) {
  const timestamp = Date.now()
  const safeName = values.file_name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180)

  return `${values.entity_type}/${values.entity_id}/${timestamp}-${safeName || 'belge'}`
}

async function attachOwners(
  supabase: TypedSupabaseClient,
  documents: DocumentListItem[]
): Promise<DocumentListItem[]> {
  if (!documents.length) return documents

  const clientIds = documents.filter((item) => item.entity_type === 'client').map((item) => item.entity_id)
  const caseIds = documents.filter((item) => item.entity_type === 'case_file').map((item) => item.entity_id)
  const enforcementIds = documents.filter((item) => item.entity_type === 'enforcement_file').map((item) => item.entity_id)

  const [clientsResult, casesResult, enforcementsResult] = await Promise.all([
    clientIds.length ? supabase.from('clients').select('id, name, client_code').in('id', clientIds) : Promise.resolve({ data: [], error: null }),
    caseIds.length
      ? supabase.from('case_files').select('id, file_code, opposing_party').in('id', caseIds)
      : Promise.resolve({ data: [], error: null }),
    enforcementIds.length
      ? supabase.from('enforcement_files').select('id, file_code, debtor_party').in('id', enforcementIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (clientsResult.error) throw clientsResult.error
  if (casesResult.error) throw casesResult.error
  if (enforcementsResult.error) throw enforcementsResult.error

  const clientMap = new Map((clientsResult.data || []).map((client) => [client.id, client]))
  const caseMap = new Map((casesResult.data || []).map((caseFile) => [caseFile.id, caseFile]))
  const enforcementMap = new Map((enforcementsResult.data || []).map((file) => [file.id, file]))

  return documents.map((document) => {
    if (document.entity_type === 'client') {
      const owner = clientMap.get(document.entity_id)
      return {
        ...document,
        owner: owner
          ? {
              id: owner.id,
              entityType: 'client',
              label: owner.name,
              subtitle: owner.client_code,
            }
          : null,
      }
    }

    if (document.entity_type === 'case_file') {
      const owner = caseMap.get(document.entity_id)
      return {
        ...document,
        owner: owner
          ? {
              id: owner.id,
              entityType: 'case_file',
              label: owner.file_code,
              subtitle: owner.opposing_party,
            }
          : null,
      }
    }

    if (document.entity_type === 'enforcement_file') {
      const owner = enforcementMap.get(document.entity_id)
      return {
        ...document,
        owner: owner
          ? {
              id: owner.id,
              entityType: 'enforcement_file',
              label: owner.file_code,
              subtitle: owner.debtor_party,
            }
          : null,
      }
    }

    return {
      ...document,
      owner: {
        id: document.entity_id,
        entityType: document.entity_type as DocumentEntityType,
        label: getDocumentEntityLabel(document.entity_type),
      },
    }
  })
}
