import {
  Archive,
  CalendarDays,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'

export type NavigationRole = 'admin' | 'lawyer' | 'assistant' | 'finance' | string

export interface NavigationItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
  roles?: NavigationRole[]
  mobile?: boolean
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Çalışma Alanı',
    items: [
      { name: 'Ana Sayfa', href: '/dashboard', icon: LayoutDashboard, mobile: true },
      { name: 'Müvekkiller', href: '/clients', icon: Users, mobile: true },
      { name: 'Davalar', href: '/cases', icon: FolderKanban, mobile: true },
      { name: 'İcralar', href: '/enforcements', icon: Archive },
      { name: 'Ajanda', href: '/calendar', icon: CalendarDays, mobile: true },
      { name: 'Finans', href: '/finance', icon: CreditCard, roles: ['admin', 'assistant', 'finance'], mobile: true },
      { name: 'Belgeler', href: '/documents', icon: FileText },
    ],
  },
  {
    label: 'Yönetim',
    items: [
      { name: 'Kullanıcılar', href: '/admin/users', icon: Users, roles: ['admin'] },
      { name: 'Ayarlar', href: '/admin/lookups', icon: Settings, roles: ['admin'] },
      { name: 'Audit Log', href: '/admin/audit', icon: ShieldCheck, roles: ['admin'] },
    ],
  },
]

export function canAccessNavigationItem(item: NavigationItem, role?: NavigationRole | null) {
  if (!item.roles || item.roles.length === 0) {
    return true
  }

  return Boolean(role && item.roles.includes(role))
}

export function getNavigationGroups(role?: NavigationRole | null) {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessNavigationItem(item, role)),
    }))
    .filter((group) => group.items.length > 0)
}

export function getMobileNavigation(role?: NavigationRole | null) {
  return getNavigationGroups(role)
    .flatMap((group) => group.items)
    .filter((item) => item.mobile)
    .slice(0, 5)
}

export function isNavigationItemActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  }

  if (href === '/finance') {
    return pathname === '/finance' || pathname === '/income' || pathname === '/expenses' || pathname.startsWith('/finance/') || pathname.startsWith('/income/') || pathname.startsWith('/expenses/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
