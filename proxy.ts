import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Paths that are always public (no auth needed)
  const publicPaths = ['/', '/login', '/cadastro', '/recuperar-senha', '/privacidade', '/termos']
  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/assinar/') ||
    pathname.startsWith('/auth/')

  // Not logged in → redirect to login (except public paths)
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in but email not confirmed → redirect to confirm page
  if (user && !user.email_confirmed_at) {
    if (pathname !== '/confirmar-email') {
      return NextResponse.redirect(new URL('/confirmar-email', request.url))
    }
    return supabaseResponse
  }

  // Logged in + confirmed → redirect away from login/cadastro
  if (user && user.email_confirmed_at && ['/login', '/cadastro'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
