# Spec: Sistema PEP para Psicólogos

**Data:** 2026-04-06  
**Status:** Aprovado pelo usuário  
**Produto:** SaaS web — Prontuário Eletrônico do Paciente para psicólogos autônomos  
**Stack:** Next.js 14 (App Router) · Supabase · Tailwind CSS · shadcn/ui · Vercel  

---

## 1. Visão Geral

Sistema SaaS de Prontuário Eletrônico do Paciente (PEP) exclusivo para psicólogos autônomos brasileiros. Cada psicólogo tem uma conta isolada com seus próprios pacientes, agenda e prontuários. O sistema é responsivo (desktop + mobile), compliant com LGPD e arquitetado para escalar de validação com usuária piloto (Lilian) para produto comercial vendável.

### Problema que resolve
Psicólogos autônomos gerenciam pacientes em papel, planilhas ou Notion — sem segurança, sem busca eficiente, sem estrutura clínica. Não há ferramenta acessível e focada nas necessidades do psicólogo autônomo brasileiro.

### Diferenciais competitivos
1. **Avaliação Neuropsicológica estruturada** — campo raro no mercado
2. **LGPD nativa** — consentimento digital, criptografia, direito de exclusão
3. **Responsivo de verdade** — funciona bem no celular durante o atendimento
4. **Simplicidade clínica** — psicólogo não-técnico usa sem treinamento

---

## 2. Usuários e Contexto

| Atributo | Valor |
|----------|-------|
| Tipo de usuário | Psicólogo autônomo (pessoa física, CRP ativo) |
| Modelo de conta | Um psicólogo = uma conta = dados totalmente isolados |
| Multi-tenancy | Sim — Row Level Security no Supabase |
| Dispositivos | Desktop (consultório) + mobile (campo, anotações rápidas) |
| Usuária piloto | Lilian (especialista em neuropsicologia) |

---

## 3. Modelo de Negócio

- **Tipo:** SaaS B2C
- **Cobrança:** Assinatura mensal simples (valor a definir pós-validação)
- **MVP:** Sem cobrança automática — validar com Lilian primeiro
- **Fase 4:** Integração de pagamento (Stripe ou Asaas) + trial 14 dias
- **Captação:** Landing page pública + CTA de cadastro

---

## 4. Stack Técnica

### Frontend
- **Next.js 14** com App Router e Server Components
- **Tailwind CSS** para estilização utilitária
- **shadcn/ui** como biblioteca de componentes base
- **React Hook Form + Zod** para formulários com validação

### Backend / Infra
- **Supabase** (região São Paulo — AWS sa-east-1):
  - PostgreSQL com Row Level Security
  - Auth (email/senha + magic link)
  - Storage (uploads de documentos)
  - Edge Functions (jobs futuros: lembretes)
- **Vercel** para deploy do Next.js

### Segurança
- Multi-tenancy via RLS: `psychologist_id = auth.uid()` em todas as tabelas
- CPF e telefone criptografados com `pgcrypto` no banco
- HTTPS obrigatório (Vercel + Supabase)
- Backups automáticos diários (Supabase)
- Logs de acesso nativos (Supabase Auth logs)

---

## 5. Modelo de Dados

```sql
-- Psicólogos (espelho do Supabase Auth)
psychologists
  id              uuid PRIMARY KEY  -- = auth.uid()
  full_name       text NOT NULL
  crp             text              -- registro no Conselho Regional de Psicologia
  email           text NOT NULL
  phone           text
  clinic_name     text
  created_at      timestamptz DEFAULT now()

-- Pacientes
patients
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  psychologist_id uuid NOT NULL REFERENCES psychologists(id)
  full_name       text NOT NULL
  birth_date      date
  cpf             text              -- criptografado (pgcrypto)
  phone           text              -- criptografado (pgcrypto)
  guardian_name   text              -- responsável legal (menores)
  main_complaint  text
  brief_history   text
  status          text DEFAULT 'active'   -- active | inactive | archived
  consent_signed_at timestamptz           -- LGPD: data do consentimento
  created_at      timestamptz DEFAULT now()

-- Consultas / Agenda
appointments
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  psychologist_id uuid NOT NULL REFERENCES psychologists(id)
  patient_id      uuid NOT NULL REFERENCES patients(id)
  scheduled_at    timestamptz NOT NULL
  duration_min    int DEFAULT 50
  type            text DEFAULT 'consulta'  -- consulta | avaliacao | devolutiva | retorno
  status          text DEFAULT 'agendado'  -- agendado | confirmado | realizado | cancelado | falta
  notes           text
  created_at      timestamptz DEFAULT now()

-- Evoluções Clínicas (por sessão)
clinical_notes
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  psychologist_id uuid NOT NULL REFERENCES psychologists(id)
  patient_id      uuid NOT NULL REFERENCES patients(id)
  appointment_id  uuid REFERENCES appointments(id)  -- nullable
  session_date    date NOT NULL DEFAULT CURRENT_DATE
  complaint       text          -- queixa da sessão
  intervention    text          -- intervenção realizada
  observations    text          -- observações clínicas
  plan            text          -- plano para próxima sessão
  created_at      timestamptz DEFAULT now()

-- Avaliações Neuropsicológicas
neuro_evaluations
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  psychologist_id uuid NOT NULL REFERENCES psychologists(id)
  patient_id      uuid NOT NULL REFERENCES patients(id)
  test_name       text NOT NULL
  applied_at      date NOT NULL
  results         text
  interpretation  text
  created_at      timestamptz DEFAULT now()

-- Documentos e Uploads
documents
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  psychologist_id uuid NOT NULL REFERENCES psychologists(id)
  patient_id      uuid NOT NULL REFERENCES patients(id)
  name            text NOT NULL
  type            text DEFAULT 'outro'  -- laudo | relatorio | declaracao | protocolo | outro
  storage_path    text NOT NULL         -- path no Supabase Storage
  created_at      timestamptz DEFAULT now()
```

### Políticas RLS (exemplo para `patients`)
```sql
CREATE POLICY "psicólogo acessa só seus pacientes"
  ON patients FOR ALL
  USING (psychologist_id = auth.uid());
```
Mesma política aplicada em todas as tabelas.

---

## 6. Estrutura de Rotas (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx                    -- Landing page
│   ├── login/page.tsx
│   ├── cadastro/page.tsx
│   └── recuperar-senha/page.tsx
│
└── (dashboard)/
    ├── layout.tsx                  -- AppShell (sidebar + bottom nav)
    ├── dashboard/page.tsx
    ├── agenda/
    │   ├── page.tsx                -- Calendário
    │   └── [appointmentId]/page.tsx
    ├── pacientes/
    │   ├── page.tsx                -- Lista + busca
    │   ├── novo/page.tsx
    │   └── [patientId]/
    │       ├── page.tsx            -- Prontuário (4 abas)
    │       ├── editar/page.tsx
    │       └── sessoes/nova/page.tsx
    └── configuracoes/page.tsx
```

---

## 7. Telas e Funcionalidades

### 7.1 Autenticação
- Cadastro: nome, CRP, email, senha (+ confirmação)
- Login: email + senha
- Recuperação de senha via email
- Após login: redireciona para Dashboard

### 7.2 Dashboard
- Agenda do dia (lista de consultas com horário, paciente e tipo)
- Alertas: pacientes sem sessão há mais de 30 dias, avaliações neuropsicológicas iniciadas não concluídas
- Acesso rápido: últimos 5 pacientes acessados
- Contador: total de pacientes ativos, consultas da semana

### 7.3 Agenda
- Visualizações: mensal · semanal · diária (seleção via toggle)
- Cores por tipo: consulta (azul) · avaliação (roxo) · devolutiva (verde) · retorno (âmbar)
- Criar consulta: selecionar paciente, data/hora, tipo, duração, observações
- Editar/cancelar consulta com confirmação
- Clicar em consulta → acesso direto ao prontuário do paciente
- Mobile: visualização diária é padrão (mais legível)

### 7.4 Lista de Pacientes
- Busca em tempo real por nome, CPF ou telefone
- Filtros: ativos / inativos / todos
- Card por paciente: nome, idade, última sessão, status
- Botão "+" flutuante para novo paciente (mobile)

### 7.5 Cadastro de Paciente
- Campos: nome completo, data de nascimento, CPF (opcional), telefone, responsável (se menor), queixa principal, histórico breve
- Termo de consentimento LGPD: checkbox obrigatório + data registrada automaticamente
- Validação de CPF (formato, não unicidade)

### 7.6 Prontuário (4 abas)

**Aba: Dados Gerais**
- Todos os dados cadastrais
- Botão editar dados
- Badge de consentimento LGPD com data
- Histórico de consultas (lista resumida) — exibido apenas após Fase 2; na Fase 1 mostra "Agenda em breve"

**Aba: Evolução Clínica**
- Lista de sessões em ordem cronológica reversa
- Cada sessão: data, campos Queixa / Intervenção / Observações / Plano
- Botão "Nova Sessão" abre formulário inline ou modal
- Sessão vinculável a uma consulta agendada
- Campos expansíveis (textarea com altura automática)

**Aba: Avaliação Neuropsicológica**
- Lista de testes aplicados
- Cada registro: nome do teste, data de aplicação, resultados, interpretação clínica
- Botão "Adicionar Teste"
- Upload de protocolo (PDF/imagem) vinculado ao registro

**Aba: Documentos**
- Grid de arquivos enviados
- Upload drag-and-drop (PDF, DOCX, PNG, JPG — máx 10MB por arquivo)
- Tipos: laudo, relatório, declaração, protocolo, outro
- Preview inline para PDFs e imagens
- Download e exclusão

### 7.7 Configurações
- Dados do psicólogo: nome, CRP, telefone, nome do consultório
- Alteração de email e senha
- Opção de exclusão de conta (LGPD — apaga todos os dados)

---

## 8. Identidade Visual

### Paleta
| Papel | Hex | Uso |
|-------|-----|-----|
| Primária | `#4F7CAC` | Botões, links, nav ativa |
| Secundária | `#6BAE8E` | Confirmações, "realizado" |
| Alerta | `#E8A838` | Pendências, "agendado" |
| Perigo | `#D95555` | Cancelamentos, exclusões |
| Fundo | `#F8F9FB` | Background |
| Superfície | `#FFFFFF` | Cards, modais |
| Texto | `#1E2A38` | Títulos e corpo |

### Tipografia
- **Inter** (Google Fonts)
- Títulos: `font-semibold` (600)
- Corpo: `font-normal` (400)
- Labels: `font-medium` (500)

### Responsividade
- Breakpoint principal: `768px` (md)
- `< 768px`: bottom nav, formulários 1 coluna, tabelas → cards, botão "+" flutuante
- `>= 768px`: sidebar, formulários 2 colunas, tabelas completas
- Campos de texto com `min-h-[100px]` para digitação confortável no mobile

---

## 9. Componentes Principais

| Componente | Responsabilidade |
|------------|-----------------|
| `AppShell` | Layout raiz: sidebar (desktop) + bottom nav (mobile) |
| `AppointmentCard` | Card de consulta na agenda (cor por tipo, status) |
| `PatientCard` | Card compacto na lista de pacientes |
| `ProntuarioTabs` | Container das 4 abas do prontuário |
| `SessionForm` | Formulário de evolução clínica (inline ou modal) |
| `NeuroEvalForm` | Formulário de avaliação neuropsicológica |
| `DocumentUpload` | Drag-and-drop de arquivos com preview |
| `ConsentBadge` | Badge LGPD com data de assinatura |
| `AlertBanner` | Banner de alertas no dashboard |
| `CalendarView` | Calendário com 3 visualizações — baseado em `react-big-calendar` ou `@fullcalendar/react` (decidir na Fase 2) |

---

## 10. Fases de Desenvolvimento

### Fase 1 — Fundação + Prontuário (~3 semanas)
**Entrega:** Lilian consegue substituir papel/Notion completamente

- [ ] Setup projeto (Next.js + Supabase + Tailwind + shadcn)
- [ ] Schema do banco + políticas RLS
- [ ] Autenticação completa (cadastro, login, recuperação)
- [ ] Cadastro e busca de pacientes
- [ ] Prontuário: Dados Gerais + Evolução Clínica
- [ ] Prontuário: Avaliação Neuropsicológica
- [ ] Prontuário: Upload de Documentos
- [ ] Responsividade mobile de todas as telas acima

### Fase 2 — Agenda (~1,5 semana)
**Entrega:** Lilian abandona o Google Agenda

- [ ] Calendário com 3 visualizações
- [ ] CRUD de consultas
- [ ] Cores por tipo de atendimento
- [ ] Status de consulta
- [ ] Dashboard com agenda do dia e alertas
- [ ] Link consulta ↔ prontuário

### Fase 3 — Qualidade e Venda (~1 semana)
**Entrega:** Produto pronto para apresentar e vender

- [ ] Onboarding (tela de boas-vindas para novos usuários)
- [ ] Landing page pública (apresentação + CTA)
- [ ] Fluxo completo de cadastro de novo psicólogo
- [ ] Configurações de perfil
- [ ] Testes com Lilian + ciclo de feedback
- [ ] Ajustes de polimento mobile

### Fase 4 — Monetização (pós-validação)
**Entrega:** SaaS gerando receita

- [ ] Integração Stripe ou Asaas (assinatura mensal recorrente)
- [ ] Trial gratuito de 14 dias
- [ ] Página de planos e cobrança
- [ ] Bloqueio de acesso após vencimento
- [ ] E-mails transacionais (boas-vindas, lembrete de pagamento, cancelamento)

---

## 11. Requisitos LGPD

| Requisito | Implementação |
|-----------|--------------|
| Consentimento | Checkbox obrigatório no cadastro do paciente, data registrada |
| Criptografia em repouso | Supabase (AES-256) + pgcrypto para CPF/telefone |
| Criptografia em trânsito | HTTPS obrigatório (Vercel + Supabase) |
| Controle de acesso | RLS garante isolamento entre psicólogos |
| Backup | Automático diário pelo Supabase |
| Logs de acesso | Auth logs nativos do Supabase |
| Direito de exclusão | Opção "Excluir conta" nas configurações (apaga todos os dados) |
| Localização dos dados | Supabase região São Paulo (AWS sa-east-1) |

---

## 12. Fora do Escopo (MVP)

- Lembretes automáticos por WhatsApp
- Integração com PIX / pagamento automático
- Relatórios e gráficos de evolução
- Emissão automática de laudos/recibos
- Múltiplos usuários por conta (clínicas)
- App nativo (iOS/Android)
- Prontuário compartilhado entre psicólogos
