import { AppShell } from '@/components/layout/app-shell'
import { ClientCard } from '@/components/domain/cards'
import { requirePageContext } from '@/lib/auth/page'
import { listClients } from '@/features/clients/repository'

export default async function ClientsPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const { supabase, user, unreadCount } = await requirePageContext()
  const result = await listClients(supabase, { search: params.q, pageSize: 50 })

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <form action="/clients" className="relative">
          <input
            name="q"
            defaultValue={params.q || ''}
            placeholder="Müvekkil ara"
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm"
          />
        </form>
        {result.items.length > 0 ? (
          <div className="space-y-3">{result.items.map((item) => <ClientCard key={item.id} client={item} />)}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Müvekkil bulunamadı.
          </div>
        )}
      </div>
    </AppShell>
  )
}
