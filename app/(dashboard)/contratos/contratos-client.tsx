'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Shield, Info, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Copiar link + Abrir contrato ────────────────────────────────────────────

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
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy} disabled={!link}>
        {copied ? (
          <><Check className="w-3.5 h-3.5 text-green-600" />Copiado!</>
        ) : (
          <><Copy className="w-3.5 h-3.5" />Copiar link</>
        )}
      </Button>
      {link && (
        <Button variant="default" size="sm" className="gap-1.5" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir contrato
          </a>
        </Button>
      )}
    </div>
  )
}

// ─── Gerar PDF ────────────────────────────────────────────────────────────────

export interface PdfContractData {
  title: string
  content: string
  signed_at: string
  signed_name: string | null
  signed_cpf: string | null
  signed_ip: string | null
  content_hash: string | null
  psychName: string
  psychCrp: string | null
  psychClinic: string | null
  patientName: string
}

export function gerarPdfContrato(data: PdfContractData) {
  const dt = new Date(data.signed_at).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${esc(data.title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; padding: 2cm; max-width: 21cm; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; }
  .header h2 { font-size: 14pt; font-weight: bold; }
  .header p { font-size: 11pt; margin-top: 3px; }
  .title { text-align: center; font-size: 15pt; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
  .subtitle { text-align: center; font-size: 11pt; color: #444; margin-bottom: 28px; }
  .content { white-space: pre-wrap; font-size: 12pt; line-height: 1.75; text-align: justify; margin-bottom: 48px; }
  .sig-block { border-top: 2px solid #000; padding-top: 20px; margin-top: 16px; }
  .sig-block h3 { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
  .sig-row { display: flex; gap: 8px; margin-bottom: 6px; font-size: 10.5pt; }
  .sig-label { font-weight: bold; min-width: 180px; color: #333; }
  .sig-value { flex: 1; word-break: break-all; }
  .sig-hash { font-family: 'Courier New', monospace; font-size: 9pt; }
  .legal { margin-top: 16px; padding: 10px 12px; border: 1px solid #bbb; font-size: 9.5pt; color: #555; line-height: 1.5; }
  .sign-line { margin-top: 48px; display: flex; justify-content: center; }
  .sign-line-inner { text-align: center; }
  .sign-line-inner .line { border-bottom: 1px solid #000; width: 280px; margin-bottom: 6px; }
  .sign-line-inner p { font-size: 11pt; }
  @media print { body { padding: 1.5cm; } }
</style>
</head>
<body>

<div class="header">
  <h2>${esc(data.psychName)}</h2>
  ${data.psychCrp ? `<p>CRP ${esc(data.psychCrp)}</p>` : ''}
  ${data.psychClinic ? `<p>${esc(data.psychClinic)}</p>` : ''}
</div>

<div class="title">${esc(data.title)}</div>
<div class="subtitle">Paciente: ${esc(data.patientName)}</div>

<div class="content">${esc(data.content)}</div>

<div class="sig-block">
  <h3>✅ Assinado Digitalmente</h3>
  <div class="sig-row"><span class="sig-label">Nome do signatário:</span><span class="sig-value">${esc(data.signed_name ?? '—')}</span></div>
  ${data.signed_cpf ? `<div class="sig-row"><span class="sig-label">CPF:</span><span class="sig-value">${esc(data.signed_cpf)}</span></div>` : ''}
  <div class="sig-row"><span class="sig-label">Data e hora:</span><span class="sig-value">${esc(dt)}</span></div>
  ${data.signed_ip ? `<div class="sig-row"><span class="sig-label">Endereço IP:</span><span class="sig-value">${esc(data.signed_ip)}</span></div>` : ''}
  ${data.content_hash ? `<div class="sig-row"><span class="sig-label">Hash SHA-256:</span><span class="sig-value sig-hash">${esc(data.content_hash)}</span></div>` : ''}
  <div class="legal">
    Assinatura eletrônica simples nos termos da <strong>Lei 14.063/2020</strong>.
    O hash SHA-256 garante a integridade do conteúdo do contrato no momento da assinatura.
    O endereço IP identifica o dispositivo utilizado para assinar.
  </div>
</div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=800')
  if (!win) {
    toast.error('Bloqueio de pop-up detectado. Permita pop-ups para gerar o PDF.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 600)
}

interface GerarPdfBtnProps {
  data: PdfContractData
  size?: 'sm' | 'default'
  variant?: 'outline' | 'default' | 'ghost'
  label?: string
}

export function GerarPdfBtn({ data, size = 'sm', variant = 'outline', label = 'Gerar PDF' }: GerarPdfBtnProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className="gap-1.5"
      onClick={() => gerarPdfContrato(data)}
    >
      <FileDown className="w-3.5 h-3.5" />
      {label}
    </Button>
  )
}

// ─── Comprovante de assinatura ────────────────────────────────────────────────

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
      <Button variant="ghost" size="sm" className="gap-1.5 text-[#6BAE8E]" onClick={() => setOpen(true)}>
        <Shield className="w-3.5 h-3.5" />
        Comprovante
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
              <Row label="Data/hora" value={dt(contract.signed_at)} />
              <Row label="Endereço IP" value={contract.signed_ip ?? 'Não capturado'} />
              <Row label="Hash SHA-256" value={contract.content_hash ?? 'Não disponível'} mono />
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-3">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>
                Assinatura eletrônica simples — Lei 14.063/2020. O hash SHA-256 garante
                que o conteúdo não foi alterado após a assinatura.
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
                  `Nome informado: ${contract.signed_name ?? '—'}`,
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
      <span className="text-muted-foreground font-medium min-w-[150px] shrink-0">{label}:</span>
      <span className={mono ? 'font-mono text-xs break-all' : 'break-words'}>{value}</span>
    </div>
  )
}
