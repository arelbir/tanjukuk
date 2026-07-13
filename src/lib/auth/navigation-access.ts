import { CalendarDays, FileText, FolderKanban, Home, MoreHorizontal, WalletCards, type LucideIcon } from 'lucide-react'
import type { UserContext } from './roles'
import { can } from './permissions'

export interface AppNavigationItem {
  label: string
  href: string
  icon: LucideIcon
  key: 'home' | 'files' | 'calendar' | 'finance' | 'more' | 'documents' | 'clients' | 'notifications' | 'admin'
}

const bottomNavItems: AppNavigationItem[] = [
  { key: 'home', label: 'Ana Sayfa', href: '/home', icon: Home },
  { key: 'files', label: 'Dosyalar', href: '/files', icon: FolderKanban },
  { key: 'calendar', label: 'Ajanda', href: '/calendar', icon: CalendarDays },
  { key: 'finance', label: 'Finans', href: '/finance', icon: WalletCards },
  { key: 'more', label: 'Daha Fazla', href: '/more', icon: MoreHorizontal },
]

const moreItems: AppNavigationItem[] = [
  { key: 'clients', label: 'Müvekkiller', href: '/clients', icon: Home },
  { key: 'documents', label: 'Belgeler', href: '/documents', icon: FileText },
  { key: 'notifications', label: 'Bildirimler', href: '/notifications', icon: CalendarDays },
  { key: 'admin', label: 'Yönetim', href: '/admin', icon: MoreHorizontal },
]

export function getBottomNavigation(user: UserContext | null | undefined) {
  if (!user) return []

  return bottomNavItems.filter((item) => {
    if (item.key === 'calendar' && user.role === 'finance') return false
    if (item.key === 'files' && user.role === 'finance') return false
    return true
  })
}

export function getMoreNavigation(user: UserContext | null | undefined) {
  if (!user) return []

  return moreItems.filter((item) => {
    if (item.key === 'admin') return can(user, 'admin:access')
    if (item.key === 'clients') return user.role === 'admin'
    return true
  })
}

export function isNavigationActive(pathname: string, href: string) {
  if (href === '/home') return pathname === '/home' || pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
