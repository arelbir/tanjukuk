import type { SupabaseClient } from '@supabase/supabase-js'

export interface WriteAuditLogInput {
  actorId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
}

export async function writeAuditLog(
  supabase: SupabaseClient,
  {
    actorId,
    action,
    entityType,
    entityId,
    oldValues = null,
    newValues = null,
    metadata = null,
  }: WriteAuditLogInput
) {
  const { error } = await supabase.from('audit_logs').insert({
    actor_id: actorId ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    old_values: oldValues,
    new_values: newValues,
    metadata: metadata ?? {},
  })

  if (error) {
    console.error(`Audit log yazılamadı (${action}/${entityType}):`, error.message)
  }
}
