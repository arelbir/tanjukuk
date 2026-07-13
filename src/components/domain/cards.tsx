import Link from 'next/link'
import { CheckCircle2, Clock3, Download, ExternalLink, FileText, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MarkNotificationReadButton } from '@/components/domain/notification-actions'
import type { ClientRow } from '@/features/clients/types'
import type { DocumentListItem } from '@/features/documents/types'
import type { NotificationRow } from '@/features/notifications/types'
import type { agenda, clients, documents, files, financeItems } from './demo-data'

const agendaToneByType: Record<string, { badge: string; icon: string; rail: string; surface: string }> = {
  Görev: {
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: 'text-blue-600',
    rail: 'border-l-blue-500',
    surface: 'bg-blue-50/60',
  },
  Duruşma: {
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
    icon: 'text-violet-600',
    rail: 'border-l-violet-500',
    surface: 'bg-violet-50/60',
  },
  Randevu: {
    badge: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    icon: 'text-cyan-600',
    rail: 'border-l-cyan-500',
    surface: 'bg-cyan-50/60',
  },
  'Son tarih': {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: 'text-amber-600',
    rail: 'border-l-amber-500',
    surface: 'bg-amber-50/60',
  },
}

const notificationToneByTitle = [
  {
    match: 'duruşma',
    dot: 'bg-violet-500 ring-violet-100',
    badge: 'bg-violet-50 text-violet-700',
    action: 'text-violet-700 hover:bg-violet-50 hover:text-violet-800',
  },
  {
    match: 'görev',
    dot: 'bg-blue-500 ring-blue-100',
    badge: 'bg-blue-50 text-blue-700',
    action: 'text-blue-700 hover:bg-blue-50 hover:text-blue-800',
  },
  {
    match: 'gecik',
    dot: 'bg-rose-500 ring-rose-100',
    badge: 'bg-rose-50 text-rose-700',
    action: 'text-rose-700 hover:bg-rose-50 hover:text-rose-800',
  },
  {
    match: 'dekont',
    dot: 'bg-emerald-500 ring-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700',
    action: 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
  },
]

function getAgendaTone(type: string, overdue?: boolean, completed?: boolean) {
  if (completed) {
    return {
      badge: 'border-slate-200 bg-slate-50 text-slate-600',
      icon: 'text-slate-500',
      rail: 'border-l-slate-400',
      surface: 'bg-slate-50',
    }
  }

  if (overdue) {
    return {
      badge: 'border-rose-200 bg-rose-50 text-rose-700',
      icon: 'text-rose-600',
      rail: 'border-l-rose-500',
      surface: 'bg-rose-50/60',
    }
  }

  return agendaToneByType[type] || agendaToneByType.Görev
}

type NotificationCardItem = {
  id: string
  title: string
  description: string
  unread: boolean
}

function getNotificationTone(notification: Pick<NotificationCardItem, 'title' | 'description'>) {
  const content = `${notification.title} ${notification.description}`.toLocaleLowerCase('tr-TR')
  return notificationToneByTitle.find((tone) => content.includes(tone.match)) || {
    dot: 'bg-primary ring-primary/10',
    badge: 'bg-primary/10 text-primary',
    action: 'text-primary hover:bg-primary/10 hover:text-primary',
  }
}

export function FileCard({ file }: { file: (typeof files)[number] }) {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/files/${file.type}/${file.id}`} className="font-semibold text-primary hover:underline">
            {file.code}
          </Link>
          <p className="mt-1 truncate text-sm text-muted-foreground">{file.client}</p>
        </div>
        <Badge variant={file.type === 'case' ? 'default' : 'secondary'}>{file.type === 'case' ? 'Dava' : 'İcra'}</Badge>
      </div>
      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <p><span className="font-medium text-foreground">Karşı taraf:</span> {file.counterparty}</p>
        <p><span className="font-medium text-foreground">Durum:</span> {file.status}</p>
        <p><span className="font-medium text-foreground">Sorumlu:</span> {file.responsible}</p>
        <p><span className="font-medium text-foreground">Finans:</span> {file.finance}</p>
      </div>
      <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Sonraki ajanda:</span> {file.nextAgenda}
      </div>
    </Card>
  )
}

export function AgendaItemCard({
  item,
  completed = false,
  onComplete,
  onReopen,
  onOpenDetail,
}: {
  item: (typeof agenda)[number]
  completed?: boolean
  onComplete?: () => void
  onReopen?: () => void
  onOpenDetail?: () => void
}) {
  const actionLabel = completed ? 'Geri al' : 'Tamamla'
  const tone = getAgendaTone(item.type, item.overdue, completed)

  return (
    <Card
      className={cn(
        'overflow-hidden p-0 transition-colors hover:border-primary/30',
        item.overdue && !completed && 'border-destructive/50',
        completed && 'border-primary/20 bg-muted/20'
      )}
    >
      <div className={cn('grid border-l-4 md:grid-cols-[8rem_minmax(0,1fr)_10rem]', tone.rail)}>
        <div className={cn('flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:flex-col md:items-start md:justify-center md:border-b-0 md:border-r md:px-4', tone.surface)}>
          <div className="flex items-center gap-2 md:block">
            <Clock3 className={cn('size-4 md:hidden', tone.icon)} />
            <p className="text-lg font-semibold leading-none tracking-tight text-foreground md:text-2xl">{item.time}</p>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:mt-2 md:normal-case md:tracking-normal">{item.date}</p>
        </div>

        <div className="min-w-0 px-4 py-3 md:py-4">
          <div className="flex items-start justify-between gap-3 md:block">
            <button type="button" onClick={onOpenDetail} className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label={`${item.title} detayını aç`}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Konu</p>
              <h3 className={cn('mt-0.5 line-clamp-2 text-base font-semibold leading-6 hover:text-primary', completed && 'text-muted-foreground line-through hover:text-muted-foreground')}>{item.title}</h3>
            </button>
            <Badge variant="outline" className={cn('shrink-0 md:hidden', tone.badge)}>{completed ? 'Tamamlandı' : item.type}</Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-2.5 text-sky-700">
              <FileText className="size-3.5" />
              {item.file}
            </span>
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 text-indigo-700">
              <UserRound className="size-3.5" />
              {item.responsible}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-4 py-3 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:py-4">
          <Badge variant="outline" className={cn('hidden md:inline-flex', tone.badge)}>{completed ? 'Tamamlandı' : item.type}</Badge>
          {onComplete ? (
            <Button
              variant={completed ? 'secondary' : 'outline'}
              size="sm"
              onClick={completed ? onReopen : onComplete}
              className="w-full md:w-auto"
              aria-label={completed ? `${item.title} kaydını tekrar aç` : `${item.title} kaydını tamamla`}
            >
              <CheckCircle2 className={cn('size-4', completed && 'text-primary')} />
              {actionLabel}
            </Button>
          ) : (
            <Link href={`/calendar?complete=${item.id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full md:w-auto')}>
              <CheckCircle2 className="size-4" />
              Tamamla
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}

export function FinanceCard({ item }: { item: (typeof financeItems)[number] }) {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{item.amount}</p>
          <p className="text-sm text-muted-foreground">{item.client}</p>
        </div>
        <Badge variant="outline">{item.kind}</Badge>
      </div>
      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <p><span className="font-medium text-foreground">Dosya:</span> {item.file}</p>
        <p><span className="font-medium text-foreground">Tarih:</span> {item.date}</p>
        <p><span className="font-medium text-foreground">Durum:</span> {item.status}</p>
      </div>
    </Card>
  )
}

export function DocumentCard({ document }: { document: (typeof documents)[number] | DocumentListItem }) {
  const isDbDocument = 'file_name' in document
  const name = isDbDocument ? document.file_name : document.name
  const relation = isDbDocument ? document.owner?.label || document.entity_type : document.relation
  const uploader = isDbDocument ? document.uploader?.full_name || document.uploader?.email || 'Bilinmiyor' : document.uploader
  const date = isDbDocument && document.created_at ? new Date(document.created_at).toLocaleDateString('tr-TR') : isDbDocument ? '' : document.date
  const size = isDbDocument ? `${Math.max(1, Math.round(Number(document.file_size || 0) / 1024))} KB` : document.size
  const finance = isDbDocument ? ['receivable', 'payment', 'expense'].includes(document.entity_type) : document.finance

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{relation}</p>
        </div>
        <Badge variant={finance ? 'secondary' : 'outline'}>{finance ? 'Finans' : 'Hukuki'}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{uploader} · {date} · {size}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm"><Download className="size-4" />İndir</Button>
        <Button variant="ghost" size="sm"><ExternalLink className="size-4" />Kayda git</Button>
      </div>
    </Card>
  )
}

export function ClientCard({ client }: { client: (typeof clients)[number] | ClientRow }) {
  const isDbClient = 'is_active' in client
  const typeLabel = isDbClient ? (client.type === 'company' ? 'Tüzel kişi' : 'Gerçek kişi') : client.type
  const contact = isDbClient ? (client.email || client.phone || 'İletişim yok') : client.contact
  const status = isDbClient ? (client.is_active ? 'Aktif' : 'Pasif') : `${client.activeFiles} aktif dosya`

  return (
    <Card className="space-y-2 p-4">
      <Link href={`/clients/${client.id}`} className="font-semibold text-primary hover:underline">{client.name}</Link>
      <p className="text-sm text-muted-foreground">{typeLabel} · {contact}</p>
      <p className="text-sm font-medium">{status}</p>
    </Card>
  )
}

export function NotificationCard({ notification }: { notification: NotificationCardItem | NotificationRow }) {
  const normalized = 'is_read' in notification
    ? {
      id: notification.id,
      title: notification.title,
      description: notification.message || '',
      unread: !notification.is_read,
    }
    : notification
  const tone = getNotificationTone(normalized)

  return (
    <div className="group relative rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.02] sm:px-4">
      <div className="flex items-start gap-3">
        <span className={cn('mt-2 size-2.5 shrink-0 rounded-full ring-4', normalized.unread ? tone.dot : 'bg-muted-foreground/30 ring-muted')} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold leading-5 text-foreground">{normalized.title}</h3>
                {normalized.unread ? <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', tone.badge)}>Yeni</span> : null}
              </div>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{normalized.description}</p>
            </div>
            {normalized.unread ? <MarkNotificationReadButton id={normalized.id} label={normalized.title} className={tone.action} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
