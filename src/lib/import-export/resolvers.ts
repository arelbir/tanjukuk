import { SupabaseClient } from '@supabase/supabase-js'

function normalizeKey(value: string | null | undefined) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR')
}

export async function buildLookupResolverMap(supabase: SupabaseClient, groupKey: string) {
  const { data, error } = await supabase
    .from('lookup_values')
    .select('id, label')
    .eq('group_key', groupKey)
    .eq('is_active', true)

  if (error) {
    throw new Error(error.message)
  }

  const map = new Map<string, string>()
  ;(data || []).forEach((item) => {
    map.set(normalizeKey(item.label), item.id)
  })

  return map
}

export async function buildUserEmailResolverMap(supabase: SupabaseClient, role?: string) {
  let query = supabase.from('users').select('id, email, role, is_active').eq('is_active', true)
  if (role) {
    query = query.eq('role', role)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(error.message)
  }

  const map = new Map<string, string>()
  ;(data || []).forEach((item) => {
    map.set(normalizeKey(item.email), item.id)
  })

  return map
}

export async function buildClientNameResolverMap(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('clients').select('id, name')
  if (error) {
    throw new Error(error.message)
  }

  const map = new Map<string, string>()
  ;(data || []).forEach((item) => {
    map.set(normalizeKey(item.name), item.id)
  })

  return map
}

export async function buildCaseCodeResolverMap(supabase: SupabaseClient) {
  const { data, error } = await supabase.from('cases').select('id, case_code')
  if (error) {
    throw new Error(error.message)
  }

  const map = new Map<string, string>()
  ;(data || []).forEach((item) => {
    map.set(normalizeKey(item.case_code), item.id)
  })

  return map
}

export function resolveFromMap(map: Map<string, string>, value: string | null | undefined) {
  return map.get(normalizeKey(value)) || null
}
