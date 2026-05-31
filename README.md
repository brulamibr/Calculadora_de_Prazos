# Calculadora de Prazos Jurídicos

Aplicação web para cálculo automático de prazos processuais em dias úteis ou corridos, considerando feriados nacionais, estaduais e municipais de todo o Brasil.

## Funcionalidades

- Cálculo de prazos em **dias úteis** (descontando fins de semana e feriados) ou **dias corridos**
- Feriados nacionais via [BrasilAPI](https://brasilapi.com.br) — sempre atualizados
- Municípios e comarcas via [API IBGE](https://servicodados.ibge.gov.br) — todos os 5.570+
- Histórico de cálculos por usuário com exportação em PDF e Excel
- Dashboard com resumo e prazos próximos
- Autenticação multi-usuário com confirmação por e-mail
- Modo claro / escuro

## Stack

- **Next.js 16** (App Router)
- **Supabase** (Banco de dados + Autenticação)
- **TailwindCSS v4** + **shadcn/ui**
- **TypeScript**

---

## Deploy na Vercel

### 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor** do painel do Supabase, execute o conteúdo de `supabase/schema.sql`
3. Anote a **Project URL** e a **Anon Key** (Project Settings → API)

### 2. Deploy na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brulamibr/Calculadora_de_Prazos)

Ou manualmente:

```bash
npm i -g vercel
vercel --prod
```

### 3. Configurar variáveis de ambiente na Vercel

No painel da Vercel: **Project → Settings → Environment Variables**

| Variável | Valor | Onde encontrar |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | Supabase → Project Settings → API |

> ⚠️ **Use apenas a chave `anon`/`publishable`.** Nunca configure a `service_role` key como variável `NEXT_PUBLIC_`.

---

## Desenvolvimento local

```bash
# 1. Clonar o repositório
git clone https://github.com/brulamibr/Calculadora_de_Prazos.git
cd Calculadora_de_Prazos

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Segurança

- Nenhuma credencial é armazenada no código-fonte
- As chaves `NEXT_PUBLIC_*` do Supabase são intencionalmente públicas — a segurança dos dados é garantida pelo **Row Level Security (RLS)** configurado no banco
- Headers de segurança configurados: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`
- Arquivo `.env.local` excluído do git pelo `.gitignore`
