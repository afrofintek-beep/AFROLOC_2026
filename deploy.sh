#!/usr/bin/env bash
# Deploy fiável da app AFROLOC individual para o MESMO projeto Vercel de sempre.
#
# Porquê este script: `npm run build` (Vite) esvazia a pasta dist/ a cada build,
# apagando o link `dist/.vercel`. Sem link, `vercel deploy dist` cria um PROJETO
# NOVO todas as vezes — foi assim que o app.afroloc.ao ficou preso num projeto
# antigo. Este script repõe o link (projeto "dist" = prj_fCebZ…) DEPOIS do build,
# antes de publicar, garantindo que aponta sempre ao projeto do app.afroloc.ao.
set -euo pipefail
cd "$(dirname "$0")"

ORG="team_cinmsMwP12dOXF8k9PHxXbMw"
PROJ="prj_fCebZ0iMrCsW0R7pH74QkNk81Pgp"   # projeto "dist" (o que serve app.afroloc.ao)

echo "→ build de produção…"
npm run build

echo "→ a (re)ligar a pasta ao projeto Vercel (refresca o token; evita 'Not authorized')…"
rm -rf dist/.vercel
if ! npx vercel@latest link --yes --cwd dist --project dist; then
  # Recurso: se o `link` falhar, escreve o project.json à mão (IDs conhecidos).
  echo "  (link falhou — a fixar o project.json manualmente)"
  mkdir -p dist/.vercel
  printf '%s\n' "{\"orgId\":\"$ORG\",\"projectId\":\"$PROJ\",\"projectName\":\"dist\"}" > dist/.vercel/project.json
fi

echo "→ a publicar em produção…"
npx vercel@latest deploy dist --prod --yes

echo "✓ feito. Confirma o alias impresso acima (deve ser sempre o MESMO projeto)."
