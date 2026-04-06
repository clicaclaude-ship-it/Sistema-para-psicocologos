# Guia Completo de Implantação — PsicoGest

> **Tempo estimado:** 40 minutos  
> **Custo:** R$ 0 (todos os serviços têm plano gratuito)  
> **Nível:** Sem conhecimento técnico necessário

---

## O que você vai precisar

- Uma conta de e-mail (Gmail recomendado)
- Navegador Chrome ou Edge
- A pasta do projeto PsicoGest no seu computador

---

## Passo 1 — GitHub (guardar os arquivos do sistema)

O GitHub é onde os arquivos do sistema ficam guardados. A Vercel (próximo passo) lê daqui para publicar o site.

1. Acesse **github.com** e clique em **"Sign up"**
   - Use seu e-mail e crie uma senha
   - Confirme pelo e-mail recebido

2. Clique em **"+"** (canto superior direito) → **"New repository"**
   - Nome: `psicogest`
   - Marque **"Private"** (repositório privado)
   - Clique **"Create repository"**

3. Na página do repositório criado, clique em **"uploading an existing file"**
   - Arraste **toda a pasta** do PsicoGest para a área indicada
   - Aguarde o upload (pode demorar alguns minutos)
   - Clique em **"Commit changes"**

> 💡 Não sabe usar Git? Tudo bem! O upload pela interface web é suficiente.

---

## Passo 2 — Supabase (banco de dados + autenticação)

O Supabase armazena todos os dados dos pacientes com segurança, com servidores no Brasil.

1. Acesse **supabase.com** → clique **"Start your project"**
   - Faça login com **"Continue with GitHub"** (usa a conta que você acabou de criar)

2. Clique em **"New project"**
   - **Nome do projeto:** psicogest
   - **Senha do banco:** crie uma senha forte (anote em lugar seguro!)
   - **Região:** `South America (São Paulo)` ← **OBRIGATÓRIO para LGPD**
   - Clique **"Create new project"**

3. Aguarde ~2 minutos enquanto o projeto é criado (não feche a aba)

4. Copie as credenciais:
   - Clique em **"Project Settings"** (engrenagem no menu lateral)
   - Clique em **"API"**
   - Copie e guarde:
     - **Project URL** — ex: `https://xyzabc.supabase.co`
     - **anon public** — chave longa começando com `eyJh...`

---

## Passo 3 — Criar as tabelas (SQL)

Você vai copiar e colar um arquivo pronto. Nenhum conhecimento de SQL necessário.

1. No Supabase, clique em **"SQL Editor"** no menu lateral esquerdo

2. No seu computador, abra a pasta do PsicoGest:
   - Navegue até: `supabase` → `migrations` → `001_initial_schema.sql`
   - Abra com o **Bloco de Notas** (clique com botão direito → "Abrir com" → Bloco de Notas)

3. Selecione tudo o conteúdo (**Ctrl+A**) e copie (**Ctrl+C**)

4. Cole no **SQL Editor** do Supabase (**Ctrl+V**)

5. Clique no botão **"Run"** (verde, canto inferior direito)
   - Resultado esperado: `Success. No rows returned.`

> ✅ Isso cria todas as tabelas de pacientes, consultas, prontuários e documentos.

---

## Passo 4 — Configurar o armazenamento de arquivos (Storage)

Aqui ficam os laudos, relatórios e documentos dos pacientes.

1. No Supabase, clique em **"Storage"** no menu lateral

2. Clique em **"New bucket"**
   - **Name:** `documents` (exatamente assim, em minúsculas)
   - Marque **"Public bucket"** ✓
   - Clique **"Save"**

3. Confirme que o bucket `documents` aparece na lista

> 📋 Supabase concluído! Banco de dados ✓ · Tabelas criadas ✓ · Storage configurado ✓

---

## Passo 5 — Vercel (publicar o sistema na internet)

A Vercel publica o PsicoGest na internet de forma gratuita. É o provedor recomendado.

1. Acesse **vercel.com** → clique **"Start Deploying"**
   - Faça login com **"Continue with GitHub"**

2. Clique **"Add New → Project"**
   - Procure `psicogest` na lista e clique **"Import"**

3. Em **"Framework Preset"**, selecione **"Next.js"**
   - Deixe as outras opções como estão
   - **NÃO clique em Deploy ainda!**

4. Clique em **"Environment Variables"** — veja o próximo passo

---

## Passo 6 — Variáveis de ambiente (conectar Vercel + Supabase)

Essas são as "senhas" que permitem o sistema se conectar ao banco de dados.

Adicione estas 2 variáveis na tela da Vercel:

| Nome da variável | Valor |
|-----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | O **Project URL** que você copiou no Passo 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O **anon public key** que você copiou no Passo 2 |

Para cada variável:
1. Clique **"Add"**
2. Preencha o **Name** (exatamente como mostrado acima)
3. Preencha o **Value** com o dado copiado do Supabase
4. Clique **"Save"**

**Após adicionar as 2 variáveis:**
1. Clique no botão **"Deploy"**
2. Aguarde ~3 minutos
3. A Vercel mostrará confetes 🎉 e o link do seu sistema!

> ✅ Seu link ficará parecido com: `https://psicogest-seunome.vercel.app`

---

## Sistema no ar! Checklist de verificação

- [ ] Abra o link da Vercel — a landing page do PsicoGest deve aparecer
- [ ] Clique em "Criar conta grátis" e cadastre-se como psicólogo
- [ ] Complete o onboarding (3 passos: perfil → paciente → agenda)
- [ ] Cadastre um paciente de teste e registre uma sessão
- [ ] Verifique se o upload de documento funciona na aba "Documentos"
- [ ] Acesse pelo celular e confirme que a interface está responsiva

---

## Alternativa: Deploy na Hostinger

> ⚠️ **Recomendação:** Use a Vercel (Passos 5 e 6) — é gratuita e foi feita para este tipo de sistema.  
> Use a Hostinger apenas se quiser centralizar tudo num só lugar ou se já tiver o plano pago.

**Requisito:** Plano **Business** ou superior da Hostinger (tem suporte a Node.js). O plano compartilhado básico **não funciona**.

1. No painel **hPanel** da Hostinger → **"Node.js"**
2. Clique **"Create application"**
   - Node.js version: **20**
   - App root: `/`
3. Conecte ao GitHub ou faça upload via FTP (usando o FileZilla)
4. No painel Node.js, adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. No terminal da Hostinger: `npm run build && npm start`

**Para domínio personalizado (ex: psicogest.com.br):**
- Compre o domínio na Hostinger (ou outro registrador)
- Na Vercel: Settings → Domains → adicione o domínio comprado

---

## Dúvidas frequentes

**O deploy falhou na Vercel. O que fazer?**
> Verifique se as 2 variáveis de ambiente foram adicionadas corretamente. Os nomes devem estar exatos, sem espaços extras.

**Cadastrei paciente mas não aparece nada.**
> Confirme que o SQL foi executado no Supabase (Passo 3). Abra "Table Editor" no Supabase e veja se a tabela `patients` existe.

**Upload de documento não funciona.**
> Verifique se o bucket `documents` foi criado no Supabase Storage (Passo 4). O nome deve ser exatamente `documents` (minúsculas).

**Quero um domínio .com.br.**
> Compre o domínio (recomendo: Hostinger, Registro.br ou GoDaddy). Na Vercel, vá em Settings → Domains e adicione o domínio.

**Posso mudar a logo e o nome?**
> Sim. Edite `app/(public)/page.tsx` para a landing page e `components/app-shell.tsx` para o logo interno.

---

## Próximos passos (após validar com a Lilian)

1. **Fase 4 — Monetização:** Integrar Stripe ou Asaas para cobrar a assinatura mensal automaticamente
2. **Domínio profissional:** Registrar `psicogest.com.br` e configurar na Vercel
3. **E-mails transacionais:** Configurar boas-vindas e lembretes automáticos
4. **Marketing:** Usar a landing page para captar novos psicólogos

---

*Guia de Implantação PsicoGest · Versão 1.0 · Abril 2026*
