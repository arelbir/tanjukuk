'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Plus, Scale } from 'lucide-react'
import { MobileBottomNav } from '@/components/app-shell/mobile-bottom-nav'
import { TopBar } from '@/components/app-shell/top-bar'
import { QuickActionController } from '@/components/domain/quick-action-controller'
import { Button } from '@/components/ui/button'
import { getBottomNavigation, getRoleLabel, isNavigationActive, type UserContext } from '@/lib/auth'
import { createTypedBrowserSupabaseClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const titleByPath: Array<[string, string]> = [
  ['/home', 'Ana Sayfa'],
  ['/files', 'Dosyalar'],
  ['/calendar', 'Ajanda'],
  ['/finance', 'Finans'],
  ['/documents', 'Belgeler'],
  ['/clients', 'Müvekkiller'],
  ['/notifications', 'Bildirimler'],
  ['/more', 'Daha Fazla'],
  ['/admin', 'Yönetim'],
]

function getTitle(pathname: string) {
  return titleByPath.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] || 'Hukuk Büro'
}

function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 md:px-6" role="status">
      Çevrimdışısınız. Görüntüleme sınırlı olabilir; kayıt işlemleri bağlantı geri geldiğinde yapılmalıdır.
    </div>
  )
}

export function AppShell({ children, user, unreadCount = 0 }: { children: ReactNode; user: UserContext; unreadCount?: number }) {
  const pathname = usePathname()
  const title = getTitle(pathname)
  const navItems = useMemo(() => getBottomNavigation(user), [user])
  const [quickMenuOpen, setQuickMenuOpen] = useState(false)

  async function signOut() {
    const supabase = createTypedBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="size-5" />
          </span>
          <div>
            <p className="font-semibold leading-tight">Hukuk Büro</p>
            <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Masaüstü navigasyon">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isNavigationActive(pathname, item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <Button className="w-full justify-start" onClick={() => setQuickMenuOpen(true)}>
            <Plus className="size-4" />
            Yeni işlem
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={signOut}>
            <LogOut className="size-4" />
            Çıkış
          </Button>
        </div>
      </div>

      <div className="md:pl-64">
        <TopBar title={title} user={user} unreadCount={unreadCount} />
        <OfflineBanner />
        <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-4 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-6 md:py-6 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav user={user} onQuickAction={() => setQuickMenuOpen(true)} />
      <QuickActionController user={user} open={quickMenuOpen} onOpenChange={setQuickMenuOpen} />
    </div>
  )
}
