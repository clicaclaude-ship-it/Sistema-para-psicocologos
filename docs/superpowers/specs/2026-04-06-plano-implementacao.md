# Plano de Implementação — Sistema PEP para Psicólogos

**Data:** 2026-04-06  
**Goal:** Sistema SaaS de prontuário eletrônico totalmente funcional  
**Timeline:** ~6 semanas (4 fases)  
**Stack:** Next.js 14 · Supabase · Tailwind · shadcn/ui · Vercel  

---

## Milestones

| # | Milestone | Critério de sucesso |
|---|-----------|---------------------|
| 1 | Fase 1 completa | Lilian consegue cadastrar paciente, registrar sessão e consultar prontuário |
| 2 | Fase 2 completa | Lilian abandona o Google Agenda |
| 3 | Fase 3 completa | Sistema publicado online, onboarding funcional, landing page no ar |
| 4 | Fase 4 completa | Primeiro pagamento processado automaticamente |

---

## Fase 1 — Fundação + Prontuário

| Task | Esforço | Depende de | Critério de conclusão |
|------|---------|------------|----------------------|
| Setup Next.js + Tailwind + shadcn | 3h | — | `npm run dev` funcionando, shadcn configurado |
| Configurar Supabase client (server + browser) | 2h | Setup | Auth e DB acessíveis localmente |
| Schema SQL + migrações + RLS | 3h | Supabase | Todas as tabelas criadas com políticas RLS |
| AppShell responsivo (sidebar + bottom nav) | 4h | Setup | Layout funciona em 375px e 1280px |
| Telas de autenticação (login, cadastro, recuperação) | 4h | Supabase Auth | Psicólogo consegue criar conta e logar |
| Middleware de proteção de rotas | 2h | Auth | Rota /dashboard redireciona se não logado |
| Lista de pacientes + busca | 4h | Schema | Busca por nome/CPF/telefone funciona |
| Cadastro de paciente + LGPD | 4h | Lista | Paciente salvo com consentimento registrado |
| Prontuário: Dados Gerais | 3h | Cadastro | Exibe e edita dados do paciente |
| Prontuário: Evolução Clínica | 5h | Dados Gerais | Psicólogo registra sessão com 4 campos |
| Prontuário: Avaliação Neuropsicológica | 4h | Dados Gerais | Psicólogo registra teste com resultados |
| Prontuário: Documentos + Upload | 5h | Supabase Storage | Upload, listagem e download de arquivos |
| Responsividade mobile (revisão geral) | 4h | Todas acima | Todas as telas funcionam em iPhone SE |

**Total Fase 1: ~47h**

---

## Fase 2 — Agenda

| Task | Esforço | Depende de | Critério de conclusão |
|------|---------|------------|----------------------|
| Calendário mensal/semanal/diário | 6h | Fase 1 | 3 visualizações funcionando |
| CRUD de consultas | 4h | Calendário | Criar, editar, cancelar consulta |
| Cores por tipo de atendimento | 2h | CRUD | 4 tipos com cores distintas |
| Status de consulta | 2h | CRUD | Transição de status funciona |
| Dashboard com agenda do dia | 3h | Status | Lista do dia + alertas exibidos |
| Link consulta ↔ prontuário | 2h | Dashboard | Clique na consulta abre prontuário |
| Responsividade mobile da agenda | 3h | Todas acima | Calendário diário funciona no celular |

**Total Fase 2: ~22h**

---

## Fase 3 — Qualidade e Venda

| Task | Esforço | Depende de | Critério de conclusão |
|------|---------|------------|----------------------|
| Onboarding (tela de boas-vindas) | 3h | Fase 2 | Novo usuário vê guia de primeiros passos |
| Landing page pública | 5h | — | Página /  apresenta produto com CTA |
| Configurações de perfil | 3h | Fase 1 | Psicólogo edita nome, CRP, consultório |
| Testes com Lilian + correções | 8h | Tudo | Feedback incorporado, sem bugs críticos |
| Polimento mobile final | 4h | Correções | UX fluida em todos os dispositivos |

**Total Fase 3: ~23h**

---

## Fase 4 — Monetização (pós-validação)

| Task | Esforço | Depende de | Critério de conclusão |
|------|---------|------------|----------------------|
| Integração Stripe/Asaas (assinatura) | 6h | Fase 3 | Cobrança mensal recorrente funciona |
| Trial de 14 dias | 3h | Integração | Conta nova tem 14 dias grátis |
| Bloqueio pós-vencimento | 3h | Trial | Acesso bloqueado com CTA para assinar |
| E-mails transacionais | 4h | Integração | Boas-vindas e lembretes enviados |

**Total Fase 4: ~16h**

---

## Dependências Críticas

```
Setup ──► Auth ──► Pacientes ──► Prontuário ──► Agenda ──► Dashboard
                                                              │
                                                              ▼
                                                         Landing + Onboarding ──► Venda
```

---

## Riscos

| Risco | Impacto | Prob | Mitigação |
|-------|---------|------|-----------|
| Supabase RLS complexa | Alto | Médio | Escrever testes de política antes de avançar |
| Calendário mobile difícil | Médio | Alto | Usar lib testada (react-big-calendar) |
| Upload de arquivos lento | Médio | Baixo | Limitar 10MB, comprimir imagens no client |
| Feedback Lilian muda escopo | Alto | Médio | Travar escopo Fase 1-2 antes de testar |
