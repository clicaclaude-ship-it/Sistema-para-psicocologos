import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// Stripe requires raw body for signature verification
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function syncSubscription(sub: any) {
    const userId = sub.metadata?.supabase_user_id
    if (!userId) return

    const status = sub.status // active | past_due | canceled | unpaid | trialing
    const plan = status === 'active' ? 'active' : status === 'trialing' ? 'trial' : 'suspended'
    const lastInvoice = sub.latest_invoice ?? null

    await admin.from('psychologists').update({
      stripe_subscription_id: sub.id,
      subscription_status: status,
      plan,
      last_payment_at: lastInvoice?.status === 'paid' && lastInvoice.created
        ? new Date(lastInvoice.created * 1000).toISOString()
        : undefined,
      next_payment_at: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : undefined,
    }).eq('id', userId)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = event.data.object as any

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(obj)
      break

    case 'invoice.payment_succeeded': {
      const subId = typeof obj.subscription === 'string' ? obj.subscription : obj.subscription?.id
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId, { expand: ['latest_invoice'] })
        await syncSubscription(sub)
      }
      break
    }

    case 'invoice.payment_failed': {
      const subId = typeof obj.subscription === 'string' ? obj.subscription : obj.subscription?.id
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = (sub as any).metadata?.supabase_user_id
        if (userId) {
          await admin.from('psychologists').update({
            subscription_status: 'past_due',
            plan: 'suspended',
          }).eq('id', userId)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
