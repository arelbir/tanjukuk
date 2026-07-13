import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { requirePageContext } from '@/lib/auth/page'
import { listCaseFiles } from '@/features/cases/repository'
import { listEnforcementFiles } from '@/features/enforcements/repository'

export default async function FilesPage({ searchParams }: { searchParams?: Promise<{ q?: string; type?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const { supabase, user, unreadCount } = await requirePageContext()
  const [cases, enforcements] = await Promise.all([
    listCaseFiles(supabase, { search: params.q, archive: 'active', pageSize: 50 }),
    listEnforcementFiles(supabase, { search: params.q, archive: 'active', pageSize: 50 }),
  ])

  const files = [
    ...(params.type === 'enforcement' ? [] : cases.items.map((item) => ({ id: item.id, type: 'case' as const, code: item.file_code, client: item.client?.name || 'Müvekkil yok', counterparty: item.opposing_party || 'Karşı taraf yok', status: item.status?.label || 'Durum yok', href: `/files/case/${item.id}` }))),
    ...(params.type === 'case' ? [] : enforcements.items.map((item) => ({ id: item.id, type: 'enforcement' as const, code: item.file_code, client: item.client?.name || 'Müvekkil yok', counterparty: item.debtor_party || 'Borçlu yok', status: item.status?.label || 'Durum yok', href: `/files/enforcement/${item.id}` }))),
  ]

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <form action="/files" className="flex-1">
            <input
              name="q"
              defaultValue={params.q || ''}
              placeholder="Dosya, müvekkil veya karşı taraf ara"
              className="h-11 w-full rounded-md border border-input bg-card px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm"
            />
          </form>
          <Button variant="outline" size="icon" aria-label="Filtreler"><SlidersHorizontal className="size-4" /></Button>
        </div>
        {files.length > 0 ? (
          <div className="space-y-3">
            {files.map((file) => (
              <Card key={`${file.type}-${file.id}`} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={file.href} className="font-semibold text-primary hover:underline">{file.code}</Link>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{file.client}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{file.type === 'case' ? 'Dava' : 'İcra'}</span>
                </div>
                <p className="text-sm text-muted-foreground">{file.counterparty} · {file.status}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Dosya bulunamadı.
          </div>
        )}
      </div>
    </AppShell>
  )
}
