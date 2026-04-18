'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarDays,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react'

const mobileNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Dosyalar', href: '/cases', icon: FolderKanban },
  { name: 'Takvim', href: '/calendar', icon: CalendarDays },
  { name: 'Gelir/Gider', href: '/income', icon: TrendingUp },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background px-2 py-2 lg:hidden">
      {mobileNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md p-2 text-xs",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        )
      })}
      <Link
        href="/cases"
        className="flex flex-col items-center gap-1 rounded-md p-2 text-xs text-muted-foreground"
      >
        <MoreHorizontal className="h-5 w-5" />
        <span>Menü</span>
      </Link>
    </nav>
  )
}