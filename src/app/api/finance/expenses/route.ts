import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit'
import { getFirstZodError } from '@/lib/validation/zod'
import { expenseFormSchema } from '@/features/finance/schemas'
import { toExpensePayload } from '@/features/finance/repository'

async function requireFinanceUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }) }

  const { data: profile } = await supabase.from('profiles').select('id, role, is_active').eq('id', user.id).maybeSingle()
  if (!profile?.is_active) return { error: NextResponse.json({ error: 'Aktif kullanıcı bulunamadı' }, { status: 403 }) }
  if (!['admin', 'assistant', 'finance'].includes(profile.role)) return { error: NextResponse.json({ error: 'Gider oluşturma yetkiniz yok' }, { status: 403 }) }

  return { user }
}

export async function POST(request: NextRequest) {
  const auth = await requireFinanceUser()
  if ('error' in auth) return auth.error

  const body = await request.json().catch(() => null)
  const parsed = expenseFormSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: getFirstZodError(parsed.error) }, { status: 400 })

  const service = createServiceRoleSupabaseClient()
  const { data, error } = await service
    .from('expenses')
    .insert({ ...toExpensePayload(parsed.data), created_by: auth.user.id })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message || 'Gider oluşturulamadı' }, { status: 500 })

  await writeAuditLog(service, {
    actorId: auth.user.id,
    action: 'expense.created',
    entityType: 'expense',
    entityId: data.id,
    newValues: data,
  })

  return NextResponse.json({ expense: data }, { status: 201 })
}
