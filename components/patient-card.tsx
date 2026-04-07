import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Clock } from 'lucide-react'
import { calcAge, formatDate, truncate } from '@/lib/utils'
import type { Patient } from '@/types/database'

interface PatientCardProps {
  patient: Patient
  lastSessionDate?: string | null
}

export function PatientCard({ patient, lastSessionDate }: PatientCardProps) {
  const age = calcAge(patient.birth_date)

  return (
    <Link href={`/pacientes/${patient.id}`}>
      <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-border">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#4F7CAC]/10 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5 text-[#4F7CAC]" size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#1E2A38] truncate">
                  {patient.full_name}
                </p>
                {age !== null && (
                  <p className="text-xs text-muted-foreground">{age} anos</p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                patient.status === 'acompanhamento'
                  ? 'border-[#6BAE8E] text-[#6BAE8E] shrink-0'
                  : patient.status === 'avaliacao'
                  ? 'border-[#7B68C8] text-[#7B68C8] shrink-0'
                  : 'border-[#64748B] text-[#64748B] shrink-0'
              }
            >
              {patient.status === 'acompanhamento'
                ? 'Acompanhamento'
                : patient.status === 'avaliacao'
                ? 'Em Avaliação'
                : 'Alta'}
            </Badge>
          </div>

          {/* Main complaint */}
          {patient.main_complaint && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {truncate(patient.main_complaint, 100)}
            </p>
          )}

          {/* Last session */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border">
            <Clock className="w-3.5 h-3.5" />
            {lastSessionDate ? (
              <span>Última sessão: {formatDate(lastSessionDate)}</span>
            ) : (
              <span>Nenhuma sessão registrada</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
