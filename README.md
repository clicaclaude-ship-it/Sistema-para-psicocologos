# PsicoGest — Prontuário Eletrônico para Psicólogos

SaaS de gestão clínica para psicólogos autônomos brasileiros. Prontuário eletrônico, agenda integrada e avaliações neuropsicológicas em um só sistema, em conformidade com a LGPD.

## Stack

- **Next.js 16** (App Router + TypeScript)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Tailwind CSS v4** + shadcn/ui
- **React Hook Form** + Zod
- **lucide-react** + date-fns
- **Vercel** (deploy recomendado)

## Configuração local

### Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)

### Passos

1. **Clone o repositório**

```bash
git clone <url-do-repo>
cd psicogest
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com seus dados do projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

4. **Configure o banco de dados no Supabase**

No painel do Supabase, acesse **SQL Editor** e execute o conteúdo de:

```
supabase/migrations/001_initial_schema.sql
```

Isso criará todas as tabelas, políticas RLS e a trigger de criação automática do perfil do psicólogo.

5. **Configure o Storage no Supabase**

No painel do Supabase, acesse **Storage** e crie um bucket chamado `documents` com as seguintes configurações:

- **Public**: false (privado)
- Adicione as políticas RLS via **SQL Editor**:

```sql
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

6. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública do seu projeto Supabase |

## Deploy

Deploy automático na Vercel. Configure as variáveis de ambiente no painel da Vercel e conecte o repositório. O build usa `--webpack` para contornar um bug do Turbopack com caracteres especiais no caminho do diretório.

```bash
npm run build   # verificar build local
npm start       # servidor de produção local
```

## Estrutura do projeto

```
app/
├── (public)/                   # Páginas públicas (sem autenticação)
│   ├── page.tsx                # Landing page
│   ├── login/
│   ├── cadastro/
│   ├── recuperar-senha/
│   ├── privacidade/            # Política de Privacidade LGPD
│   └── termos/                 # Termos de Uso
├── (dashboard)/                # Área autenticada
│   ├── layout.tsx              # Layout com sidebar/bottom nav
│   ├── dashboard/              # Dashboard principal
│   ├── onboarding/             # Boas-vindas para novos usuários
│   ├── pacientes/              # Listagem e prontuário de pacientes
│   │   ├── novo/               # Cadastro de novo paciente
│   │   └── [patientId]/        # Prontuário individual
│   │       └── sessoes/nova/   # Nova sessão clínica
│   ├── agenda/                 # Agenda de consultas
│   └── configuracoes/          # Perfil, senha, exclusão de conta
├── not-found.tsx               # Página 404 global
└── layout.tsx                  # Root layout

components/
├── ui/                         # Componentes shadcn/ui
├── app-shell.tsx               # Sidebar + bottom navigation
├── patient-card.tsx            # Card de paciente
├── session-form.tsx            # Formulário de evolução clínica
├── session-form-with-appointment.tsx
├── neuro-eval-form.tsx         # Formulário de avaliação neuropsicológica
└── document-upload.tsx         # Upload de documentos (drag and drop)

lib/
├── supabase/                   # Clients browser e server
├── validations/                # Schemas Zod (patient, profile, etc.)
├── hooks/                      # Hooks customizados
└── utils.ts                    # Utilitários (formatação, máscaras, etc.)

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Schema completo do banco de dados

types/
└── database.ts                 # Interfaces TypeScript das entidades
```

## Funcionalidades

### Autenticação
- Cadastro, login e recuperação de senha via Supabase Auth
- Proteção de rotas via middleware (proxy.ts)

### Onboarding
- Tela de boas-vindas para novos usuários (sem pacientes cadastrados, criados há menos de 7 dias)
- Stepper com 3 passos: completar perfil, cadastrar paciente, configurar agenda
- Form inline que salva diretamente na tabela `psychologists`

### Dashboard
- Saudação personalizada por horário do dia
- Cards de estatísticas: pacientes ativos, consultas da semana, alertas
- Consultas do dia com link para a agenda
- Pacientes recentes com acesso rápido ao prontuário
- Alertas de pacientes sem sessão há mais de 30 dias

### Pacientes
- Listagem com busca em tempo real (debounce 300ms)
- Filtro por status (Todos / Ativos / Inativos)
- Cadastro com consentimento LGPD digital

### Prontuário (4 abas)
- **Dados gerais**: informações pessoais, edição inline
- **Evolução clínica**: registro de sessões (Queixa · Intervenção · Observações · Plano)
- **Avaliação neuropsicológica**: testes aplicados com resultados e interpretação
- **Documentos**: upload drag-and-drop para Supabase Storage (PDF, DOCX, PNG, JPG)

### Agenda
- Visualização diária, semanal e mensal
- Cores por tipo de atendimento
- Criação e edição de agendamentos

### Configurações
- Perfil profissional (nome, CRP, telefone, consultório)
- Alteração de senha
- Exclusão de conta com confirmação dupla (conformidade LGPD)

### Landing Page
- Página de vendas completa com hero, features, depoimentos e pricing
- Navbar responsiva com hamburger menu no mobile
- Links para Política de Privacidade e Termos de Uso

## Segurança e LGPD

- Row Level Security (RLS) habilitado em todas as tabelas
- Cada psicólogo acessa apenas seus próprios dados
- Consentimento do paciente registrado com timestamp
- Dados armazenados no Brasil
- Direito ao esquecimento implementado via exclusão de conta
- Criptografia em repouso (AES-256) e em trânsito (TLS)
