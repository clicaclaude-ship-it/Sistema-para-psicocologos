import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Pagamento não configurado. Contate o suporte.' }, { status: 503 })
    }
    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json({ error: 'Plano não configurado. Contate o suporte.' }, { status: 503 })
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Configuração incompleta. Contate o suporte.' }, { status: 503 })
    }

    const stripe = getStripe()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createAdminClient()
    const { data: psych } = await admin
      .from('psychologists')
      .select('full_name, email, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!psych) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

    // Create or reuse Stripe customer
    let customerId = psych.stripe_customer_id as string | null
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: psych.full_name,
        email: psych.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await admin.from('psychologists').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/dashboard?pagamento=sucesso`,
      cancel_url: `${origin}/planos?pagamento=cancelado`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
        trial_end: Math.floor(Date.now() / 1000),
      },
      allow_promotion_codes: true,
      locale: 'pt-BR',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado'
    console.error('[stripe/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
