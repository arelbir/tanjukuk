import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.generated'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function requireBrowserSupabaseEnv() {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}

export function createBrowserSupabaseClient() {
  const env = requireBrowserSupabaseEnv()

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey)
}

export function createTypedBrowserSupabaseClient() {
  const env = requireBrowserSupabaseEnv()

  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey)
}

/**
 * @deprecated Use createBrowserSupabaseClient for legacy screens or createTypedBrowserSupabaseClient for new-schema features.
 */
export function createClient() {
  return createBrowserSupabaseClient()
}

/**
 * @deprecated Use createTypedBrowserSupabaseClient instead.
 */
export function createTypedClient() {
  return createTypedBrowserSupabaseClient()
}
