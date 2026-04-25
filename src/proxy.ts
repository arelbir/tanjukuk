import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/cases',
  '/calendar',
  '/clients',
  '/income',
  '/expenses',
  '/admin',
]

const adminRoutes = ['/admin']
const adminApiRoutes = ['/api/admin', '/api/seed']

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    }
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
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  if (adminApiRoutes.some((route) => path.startsWith(route))) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (path === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cases/:path*',
    '/calendar/:path*',
    '/clients/:path*',
    '/income/:path*',
    '/expenses/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/seed',
    '/login',
  ],
}
