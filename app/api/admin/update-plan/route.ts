import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Verify admin
  const admin = createAdminClient()
  const { data: psych } = await admin.from('psychologists').select('is_admin').eq('id', user.id).single()
  if (!psych?.is_admin) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id, subscription_status } = await req.json()
  if (!id || !subscription_status) return NextResponse.json({ error: 'Dados ausentes' }, { status: 400 })

  const plan = subscription_status === 'active' ? 'active' : subscription_status === 'trialing' ? 'trial' : 'suspended'

  await admin.from('psychologists').update({ subscription_status, plan }).eq('id', id)

  return NextResponse.json({ ok: true })
}
