import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.generated'

const supabaseUrl = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function requireServerSupabaseEnv() {
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

function requireServiceRoleEnv() {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
  }
}

function createCookieAdapter(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set(name, value, options)
      } catch {
        // Server Components cannot set cookies. Route Handlers and Server Actions can.
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        cookieStore.set(name, '', options)
      } catch {
        // Server Components cannot set cookies. Route Handlers and Server Actions can.
      }
    },
  }
}

export async function createServerSupabaseClient() {
  const env = requireServerSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: createCookieAdapter(cookieStore),
  })
}

export async function createTypedServerSupabaseClient() {
  const env = requireServerSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: createCookieAdapter(cookieStore),
  })
}

export function createServiceRoleSupabaseClient() {
  const env = requireServiceRoleEnv()

  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * @deprecated Use createServerSupabaseClient for legacy screens or createTypedServerSupabaseClient for new-schema features.
 */
export async function createClient() {
  return createServerSupabaseClient()
}

/**
 * @deprecated Use createTypedServerSupabaseClient instead.
 */
export async function createTypedClient() {
  return createTypedServerSupabaseClient()
}

/**
 * @deprecated Use createServiceRoleSupabaseClient instead.
 */
export function createServiceRoleClient() {
  return createServiceRoleSupabaseClient()
}
