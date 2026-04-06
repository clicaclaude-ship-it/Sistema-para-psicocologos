# Progresso do Projeto — PsicoGest

**Última atualização:** 2026-04-06  
**Fase atual:** Fases 1, 2 e 3 COMPLETAS — Pronto para teste e deploy  

---

## Decisões Tomadas

| # | Decisão | Valor |
|---|---------|-------|
| 1 | Modelo de produto | **SaaS multi-tenant** |
| 2 | Tipo de usuário | **Psicólogos solos** — contas isoladas |
| 3 | Modelo de cobrança | **Assinatura mensal simples** (R$59/mês) |
| 4 | Dispositivos | **Ambos (desktop + mobile)** — responsividade crítica |
| 5 | Pagamento no MVP | **Adiado** — validar com Lilian primeiro |
| 6 | Stack técnica | **Next.js 16 + Supabase + Tailwind + shadcn/ui + Vercel** |

---

## Documentos do Projeto

| Arquivo | Descrição |
|---------|-----------|
| [.llm/prd.md](../.llm/prd.md) | PRD original |
| [superpowers/specs/2026-04-06-pep-psicologos-design.md](superpowers/specs/2026-04-06-pep-psicologos-design.md) | Spec completa aprovada |
| [superpowers/specs/2026-04-06-plano-implementacao.md](superpowers/specs/2026-04-06-plano-implementacao.md) | Plano de implementação |

---

## Status das Fases

### ✅ Fase 1 — Fundação + Prontuário (COMPLETA)
- Setup Next.js 16 + Supabase + Tailwind + shadcn/ui
- Schema SQL completo + políticas RLS (multi-tenant seguro)
- AppShell responsivo (sidebar desktop + bottom nav mobile)
- Autenticação (cadastro, login, recuperação de senha)
- Cadastro e busca de pacientes (LGPD-ready)
- Prontuário com 4 abas: Dados Gerais, Evolução Clínica, Avaliação Neuropsicológica, Documentos
- Upload de documentos (Supabase Storage)

### ✅ Fase 2 — Agenda + Dashboard (COMPLETA)
- Calendário react-big-calendar com visualizações Mensal/Semanal/Diário
- CRUD de consultas com modal
- Cores por tipo: consulta (azul), avaliação (roxo), devolutiva (verde), retorno (âmbar)
- Status: agendado → confirmado → realizado / cancelado / falta
- Dashboard com consultas reais do dia
- Link consulta ↔ prontuário
- Nova sessão pode vincular a uma consulta (e atualiza status automaticamente)

### ✅ Fase 3 — Qualidade e Venda (COMPLETA)
- Landing page profissional de vendas ("PsicoGest")
- Onboarding de 3 passos para novos usuários
- Políticas de Privacidade (LGPD) e Termos de Uso
- Página 404 amigável
- README completo com instruções de setup
- 15 rotas, build sem erros

---

## Como Rodar Localmente

```bash
# 1. Usar Node.js 20+
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 20

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com URL e chave do Supabase

# 4. Rodar o servidor de desenvolvimento
npm run dev
```

## Setup do Supabase

1. Criar projeto em supabase.com (escolher região São Paulo)
2. Executar o SQL em `supabase/migrations/001_initial_schema.sql` no SQL Editor
3. No Storage, criar bucket chamado `documents` (pode ser público)
4. Copiar URL e chave anon para `.env.local`

---

## Próximos Passos (Fase 4 — Monetização)

- Integração Stripe ou Asaas (assinatura mensal recorrente)
- Trial gratuito de 14 dias automatizado
- Bloqueio de acesso após vencimento
- E-mails transacionais (boas-vindas, lembrete de pagamento)

---

## Estrutura do Projeto

```
app/
├── (public)/           # Rotas públicas (landing, auth, legal)
├── (dashboard)/        # Área autenticada (protegida por middleware)
│   ├── dashboard/      # Dashboard com agenda do dia
│   ├── agenda/         # Calendário de consultas
│   ├── pacientes/      # Lista + prontuário
│   ├── onboarding/     # Primeiros passos para novos usuários
│   └── configuracoes/  # Perfil + segurança
components/
├── ui/                 # shadcn/ui components
├── app-shell.tsx       # Layout responsivo principal
├── session-form.tsx    # Formulário de evolução clínica
├── neuro-eval-form.tsx # Formulário de avaliação neuropsicológica
└── document-upload.tsx # Upload de documentos
lib/
├── supabase/           # Clients browser e server
├── validations/        # Schemas Zod
└── utils.ts            # Utilitários (calcAge, formatDate, etc.)
supabase/
└── migrations/         # Schema SQL + RLS
types/
└── database.ts         # Interfaces TypeScript
```
