import { SlidersHorizontal } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { DocumentCard } from '@/components/domain/cards'
import { DocumentUploadButton } from '@/components/domain/document-upload-button'
import { Button } from '@/components/ui/button'
import { requirePageContext } from '@/lib/auth/page'
import { getDocumentFormOptions, listDocuments } from '@/features/documents/repository'

export default async function DocumentsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const { supabase, user, unreadCount } = await requirePageContext()
  const [items, options] = await Promise.all([
    listDocuments(supabase, { search: params.q, archive: 'active' }),
    getDocumentFormOptions(supabase),
  ])

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <form action="/documents" className="flex-1">
            <input
              name="q"
              defaultValue={params.q || ''}
              placeholder="Belge ara"
              className="h-11 w-full rounded-md border border-input bg-card px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm"
            />
          </form>
          <Button variant="outline" size="icon" aria-label="Belge filtreleri"><SlidersHorizontal className="size-4" /></Button>
          <DocumentUploadButton options={options} />
        </div>
        {items.length > 0 ? (
          <div className="space-y-3">{items.map((item) => <DocumentCard key={item.id} document={item} />)}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belge bulunamadı.
          </div>
        )}
      </div>
    </AppShell>
  )
}
