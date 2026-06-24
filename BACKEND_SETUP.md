# AFROLOC — Configuração do backend (Supabase)

A app já tem todo o código de backend ligado. Para a ativares, cria um projeto
Supabase (grátis) e liga as chaves. ~10 minutos.

## 1. Criar o projeto
1. Vai a **https://supabase.com** → *Start your project* → entra com GitHub.
2. **New project**:
   - **Name:** `afroloc`
   - **Database Password:** gera uma forte e **guarda-a**.
   - **Region:** escolhe a mais próxima (ex.: *West EU (London)* ou *Frankfurt*).
3. Espera ~2 min até o projeto ficar pronto.

## 2. Criar as tabelas
1. No projeto → menu lateral **SQL Editor** → **New query**.
2. Abre o ficheiro [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   deste repositório, copia **todo** o conteúdo, cola no editor e clica **Run**.
3. Deve aparecer *Success. No rows returned* — as tabelas `profiles` e
   `addresses` ficam criadas com segurança por linha (RLS).

## 3. Obter as chaves
1. **Project Settings** (engrenagem) → **API**.
2. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   *(NÃO uses a `service_role` — essa é secreta.)*

## 4. Ligar localmente
Cria um ficheiro `.env.local` na pasta `afroloc-app/` (copia de `.env.example`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Depois `npm run dev` — a app passa de "modo demo" para dados reais.

## 5. Ligar no Vercel (produção)
Vercel → o teu projeto → **Settings → Environment Variables** → adiciona as
duas variáveis (mesmos nomes e valores) → **Redeploy**.

## 6. Login por email vs telefone
- **Email** funciona logo após os passos acima.
  - Para testes rápidos: **Authentication → Providers → Email** e desliga
    *Confirm email* (senão tens de confirmar cada registo por email).
- **Telefone / OTP por SMS** precisa de um fornecedor de SMS:
  - **Authentication → Providers → Phone** → ativa e liga ao **Twilio**
    (ou MessageBird/Vonage). Requer conta nesse fornecedor (pago por SMS).
  - Sem isto, usa o login por email — o código de telefone fica pronto a
    funcionar assim que ligares o fornecedor.
