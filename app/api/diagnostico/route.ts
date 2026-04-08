import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rota temporária de diagnóstico — remove depois de confirmar as variáveis
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const vars = {
    STRIPE_SECRET_KEY:        !!process.env.STRIPE_SECRET_KEY,
    STRIPE_PRICE_ID:          !!process.env.STRIPE_PRICE_ID,
    STRIPE_WEBHOOK_SECRET:    !!process.env.STRIPE_WEBHOOK_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL:     !!process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  // Preview values (first 8 chars only, safe)
  const previews: Record<string, string> = {}
  if (process.env.STRIPE_SECRET_KEY)
    previews.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY.slice(0, 8) + '...'
  if (process.env.STRIPE_PRICE_ID)
    previews.STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID
  if (process.env.NEXT_PUBLIC_SITE_URL)
    previews.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

  const allOk = Object.values(vars).every(Boolean)

  return NextResponse.json({ allOk, vars, previews }, { status: 200 })
}
