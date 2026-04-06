import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Política de Privacidade — PsicoGest',
  description: 'Política de Privacidade e proteção de dados do PsicoGest conforme a LGPD.',
}

export default function PrivacidadePage() {
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
        <h1 className="text-3xl font-bold text-[#1E2A38] mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: 1º de abril de 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-[#374151]">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">1. Quem somos</h2>
            <p>
              O PsicoGest é um sistema de gestão clínica (SaaS) desenvolvido e operado por
              PsicoGest Tecnologia Ltda., com sede no Brasil. Nosso objetivo é fornecer
              ferramentas de prontuário eletrônico, agenda e avaliações neuropsicológicas
              exclusivamente para psicólogos autônomos e clínicas de psicologia.
            </p>
            <p>
              Para dúvidas sobre esta Política, entre em contato com nosso Encarregado de
              Proteção de Dados (DPO):{' '}
              <a href="mailto:privacidade@psicogest.com.br" className="text-[#4F7CAC] underline">
                privacidade@psicogest.com.br
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">2. Dados que coletamos</h2>
            <p>Coletamos dados em dois contextos distintos:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Dados do psicólogo (usuário):</strong> nome completo, e-mail, CRP,
                telefone, nome do consultório e informações de faturamento (quando aplicável).
              </li>
              <li>
                <strong>Dados dos pacientes:</strong> nome, data de nascimento, CPF, telefone,
                nome do responsável, queixa principal, histórico clínico, evoluções de sessão,
                avaliações neuropsicológicas e documentos anexados.
              </li>
              <li>
                <strong>Dados de uso:</strong> logs de acesso, endereços IP, tipo de navegador
                e interações com a plataforma — para fins de segurança e melhoria do serviço.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">3. Finalidade do tratamento</h2>
            <p>Os dados são tratados para as seguintes finalidades:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Prestação do serviço de prontuário eletrônico e agenda clínica.</li>
              <li>Autenticação e controle de acesso à plataforma.</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
              <li>Suporte técnico e atendimento ao usuário.</li>
              <li>Melhoria contínua dos recursos da plataforma (dados anonimizados).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">4. Base legal (LGPD)</h2>
            <p>
              O tratamento dos dados se fundamenta nas seguintes bases legais previstas na
              Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Execução de contrato</strong> (art. 7º, V): para prestação do serviço
                contratado pelo psicólogo.
              </li>
              <li>
                <strong>Consentimento</strong> (art. 7º, I): coletado diretamente dos pacientes
                no ato de cadastro, com registro de data e hora.
              </li>
              <li>
                <strong>Tutela da saúde</strong> (art. 11º, II, f): para o tratamento de dados
                sensíveis de saúde no contexto clínico.
              </li>
              <li>
                <strong>Legítimo interesse</strong> (art. 7º, IX): para fins de segurança e
                melhoria da plataforma.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">5. Segurança e armazenamento</h2>
            <p>
              Todos os dados são armazenados em servidores localizados no Brasil, utilizando
              infraestrutura do Supabase com criptografia em repouso (AES-256) e em trânsito
              (TLS 1.3). O acesso aos dados é restrito ao psicólogo titular da conta, garantido
              por meio de Row Level Security (RLS) no banco de dados.
            </p>
            <p>
              Realizamos backups automáticos diários e mantemos logs de auditoria de acessos
              por 90 dias.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">6. Compartilhamento de dados</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins
              comerciais. O compartilhamento é limitado a:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Prestadores de serviço essenciais:</strong> infraestrutura de nuvem
                (Supabase) e processamento de pagamentos — todos com acordos de proteção de dados.
              </li>
              <li>
                <strong>Autoridades legais:</strong> quando exigido por lei, ordem judicial ou
                regulamentação aplicável.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">
              7. Direitos do titular (LGPD art. 18)
            </h2>
            <p>
              Conforme a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Confirmação da existência de tratamento</li>
              <li>Acesso aos dados</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade</li>
              <li>Portabilidade dos dados a outro fornecedor</li>
              <li>Eliminação dos dados tratados com consentimento (direito ao esquecimento)</li>
              <li>Informação sobre compartilhamento de dados</li>
              <li>Revogação do consentimento a qualquer momento</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato com:{' '}
              <a href="mailto:privacidade@psicogest.com.br" className="text-[#4F7CAC] underline">
                privacidade@psicogest.com.br
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">8. Retenção de dados</h2>
            <p>
              Os dados são mantidos pelo período necessário para a prestação do serviço e pelo
              prazo mínimo exigido por lei. Após o encerramento da conta, os dados são excluídos
              em até 30 dias, salvo obrigação legal de retenção.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">9. Cookies</h2>
            <p>
              Utilizamos cookies estritamente necessários para autenticação e funcionamento da
              plataforma. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1E2A38]">10. Alterações nesta política</h2>
            <p>
              Esta Política pode ser atualizada periodicamente. Notificaremos os usuários sobre
              mudanças relevantes por e-mail com pelo menos 15 dias de antecedência.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t py-6 px-4 sm:px-6 text-center text-xs text-muted-foreground">
        © 2026 PsicoGest. Dados armazenados no Brasil · Conforme LGPD
      </footer>
    </div>
  )
}
