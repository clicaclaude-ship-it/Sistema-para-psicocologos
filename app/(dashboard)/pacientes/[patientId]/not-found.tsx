import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

export default function PatientNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Users className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold">Paciente não encontrado</h2>
        <p className="text-muted-foreground text-sm mt-1">
          O paciente solicitado não existe ou você não tem permissão para acessá-lo.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/pacientes">Voltar para pacientes</Link>
      </Button>
    </div>
  )
}
