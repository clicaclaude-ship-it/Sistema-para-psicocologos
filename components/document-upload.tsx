'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Upload,
  File,
  Download,
  Trash2,
  Loader2,
  FileText,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/types/database'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]
const ALLOWED_EXTENSIONS = '.pdf,.docx,.png,.jpg,.jpeg'

const DOC_TYPE_LABELS: Record<Document['type'], string> = {
  laudo: 'Laudo',
  relatorio: 'Relatório',
  declaracao: 'Declaração',
  protocolo: 'Protocolo',
  outro: 'Outro',
}

interface DocumentUploadProps {
  patientId: string
  documents: Document[]
}

export function DocumentUpload({ patientId, documents }: DocumentUploadProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [docType, setDocType] = useState<Document['type']>('outro')
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) await uploadFile(file)
    },
    [docType, patientId]
  )

  async function uploadFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado', {
        description: 'Aceito: PDF, DOCX, PNG, JPG',
      })
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('Arquivo muito grande', { description: 'Tamanho máximo: 10MB' })
      return
    }

    setUploading(true)
    setUploadProgress(10)
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      toast.error('Usuário não autenticado')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop()
    const path = `${userData.user.id}/${patientId}/${Date.now()}.${ext}`

    setUploadProgress(30)

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: false })

    setUploadProgress(70)

    if (uploadError) {
      toast.error('Erro no upload', { description: uploadError.message })
      setUploading(false)
      setUploadProgress(0)
      return
    }

    const { error: dbError } = await supabase.from('documents').insert({
      psychologist_id: userData.user.id,
      patient_id: patientId,
      name: file.name,
      type: docType,
      storage_path: path,
      file_size: file.size,
      mime_type: file.type,
    })

    setUploadProgress(100)

    if (dbError) {
      toast.error('Erro ao registrar documento', { description: dbError.message })
    } else {
      toast.success('Documento enviado com sucesso!')
      router.refresh()
    }

    setUploading(false)
    setUploadProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDownload(doc: Document) {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60)

    if (error || !data) {
      toast.error('Erro ao gerar link de download')
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    const supabase = createClient()

    await supabase.storage.from('documents').remove([deleteTarget.storage_path])

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erro ao excluir documento')
    } else {
      toast.success('Documento excluído')
      router.refresh()
    }

    setDeleting(false)
    setDeleteTarget(null)
  }

  function formatSize(bytes: number | null): string {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Type selector + upload zone */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="space-y-1 flex-1">
            <label className="text-sm font-medium">Tipo do documento</label>
            <Select
              value={docType}
              onValueChange={(v) => setDocType(v as Document['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragging
              ? 'border-[#4F7CAC] bg-[#4F7CAC]/5'
              : 'border-muted-foreground/25 hover:border-[#4F7CAC]/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ALLOWED_EXTENSIONS}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadFile(file)
            }}
          />
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#4F7CAC]" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
              <div className="w-full bg-muted rounded-full h-1.5 max-w-xs mx-auto">
                <div
                  className="bg-[#4F7CAC] h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">
                Arraste um arquivo ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, PNG, JPG — máximo 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Documents list */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-25" />
          Nenhum documento anexado.
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-[#4F7CAC]/10 flex items-center justify-center shrink-0">
                <File className="w-4 h-4 text-[#4F7CAC]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs py-0">
                    {DOC_TYPE_LABELS[doc.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatSize(doc.file_size)} · {formatDate(doc.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDownload(doc)}
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(doc)}
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir documento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{' '}
              <span className="font-medium">{deleteTarget?.name}</span>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
