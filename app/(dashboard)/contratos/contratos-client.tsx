'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CopiarLinkBtnProps {
  link: string
}

export function CopiarLinkBtn({ link }: CopiarLinkBtnProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <><Check className="w-3.5 h-3.5 text-green-600" />Copiado!</>
      ) : (
        <><Copy className="w-3.5 h-3.5" />Copiar link</>
      )}
    </Button>
  )
}
