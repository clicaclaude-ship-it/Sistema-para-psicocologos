import Link from 'next/link'
import { Brain, Home, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FB] to-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#4F7CAC] flex items-center justify-center mb-6">
        <Brain className="w-9 h-9 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-[#4F7CAC] mb-3">404</h1>
      <h2 className="text-2xl font-bold text-[#1E2A38] mb-3">Página não encontrada</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        A página que você está procurando não existe ou foi movida. Verifique o endereço ou
        volte para onde estava.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="bg-[#4F7CAC] hover:bg-[#3a6490] gap-2">
          <Link href="/dashboard">
            <LayoutDashboard className="w-4 h-4" />
            Ir para o Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Página inicial
          </Link>
        </Button>
      </div>
    </div>
  )
}
