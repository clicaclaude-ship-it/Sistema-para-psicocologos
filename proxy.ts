import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Always public — no auth needed
  const publicPaths = ['/', '/login', '/cadastro', '/recuperar-senha', '/privacidade', '/termos', '/planos', '/confirmar-email']
  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith('/assinar/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/stripe/') // Stripe webhook must be public

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Email not confirmed
    if (!user.email_confirmed_at && pathname !== '/confirmar-email') {
      return NextResponse.redirect(new URL('/confirmar-email', request.url))
    }

    // Redirect away from auth pages when already logged in
    if (user.email_confirmed_at && ['/login', '/cadastro'].includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check subscription status for dashboard routes only (not admin, not api, not public)
    const isDashboardRoute =
      !isPublicPath &&
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/api/') &&
      pathname !== '/confirmar-email'

    if (isDashboardRoute && user.email_confirmed_at) {
      try {
        // Use service role to bypass RLS and read subscription_status
        const admin = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
        const { data: psych } = await admin
          .from('psychologists')
          .select('subscription_status, trial_ends_at, is_admin')
          .eq('id', user.id)
          .single()

        // Admins always have access
        if (psych?.is_admin) return supabaseResponse

        const status = psych?.subscription_status ?? 'trialing'
        const trialEnds = psych?.trial_ends_at ? new Date(psych.trial_ends_at) : null
        const trialExpired = status === 'trialing' && trialEnds && trialEnds < new Date()
        const blocked = trialExpired || status === 'canceled' || status === 'unpaid'

        if (blocked && pathname !== '/planos') {
          return NextResponse.redirect(new URL('/planos', request.url))
        }
      } catch {
        // If check fails (e.g. env vars missing in dev), allow access
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
