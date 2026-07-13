import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { LookupManagementPanel } from '@/components/domain/lookup-management-panel'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { requirePageContext } from '@/lib/auth/page'

export default async function AdminLookupsPage() {
  const { supabase, user, unreadCount } = await requirePageContext()

  if (user.role !== 'admin') {
    redirect('/home')
  }

  const { data, error } = await supabase
    .from('lookup_values')
    .select('*')
    .order('group_key', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw error

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Yönetim / Ayarlar</p>
            <h1 className="text-2xl font-semibold tracking-tight">Seçim listeleri</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Formlardaki açılır menülerde görünen değerleri buradan yönetebilirsiniz. Pasife alınan değerler eski kayıtlarda korunur, ancak yeni kayıtlarda kullanıcıya gösterilmez.
            </p>
          </div>
          <Link href="/admin" className={cn(buttonVariants({ variant: 'outline' }))}>
            <ArrowLeft className="size-4" />
            Yönetim merkezi
          </Link>
        </div>
        <LookupManagementPanel initialLookups={data || []} />
      </div>
    </AppShell>
  )
}
