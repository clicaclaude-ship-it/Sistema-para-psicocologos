'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Brain,
  Calendar,
  FileText,
  Shield,
  Smartphone,
  FolderOpen,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  Check,
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description:
      'Gerencie consultas com visualizações diária, semanal e mensal. Cores por tipo de atendimento.',
  },
  {
    icon: FileText,
    title: 'Prontuário Digital',
    description:
      'Registre evoluções clínicas com modelo estruturado (Queixa · Intervenção · Observações · Plano).',
  },
  {
    icon: Brain,
    title: 'Avaliação Neuropsicológica',
    description:
      'Registre testes, resultados e interpretações. Diferencial para neuropsicólogos.',
  },
  {
    icon: Shield,
    title: 'Segurança LGPD',
    description:
      'Dados criptografados, termo de consentimento digital, servidores no Brasil.',
  },
  {
    icon: Smartphone,
    title: 'Funciona no celular',
    description:
      'Interface responsiva para usar durante ou depois do atendimento, no celular ou computador.',
  },
  {
    icon: FolderOpen,
    title: 'Gestão de Documentos',
    description:
      'Anexe laudos, relatórios e protocolos. Tudo organizado no prontuário do paciente.',
  },
]

const pains = [
  {
    pain: 'Anotações em papel que se perdem',
    solution: 'Prontuário digital organizado, com busca rápida por qualquer paciente ou sessão.',
  },
  {
    pain: 'Planilhas sem segurança de dados',
    solution: 'Banco de dados criptografado, acesso protegido por senha e em conformidade total com a LGPD.',
  },
  {
    pain: 'Sem organização de avaliações neuropsicológicas',
    solution: 'Módulo dedicado para registrar testes, resultados e interpretações de cada paciente.',
  },
  {
    pain: 'WhatsApp como agenda profissional',
    solution: 'Agenda integrada ao prontuário: agende, confirme e registre a sessão em um único lugar.',
  },
]

const testimonials = [
  {
    name: 'Lilian S.',
    crp: 'CRP 06/XXXXX',
    initials: 'LS',
    color: '#4F7CAC',
    text: 'Finalmente um sistema feito para psicólogo. A aba de avaliação neuropsicológica é exatamente o que eu precisava. Uso todos os dias no consultório.',
  },
  {
    name: 'Carlos M.',
    crp: 'CRP 08/XXXXX',
    initials: 'CM',
    color: '#6BAE8E',
    text: 'Migrei do papel para o PsicoGest em uma semana. A agenda integrada com o prontuário salvou meu tempo e trouxe muito mais profissionalismo.',
  },
  {
    name: 'Fernanda R.',
    crp: 'CRP 04/XXXXX',
    initials: 'FR',
    color: '#7B68C8',
    text: 'Me sinto segura sabendo que os dados dos meus pacientes estão protegidos pela LGPD. O suporte também é excelente.',
  },
]

const planFeatures = [
  'Pacientes ilimitados',
  'Prontuário eletrônico completo',
  'Agenda integrada',
  'Avaliações neuropsicológicas',
  'Upload de documentos e laudos',
  'Conformidade LGPD',
  'Acesso pelo celular',
  'Suporte por e-mail',
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-white'
        } border-b border-border`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#4F7CAC] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[#1E2A38]">PsicoGest</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#why-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Por que nós?
            </a>
            <a href="#preco" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preço
            </a>
          </nav>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="bg-[#4F7CAC] hover:bg-[#3a6490]">
              <Link href="/cadastro">Começar grátis</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-3">
            <a href="#features" className="text-sm py-2 text-muted-foreground" onClick={() => setMenuOpen(false)}>
              Funcionalidades
            </a>
            <a href="#why-us" className="text-sm py-2 text-muted-foreground" onClick={() => setMenuOpen(false)}>
              Por que nós?
            </a>
            <a href="#preco" className="text-sm py-2 text-muted-foreground" onClick={() => setMenuOpen(false)}>
              Preço
            </a>
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="flex-1 bg-[#4F7CAC] hover:bg-[#3a6490]">
                <Link href="/cadastro">Começar grátis</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-[#F8F9FB] to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#4F7CAC]/10 text-[#4F7CAC] rounded-full px-4 py-1.5 text-sm font-medium">
              <span>✦</span>
              <span>Exclusivo para psicólogos</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1E2A38] leading-tight">
              Seu consultório organizado,{' '}
              <span className="text-[#4F7CAC]">sua mente tranquila</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Prontuário eletrônico, agenda e avaliações neuropsicológicas em um só sistema.
              Seguro, simples e em conformidade com a LGPD.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-[#4F7CAC] hover:bg-[#3a6490] gap-2">
                <Link href="/cadastro">
                  Começar gratuitamente
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">Ver como funciona</a>
              </Button>
            </div>
          </div>

          {/* Mock card */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
              <div className="bg-[#4F7CAC] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">PsicoGest</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1E2A38]">Ana Silva</p>
                    <p className="text-xs text-muted-foreground">32 anos · CID F41.1 (TAG)</p>
                  </div>
                  <span className="text-xs bg-[#6BAE8E]/15 text-[#6BAE8E] px-2 py-1 rounded-full font-medium">
                    Ativo
                  </span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-[#4F7CAC] uppercase tracking-wide mb-2">
                    Evolução Clínica — 05/04/2026
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p><span className="font-medium text-foreground">Queixa:</span> Ansiedade generalizada, insônia e dificuldade de concentração.</p>
                    <p><span className="font-medium text-foreground">Intervenção:</span> Técnicas de reestruturação cognitiva e psicoeducação.</p>
                    <p><span className="font-medium text-foreground">Plano:</span> Continuar TCC. Retorno em 7 dias.</p>
                  </div>
                </div>
                <div className="border-t pt-3 flex gap-2">
                  <div className="flex-1 bg-[#4F7CAC]/8 rounded-lg p-2.5 text-center">
                    <p className="text-xs font-semibold text-[#4F7CAC]">12</p>
                    <p className="text-xs text-muted-foreground">Sessões</p>
                  </div>
                  <div className="flex-1 bg-[#6BAE8E]/8 rounded-lg p-2.5 text-center">
                    <p className="text-xs font-semibold text-[#6BAE8E]">3</p>
                    <p className="text-xs text-muted-foreground">Avaliações</p>
                  </div>
                  <div className="flex-1 bg-[#7B68C8]/8 rounded-lg p-2.5 text-center">
                    <p className="text-xs font-semibold text-[#7B68C8]">5</p>
                    <p className="text-xs text-muted-foreground">Documentos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 px-4 sm:px-6" style={{ background: 'rgba(79,124,172,0.04)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '500+', label: 'Psicólogos' },
            { value: '15.000+', label: 'Prontuários' },
            { value: '100%', label: 'LGPD Compliant' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-[#4F7CAC]">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E2A38] mb-3">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ferramentas pensadas especificamente para a prática clínica do psicólogo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <Card key={f.title} className="border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-[#4F7CAC]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#4F7CAC]" />
                    </div>
                    <h3 className="font-semibold text-[#1E2A38]">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section id="why-us" className="py-20 px-4 sm:px-6 bg-[#F8F9FB]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E2A38] mb-3">Por que o PsicoGest?</h2>
            <p className="text-muted-foreground">
              Entendemos os desafios do psicólogo autônomo. Aqui está como ajudamos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pain column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-widest mb-4">
                O que você enfrenta hoje
              </h3>
              {pains.map((item) => (
                <div key={item.pain} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-border">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                  <p className="text-sm text-[#1E2A38]">{item.pain}</p>
                </div>
              ))}
            </div>
            {/* Solution column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#4F7CAC] uppercase text-xs tracking-widest mb-4">
                Como o PsicoGest resolve
              </h3>
              {pains.map((item) => (
                <div key={item.solution} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#4F7CAC]/20">
                  <div className="w-5 h-5 rounded-full bg-[#4F7CAC]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#4F7CAC]" />
                  </div>
                  <p className="text-sm text-[#1E2A38]">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E2A38] mb-3">
              Psicólogos que já usam o PsicoGest
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border border-border">
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1E2A38]">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.crp}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="preco" className="py-20 px-4 sm:px-6" style={{ background: 'rgba(79,124,172,0.04)' }}>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1E2A38] mb-3">Plano simples e transparente</h2>
          <p className="text-muted-foreground mb-10">Sem surpresas. Tudo incluso.</p>
          <Card className="border-2 border-[#4F7CAC] shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div>
                <p className="text-sm font-semibold text-[#4F7CAC] uppercase tracking-widest mb-1">
                  Plano Pro
                </p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold text-[#1E2A38]">R$ 59</span>
                  <span className="text-muted-foreground mb-1">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tudo que você precisa para organizar seu consultório
                </p>
              </div>
              <ul className="space-y-3 text-left">
                {planFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#6BAE8E] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="w-full bg-[#4F7CAC] hover:bg-[#3a6490]">
                <Link href="/cadastro">Começar 14 dias grátis</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Sem cartão de crédito. Cancele quando quiser.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #4F7CAC, #3a6490)' }}>
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Comece hoje mesmo</h2>
          <p className="text-white/80 text-lg">
            Junte-se a centenas de psicólogos que já organizam seus consultórios com o PsicoGest
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#4F7CAC] hover:bg-gray-50 font-semibold gap-2"
          >
            <Link href="/cadastro">
              Criar conta grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-10 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4F7CAC] flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#1E2A38]">PsicoGest</span>
              <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">
                — Prontuário eletrônico para psicólogos
              </span>
            </div>
            <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
              <a href="#preco" className="hover:text-foreground transition-colors">Preço</a>
              <Link href="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
              <Link href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            </nav>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© 2026 PsicoGest. Todos os direitos reservados.</span>
            <span>Dados armazenados no Brasil · Conforme LGPD</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
