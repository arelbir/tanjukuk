'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import type { UserContext } from '@/lib/auth'
import { getBottomNavigation, isNavigationActive } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  user: UserContext
  onQuickAction: () => void
}

export function MobileBottomNav({ user, onQuickAction }: MobileBottomNavProps) {
  const pathname = usePathname()
  const items = getBottomNavigation(user).filter((item) => item.key !== 'calendar')
  const primaryItems = [items[0], items[1]].filter((item): item is NonNullable<typeof item> => Boolean(item))
  const secondaryItems = [items.find((item) => item.key === 'finance'), items.find((item) => item.key === 'more')].filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur md:hidden" aria-label="Ana navigasyon">
        <div className="grid grid-cols-5 gap-1">
          {primaryItems.map((item) => {
            const Icon = item.icon
            const active = isNavigationActive(pathname, item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}

          <button
            type="button"
            aria-label="Yeni işlem menüsünü aç"
            className="mx-auto -mt-5 flex size-14 items-center justify-center rounded-lg border-4 border-background bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            onClick={onQuickAction}
          >
            <Plus className="size-6" />
          </button>

          {secondaryItems.map((item) => {
            const Icon = item.icon
            const active = isNavigationActive(pathname, item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
  )
}
