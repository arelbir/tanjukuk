'use client'

import Link from 'next/link'
import { CheckCircle2, FileText, UserRound } from 'lucide-react'
import { FormSheet } from '@/components/primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { agenda } from './demo-data'

interface AgendaDetailSheetProps {
  item: (typeof agenda)[number] | null
  open: boolean
  completed?: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  onReopen: () => void
}

export function AgendaDetailSheet({ item, open, completed = false, onOpenChange, onComplete, onReopen }: AgendaDetailSheetProps) {
  if (!item) return null

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ajanda detayı"
      description="Kayıt bilgisini inceleyin ve durumunu yönetin."
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Kapat</Button>
          <Button variant={completed ? 'secondary' : 'default'} onClick={completed ? onReopen : onComplete}>
            <CheckCircle2 className="size-4" />
            {completed ? 'Geri al' : 'Tamamla'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Konu</p>
              <h2 className="mt-1 text-lg font-semibold">{item.title}</h2>
            </div>
            <Badge variant={completed ? 'secondary' : item.overdue ? 'destructive' : 'outline'}>{completed ? 'Tamamlandı' : item.type}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{item.date} · {item.time}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3">
            <FileText className="size-4 text-muted-foreground" />
            <span>{item.file}</span>
          </div>
          <div className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3">
            <UserRound className="size-4 text-muted-foreground" />
            <span>{item.responsible}</span>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
          Açıklama eklenmemiş.
        </div>

        <Link href="/files/case/case-1" className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
          Bağlı dosyaya git
        </Link>
      </div>
    </FormSheet>
  )
}
