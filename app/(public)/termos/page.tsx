import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Termos de Uso — PsicoGest',
  description: 'Termos e condições de uso do PsicoGest — sistema de prontuário eletrônico para psicólogos.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#4F7CAC] flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1E2A38]">PsicoGest</span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1E2A38] mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: 1º de abril de 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-[#374151]">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta e utilizar o PsicoGest, você concorda com estes Termos de Uso
              e com nossa Política de Privacidade. Se não concordar com algum dos termos, não
              utilize o serviço.
            </p>
            <p>
              Estes Termos regulam a relação entre PsicoGest Tecnologia Ltda. (&ldquo;PsicoGest&rdquo;,
              &ldquo;nós&rdquo;) e o psicólogo usuário da plataforma (&ldquo;você&rdquo;, &ldquo;usuário&rdquo;).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">2. Descrição do serviço</h2>
            <p>
              O PsicoGest é uma plataforma SaaS (Software as a Service) de gestão clínica
              desenvolvida exclusivamente para psicólogos. O serviço inclui:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Prontuário eletrônico digital com registro de evoluções clínicas</li>
              <li>Agenda de consultas integrada ao prontuário</li>
              <li>Módulo de avaliações neuropsicológicas</li>
              <li>Gestão e armazenamento de documentos clínicos</li>
              <li>Cadastro de pacientes com termo de consentimento digital (LGPD)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">3. Elegibilidade</h2>
            <p>
              O PsicoGest é destinado exclusivamente a psicólogos com registro ativo no
              Conselho Regional de Psicologia (CRP). Ao utilizar o serviço, você declara:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Possuir registro ativo no CRP de seu estado.</li>
              <li>Ter capacidade legal para celebrar contratos no Brasil.</li>
              <li>Utilizar o sistema dentro dos limites éticos estabelecidos pelo CFP.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">4. Conta e segurança</h2>
            <p>
              Você é responsável por manter a confidencialidade de suas credenciais de acesso.
              Qualquer atividade realizada com sua conta é de sua responsabilidade. Notifique
              imediatamente o PsicoGest em caso de acesso não autorizado.
            </p>
            <p>
              Não é permitida a criação de múltiplas contas para o mesmo profissional, nem o
              compartilhamento de credenciais entre diferentes profissionais.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">5. Uso aceitável</h2>
            <p>É proibido utilizar o PsicoGest para:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Armazenar dados de pacientes sem o devido consentimento conforme a LGPD.</li>
              <li>Praticar atos que violem o Código de Ética Profissional do Psicólogo.</li>
              <li>Realizar engenharia reversa, scraping ou extração automatizada de dados.</li>
              <li>Transmitir vírus, malware ou código malicioso.</li>
              <li>Utilizar o serviço para fins ilegais ou não autorizados.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">6. Planos e pagamento</h2>
            <p>
              O PsicoGest oferece um período de teste gratuito de 14 dias, sem necessidade de
              cartão de crédito. Após o período de teste, a continuidade do serviço está sujeita
              à assinatura de um plano pago.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Cobrança:</strong> as assinaturas são cobradas mensalmente, com renovação
                automática no mesmo dia do mês da adesão.
              </li>
              <li>
                <strong>Reembolso:</strong> não realizamos reembolsos de períodos já cobrados,
                exceto nos casos previstos no Código de Defesa do Consumidor.
              </li>
              <li>
                <strong>Alteração de preços:</strong> os preços podem ser alterados com aviso
                prévio de 30 dias por e-mail.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">7. Cancelamento</h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento diretamente nas
              Configurações da plataforma. O cancelamento tem efeito ao fim do ciclo de
              faturamento corrente, mantendo acesso até a data de vencimento já paga.
            </p>
            <p>
              Após o cancelamento, os dados ficam disponíveis para exportação por 30 dias.
              Após esse prazo, são excluídos permanentemente dos nossos servidores.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">8. Responsabilidades do usuário</h2>
            <p>
              O psicólogo é o único responsável pelo conteúdo inserido no sistema, incluindo
              registros clínicos, evoluções e documentos. O PsicoGest atua como controlador de
              dados apenas em relação às informações de conta do profissional; em relação aos
              dados de pacientes, o psicólogo é o controlador responsável perante a LGPD.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">9. Limitação de responsabilidade</h2>
            <p>
              O PsicoGest é fornecido &ldquo;como está&rdquo;, sem garantias de disponibilidade
              ininterrupta. Nos esforçamos para manter 99,5% de uptime mensal, mas não nos
              responsabilizamos por perdas decorrentes de interrupções do serviço, exceto nos
              casos de negligência comprovada.
            </p>
            <p>
              Em nenhuma hipótese nossa responsabilidade excederá o valor pago pelo usuário
              nos 3 meses anteriores ao evento que gerou o dano.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">10. Propriedade intelectual</h2>
            <p>
              O PsicoGest e todos os seus componentes (software, design, marca, conteúdo) são
              propriedade exclusiva de PsicoGest Tecnologia Ltda. Os dados inseridos pelo
              usuário permanecem de sua propriedade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">11. Alterações nos termos</h2>
            <p>
              Estes Termos podem ser atualizados. Notificaremos os usuários por e-mail com
              pelo menos 15 dias de antecedência sobre mudanças relevantes. O uso continuado
              do serviço após a vigência das alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">12. Foro e legislação</h2>
            <p>
              Estes Termos são regidos pela legislação brasileira. Eventuais disputas serão
              submetidas ao foro da comarca de São Paulo — SP, com renúncia expressa a qualquer
              outro, por mais privilegiado que seja.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">13. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos, entre em contato:{' '}
              <a href="mailto:contato@psicogest.com.br" className="text-[#4F7CAC] underline">
                contato@psicogest.com.br
              </a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t py-6 px-4 sm:px-6 text-center text-xs text-muted-foreground">
        © 2026 PsicoGest. Todos os direitos reservados.
      </footer>
    </div>
  )
}
