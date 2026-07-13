import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'
import type { UserContext } from './roles'
import { getRoleAccessMessage, isActiveRole } from './roles'

export interface AuthContextResult {
  user: UserContext | null
  error?: string | null
}

export async function getUserContext(supabase: SupabaseClient<Database>): Promise<AuthContextResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, error: 'Oturum bulunamadı' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return { user: null, error: 'Aktif kullanıcı bulunamadı' }
  }

  if (!profile.is_active) {
    return { user: null, error: 'Kullanıcı pasif durumda' }
  }

  const roleMessage = getRoleAccessMessage(profile.role)
  if (roleMessage || !isActiveRole(profile.role)) {
    return { user: null, error: roleMessage || 'Desteklenmeyen kullanıcı rolü' }
  }

  return {
    user: {
      id: profile.id,
      role: profile.role,
      fullName: profile.full_name,
      email: profile.email || user.email,
      isActive: profile.is_active,
    },
    error: null,
  }
}
