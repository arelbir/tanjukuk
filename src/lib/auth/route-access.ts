import type { UserContext } from './roles'
import { can } from './permissions'

export interface RouteAccessResult {
  allowed: boolean
  reason?: string
}

const publicRoutes = ['/login', '/offline']
const adminRoutes = ['/admin']

export function canAccessRoute(user: UserContext | null | undefined, pathname: string): RouteAccessResult {
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return { allowed: true }
  }

  if (!user) {
    return { allowed: false, reason: 'Oturum bulunamadı' }
  }

  if (adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return can(user, 'admin:access') ? { allowed: true } : { allowed: false, reason: 'Yönetim ekranına erişim yetkiniz yok' }
  }

  if (pathname === '/clients' && user.role !== 'admin') {
    return { allowed: false, reason: 'Müvekkil listesine erişim yetkiniz yok' }
  }

  if (pathname.startsWith('/calendar') && user.role === 'finance') {
    return { allowed: false, reason: 'Finans rolü hukuki ajanda ekranını kullanamaz' }
  }

  return { allowed: true }
}

export function getDefaultRouteForRole(role?: string | null) {
  if (role === 'finance') return '/finance'
  return '/home'
}
