import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'IP não disponível'
  )
}

export async function POST(req: NextRequest) {
  try {
    const { contractId, name, cpf } = await req.json()

    if (!contractId || !name?.trim()) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch contract to verify it exists and is not yet signed
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('id, content, signed_at')
      .eq('id', contractId)
      .single()

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })
    }

    if (contract.signed_at) {
      return NextResponse.json({ error: 'Contrato já foi assinado' }, { status: 409 })
    }

    // Generate SHA-256 hash of the contract content at signing time
    const contentHash = createHash('sha256').update(contract.content as string).digest('hex')

    const ip = getClientIp(req)
    const userAgent = req.headers.get('user-agent') ?? 'Não disponível'
    const signedAt = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        signed_at: signedAt,
        signed_name: name.trim(),
        signed_cpf: cpf?.trim() || null,
        signed_ip: ip,
        content_hash: contentHash,
        signed_user_agent: userAgent,
      })
      .eq('id', contractId)
      .is('signed_at', null) // Prevent double-signing race condition

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      signed_at: signedAt,
      content_hash: contentHash,
      signed_ip: ip,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
