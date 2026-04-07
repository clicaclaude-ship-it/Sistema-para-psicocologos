'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Shield, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CopiarLinkBtnProps {
  token: string
}

export function CopiarLinkBtn({ token }: CopiarLinkBtnProps) {
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLink(`${window.location.origin}/assinar/${token}`)
  }, [token])

  function handleCopy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleCopy}
        disabled={!link}
      >
        {copied ? (
          <><Check className="w-3.5 h-3.5 text-green-600" />Copiado!</>
        ) : (
          <><Copy className="w-3.5 h-3.5" />Copiar link</>
        )}
      </Button>
      {link && (
        <Button
          variant="default"
          size="sm"
          className="gap-1.5"
          asChild
        >
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir contrato
          </a>
        </Button>
      )}
    </div>
  )
}

interface ComprovanteProps {
  contract: {
    title: string
    signed_at: string
    signed_name: string | null
    signed_cpf: string | null
    signed_ip: string | null
    content_hash: string | null
    signed_user_agent: string | null
    created_at: string
    patients: { full_name: string } | null
  }
}

export function ComprovanteBtn({ contract }: ComprovanteProps) {
  const [open, setOpen] = useState(false)

  const dt = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-[#6BAE8E]"
        onClick={() => setOpen(true)}
      >
        <Shield className="w-3.5 h-3.5" />
        Ver comprovante
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#6BAE8E]" />
              Comprovante de Assinatura Digital
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="bg-[#6BAE8E]/10 border border-[#6BAE8E]/30 rounded-lg p-3">
              <p className="font-semibold text-[#1E2A38] mb-1">✅ Contrato assinado digitalmente</p>
              <p className="text-muted-foreground text-xs">
                Este documento foi aceito e assinado com os dados registrados abaixo.
              </p>
            </div>

            <div className="space-y-2 rounded-lg border border-border p-4">
              <Row label="Contrato" value={contract.title} />
              <Row label="Paciente" value={contract.patients?.full_name ?? '—'} />
              <Row label="Nome informado" value={contract.signed_name ?? '—'} />
              <Row label="CPF informado" value={contract.signed_cpf ?? 'Não informado'} />
              <Row label="Data/hora da assinatura" value={dt(contract.signed_at)} />
              <Row label="Endereço IP" value={contract.signed_ip ?? 'Não capturado'} />
              <Row label="Hash SHA-256 do documento" value={contract.content_hash ?? 'Não disponível'} mono />
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-3">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>
                Este comprovante constitui prova de assinatura eletrônica simples nos termos da
                Lei 14.063/2020. O hash SHA-256 garante que o conteúdo do contrato não foi alterado
                após a assinatura. O IP registrado identifica o dispositivo usado no momento da assinatura.
              </p>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                const lines = [
                  'COMPROVANTE DE ASSINATURA DIGITAL',
                  '─'.repeat(50),
                  `Contrato: ${contract.title}`,
                  `Paciente: ${contract.patients?.full_name ?? '—'}`,
                  `Nome informado pelo signatário: ${contract.signed_name ?? '—'}`,
                  `CPF informado: ${contract.signed_cpf ?? 'Não informado'}`,
                  `Data/hora: ${dt(contract.signed_at)}`,
                  `Endereço IP: ${contract.signed_ip ?? 'Não capturado'}`,
                  `Hash SHA-256: ${contract.content_hash ?? 'Não disponível'}`,
                  '─'.repeat(50),
                  'Assinatura eletrônica simples — Lei 14.063/2020',
                ]
                const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `comprovante_${contract.signed_name?.replace(/\s+/g, '_') ?? 'assinatura'}.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Baixar comprovante (.txt)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="text-muted-foreground font-medium min-w-[160px] shrink-0">{label}:</span>
      <span className={mono ? 'font-mono text-xs break-all' : 'break-words'}>{value}</span>
    </div>
  )
}
