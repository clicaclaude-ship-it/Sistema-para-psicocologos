'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PatientCard } from '@/components/patient-card'
import type { Patient } from '@/types/database'
import { useDebounce } from '@/lib/hooks/use-debounce'

type StatusFilter = 'all' | 'acompanhamento' | 'avaliacao' | 'alta'

interface PatientsClientProps {
  patients: Patient[]
  lastSessionMap: Record<string, string>
}

export function PatientsClient({ patients, lastSessionMap }: PatientsClientProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const debouncedSearch = useDebounce(search, 300)

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false

      if (!debouncedSearch) return true

      const q = debouncedSearch.toLowerCase()
      return (
        p.full_name.toLowerCase().includes(q) ||
        (p.cpf ?? '').replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        (p.phone ?? '').replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      )
    })
  }, [patients, debouncedSearch, statusFilter])

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'acompanhamento', label: 'Acompanhamento' },
    { value: 'avaliacao', label: 'Em Avaliação' },
    { value: 'alta', label: 'Alta' },
  ]

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2A38]">Pacientes</h1>
          <p className="text-sm text-muted-foreground">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado
            {patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild className="hidden sm:flex">
          <Link href="/pacientes/novo">
            <Plus className="w-4 h-4 mr-1" />
            Novo paciente
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, CPF ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-muted rounded-lg w-fit">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px] ${
                statusFilter === opt.value
                  ? 'bg-white text-[#1E2A38] shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patient grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-25" />
          {patients.length === 0 ? (
            <div className="space-y-2">
              <p className="font-medium">Nenhum paciente cadastrado.</p>
              <p className="text-sm">Adicione seu primeiro paciente!</p>
              <Button asChild className="mt-3">
                <Link href="/pacientes/novo">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar paciente
                </Link>
              </Button>
            </div>
          ) : (
            <p>Nenhum paciente encontrado para os filtros selecionados.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              lastSessionDate={lastSessionMap[patient.id] ?? null}
            />
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/pacientes/novo"
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#4F7CAC] rounded-full flex items-center justify-center shadow-lg text-white hover:bg-[#3a6290] transition-colors z-10"
        aria-label="Novo paciente"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}
