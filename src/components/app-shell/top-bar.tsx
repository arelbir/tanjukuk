'use client'

import Link from 'next/link'
import { Bell, UserCircle } from 'lucide-react'

import type { UserContext } from '@/lib/auth'
import { getRoleLabel } from '@/lib/auth'

interface TopBarProps {
  title: string
  user: UserContext
  unreadCount?: number
}

export function TopBar({ title, user, unreadCount = 0 }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight text-foreground">{title}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {user.fullName || user.email || 'Kullanıcı'} · {getRoleLabel(user.role)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications" aria-label="Bildirimler" className="relative inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-md bg-destructive" /> : null}
          </Link>
          <div className="hidden h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm md:flex">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span className="max-w-36 truncate font-medium">{user.fullName || user.email || 'Kullanıcı'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
