import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, History, ShieldCheck } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { requirePageContext } from '@/lib/auth/page'

interface AuditPageSearchParams {
  entity?: string
  actor?: string
  action?: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    'lookup.created': 'Seçim değeri eklendi',
    'lookup.updated': 'Seçim değeri güncellendi',
    'lookup.deactivated': 'Seçim değeri pasife alındı',
    'profile.invited': 'Kullanıcı davet edildi',
    'profile.created_manually': 'Kullanıcı oluşturuldu',
    'profile.role_updated': 'Kullanıcı rolü değiştirildi',
    'profile.status_updated': 'Kullanıcı durumu değiştirildi',
    'calendar_event.completed': 'Ajanda kaydı tamamlandı',
    'calendar_event.reopened': 'Ajanda kaydı tekrar açıldı',
  }

  return labels[action] || action
}

function entityLabel(entityType: string) {
  const labels: Record<string, string> = {
    lookup_value: 'Seçim listesi',
    profile: 'Kullanıcı',
    calendar_event: 'Ajanda',
    case_file: 'Dava dosyası',
    enforcement_file: 'İcra dosyası',
    client: 'Müvekkil',
    document: 'Belge',
  }

  return labels[entityType] || entityType
}

function compactJson(value: unknown) {
  if (!value || typeof value !== 'object') return null
  const entries = Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== null && entryValue !== undefined)
  if (entries.length === 0) return null
  return entries.slice(0, 4).map(([key, entryValue]) => `${key}: ${typeof entryValue === 'object' ? JSON.stringify(entryValue) : String(entryValue)}`).join(' · ')
}

export default async function AdminAuditPage({ searchParams }: { searchParams?: Promise<AuditPageSearchParams> }) {
  const params = searchParams ? await searchParams : {}
  const { supabase, user, unreadCount } = await requirePageContext()

  if (user.role !== 'admin') {
    redirect('/home')
  }

  let query = supabase
    .from('audit_logs')
    .select('*, actor:profiles(id, full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.entity?.trim()) {
    query = query.ilike('entity_type', `%${params.entity.trim()}%`)
  }

  if (params.action?.trim()) {
    query = query.ilike('action', `%${params.action.trim()}%`)
  }

  if (params.actor?.trim()) {
    query = query.eq('actor_id', params.actor.trim())
  }

  const { data: logs, error } = await query

  if (error) throw error

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Yönetim / Güvenlik</p>
            <h1 className="text-2xl font-semibold tracking-tight">Audit kayıtları</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Yönetim, kullanıcı, seçim listesi ve kritik kayıt işlemlerinin iz kayıtları. Son 100 kayıt gösterilir.
            </p>
          </div>
          <Link href="/admin" className={cn(buttonVariants({ variant: 'outline' }))}>
            <ArrowLeft className="size-4" />
            Yönetim merkezi
          </Link>
        </div>

        <Card className="border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 text-blue-700" />
            <p>Bu ekran denetim amaçlıdır. Audit kayıtları uygulama içinden düzenlenmez veya silinmez.</p>
          </div>
        </Card>

        <div className="space-y-3">
          {(logs || []).map((log) => {
            const actor = Array.isArray(log.actor) ? log.actor[0] : log.actor
            const oldSummary = compactJson(log.old_values)
            const newSummary = compactJson(log.new_values)

            return (
              <Card key={log.id} className="space-y-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <History className="size-4" />
                      </span>
                      <div>
                        <h2 className="font-semibold">{actionLabel(log.action)}</h2>
                        <p className="text-sm text-muted-foreground">{actor?.full_name || actor?.email || 'Sistem'} · {formatDate(log.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{entityLabel(log.entity_type)}</Badge>
                    <Badge variant="secondary">{log.action}</Badge>
                  </div>
                </div>

                <div className="grid gap-2 text-sm md:grid-cols-2">
                  {oldSummary ? (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Önce</p>
                      <p className="break-words text-muted-foreground">{oldSummary}</p>
                    </div>
                  ) : null}
                  {newSummary ? (
                    <div className="rounded-xl bg-muted p-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Sonra</p>
                      <p className="break-words text-muted-foreground">{newSummary}</p>
                    </div>
                  ) : null}
                </div>

                <p className="text-xs text-muted-foreground">Kayıt no: {log.id}{log.entity_id ? ` · İlgili kayıt: ${log.entity_id}` : ''}</p>
              </Card>
            )
          })}

          {logs?.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">Henüz audit kaydı bulunamadı.</Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}
