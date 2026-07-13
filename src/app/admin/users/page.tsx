import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { UserManagementPanel } from '@/components/domain/user-management-panel'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { requirePageContext } from '@/lib/auth/page'

export default async function AdminUsersPage() {
  const { supabase, user, unreadCount } = await requirePageContext()

  if (user.role !== 'admin') {
    redirect('/home')
  }

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Yönetim / Kullanıcılar</p>
            <h1 className="text-2xl font-semibold tracking-tight">Kullanıcılar ve yetkiler</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Ekibinizdeki kullanıcıların rolünü ve aktiflik durumunu buradan yönetebilirsiniz. Rol değişiklikleri kullanıcının görebileceği ekranları etkiler.
            </p>
          </div>
          <Link href="/admin" className={cn(buttonVariants({ variant: 'outline' }))}>
            <ArrowLeft className="size-4" />
            Yönetim merkezi
          </Link>
        </div>

        <UserManagementPanel initialUsers={users || []} currentUserId={user.id} />
      </div>
    </AppShell>
  )
}
