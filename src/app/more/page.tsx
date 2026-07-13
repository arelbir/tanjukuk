import Link from 'next/link'

import { AppShell } from '@/components/layout/app-shell'
import { SignOutButton } from '@/components/domain/sign-out-button'
import { Card } from '@/components/ui/card'
import { getMoreNavigation } from '@/lib/auth'
import { requirePageContext } from '@/lib/auth/page'

export default async function MorePage() {
  const { user, unreadCount } = await requirePageContext()
  const items = getMoreNavigation(user)

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            return <Link key={item.key} href={item.href} className="flex min-h-14 items-center gap-3 rounded-md border border-border bg-card px-4 font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><Icon className="size-5 text-muted-foreground" />{item.label}</Link>
          })}
        </div>
        <Card className="space-y-3 p-4">
          <h2 className="font-semibold">Ayarlar</h2>
          <p className="text-sm text-muted-foreground">Hesap ve bildirim ayarları.</p>
          <SignOutButton />
        </Card>
      </div>
    </AppShell>
  )
}
