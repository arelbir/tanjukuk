import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.generated'

const protectedRoutes = [
  '/admin',
  '/home',
  '/calendar',
  '/clients',
  '/files',
  '/documents',
  '/finance',
  '/notifications',
  '/more',
  '/cases',
  '/enforcements',
  '/dashboard',
]

const adminRoutes = ['/admin']
const adminApiRoutes = ['/api/admin', '/api/seed']

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    (process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set(name, '')
          response.cookies.set(name, '', options)
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (adminRoutes.some((route) => path.startsWith(route))) {
      const { data: userData } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin' || !userData.is_active) {
        return NextResponse.redirect(new URL('/home', request.url))
      }
    }
  }

  if (adminApiRoutes.some((route) => path.startsWith(route))) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin' || !userData.is_active) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/home/:path*',
    '/calendar/:path*',
    '/clients/:path*',
    '/files/:path*',
    '/documents/:path*',
    '/finance/:path*',
    '/notifications/:path*',
    '/more/:path*',
    '/cases/:path*',
    '/enforcements/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/seed',
    '/login',
  ],
}
