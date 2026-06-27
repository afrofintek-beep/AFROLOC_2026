# AFROLOC — Send SMS Hook (Infobip + roteamento panafricano)

Esta Edge Function é o **Send SMS Auth Hook** do Supabase. Quando um utilizador
pede OTP por telemóvel, o Supabase chama esta função com `(número, código)` e ela
envia o SMS pelo fornecedor certo **por país**. Hoje: Infobip. Amanhã: gateways
locais/africanos, somando entradas em `providerFor` — sem mexer na app.

## 1. Recolher dados do Infobip
No painel Infobip (https://portal.infobip.com):
- **Base URL** — algo como `https://xxxxx.api.infobip.com` (canto superior, "API key" / "Homepage").
- **API Key** — Developers → API Keys → cria uma (guarda o valor).
- **Sender** — um *Sender ID* aprovado (ex.: `AFROLOC`) ou um número. Confirma que
  Angola (+244) está coberto na tua conta.

## 2. Pré-requisitos locais
- Supabase CLI: `npm i -g supabase` (ou `brew install supabase/tap/supabase`)
- `supabase login`
- (na pasta `afroloc-app/`) `supabase link --project-ref aaowsnfmavkhoipudbma`

## 3. Deploy da função
```bash
cd afroloc-app
supabase functions deploy send-sms --no-verify-jwt --project-ref aaowsnfmavkhoipudbma
```
(`--no-verify-jwt` porque o hook é chamado pelo Auth, não por um utilizador.)

## 4. Ativar o hook no Supabase (gera o segredo)
Dashboard → **Authentication → Hooks** → **Send SMS hook** → **Enable** →
tipo **HTTPS** → URL:
```
https://aaowsnfmavkhoipudbma.supabase.co/functions/v1/send-sms
```
Ao gravar, o Supabase mostra um **secret** (`v1,whsec_...`). Copia-o.

Também: **Authentication → Providers → Phone** → **Enable** (para o login por
telemóvel estar ligado). Com o hook ativo, é o hook que envia — não precisas de
configurar o provider nativo (Twilio/etc.).

## 5. Definir os secrets da função
```bash
supabase secrets set \
  SEND_SMS_HOOK_SECRET="v1,whsec_...copiado_do_passo_4..." \
  INFOBIP_BASE_URL="https://xxxxx.api.infobip.com" \
  INFOBIP_API_KEY="....." \
  INFOBIP_SENDER="AFROLOC" \
  --project-ref aaowsnfmavkhoipudbma
```

## 6. Testar
Abre a app → "Continuar com telemóvel" → o teu número → deves receber o SMS.
Logs: `supabase functions logs send-sms --project-ref aaowsnfmavkhoipudbma`

## Expansão panafricana
Em `index.ts`, na função `providerFor`, acrescenta o roteamento por país e a
respetiva função de envio (Termii, Clickatell, Africa's Talking, gateway local).
A app não muda — só esta camada.
