'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarDays, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  LogOut,
  Menu,
  Scale
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Dosyalar', href: '/cases', icon: FolderKanban },
  { name: 'Takvim', href: '/calendar', icon: CalendarDays },
  { name: 'Müvekkiller', href: '/clients', icon: Users },
  { name: 'Gelir', href: '/income', icon: TrendingUp },
  { name: 'Gider', href: '/expenses', icon: TrendingDown },
]

const adminNavigation = [
  { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
  { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
  userRole?: string
  onLogout?: () => void
}

export function Sidebar({ userRole = 'assistant', onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <Scale className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg text-sidebar-foreground">Hukuk Bürosu</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
        
        {userRole === 'admin' && (
          <>
            <div className={cn("mt-6 mb-2", collapsed ? "px-0 text-center" : "px-3")}>
              {!collapsed && (
                <span className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">Yönetim</span>
              )}
            </div>
            <ul className="space-y-1">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Çıkış</span>}
        </Button>
      </div>
    </div>
  )
}