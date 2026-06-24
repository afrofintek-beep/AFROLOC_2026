# AFROLOC — App (React + Vite + Capacitor PWA)

Implementação do **AFROLOC — Sistema Continental de Endereçamento Digital** a
partir do _design handoff_ (ver `../README.md`). Stack alvo: **React + Vite +
TypeScript**, empacotável como **PWA** e como app nativa **Android/iOS** via
**Capacitor**. Cópia em pt-PT, arquitetura preparada para i18n.

## Como correr

```bash
cd afroloc-app
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de produção (gera PWA + service worker)
npm run preview  # serve o build
```

### Apps nativas (Capacitor)

Os projetos **Android** e **iOS** já estão configurados (plataformas adicionadas,
plugin `@capacitor/geolocation` ligado, permissões de localização/câmara nos
manifestos, modo de localização em segundo plano para o **PoDP**). As pastas
`android/`/`ios/` são geradas e estão em `.gitignore` — recrie-as com:

```bash
npm run build                     # gera dist/
npx cap add android               # e/ou: npx cap add ios
npm run cap:sync                  # copia o build + plugins para as plataformas
npm run cap:android               # abre no Android Studio  (precisa de JDK 17)
npm run cap:ios                   # abre no Xcode           (precisa de Xcode + CocoaPods)
```

Config em `capacitor.config.ts` (`appId: com.afrofintek.afroloc`, `webDir: dist`).
Permissões já incluídas: Android `ACCESS_FINE/COARSE_LOCATION` + `CAMERA`; iOS
`NSLocation*UsageDescription`, `NSCameraUsageDescription` e `UIBackgroundModes:
location`.

**Ícones & splash de marca** — gerados de `assets/` (logótipo AFROLOC) com:

```bash
npx @capacitor/assets generate \
  --iconBackgroundColor '#E8C97A' --iconBackgroundColorDark '#1A1814' \
  --splashBackgroundColor '#1A1814' --splashBackgroundColorDark '#1A1814'
```

Produz os mipmaps adaptativos Android (`ic_launcher*`), o `AppIcon` iOS e os
splash claro/escuro. As fontes (`assets/icon-only.png`, `icon-foreground.png`,
`icon-background.png`, `splash.png`, `splash-dark.png`) são versionáveis;
`android/`/`ios/` são regeneráveis.

**PWA** — ícones PNG da marca em `public/` (`pwa-192/512`, `pwa-maskable-512`,
`apple-touch-icon`) ligados ao manifesto e ao `index.html` (instalável em iOS/Android).

## Arquitetura

Os **95 ecrãs** do handoff foram reproduzidos com **fidelidade total** a partir
do markup renderizado do protótipo (`AFROLOC-Prototipo-standalone.html`), e são
servidos dentro de uma arquitetura React limpa — **sem** portar o runtime de
streaming bespoke do protótipo (conforme pedido no handoff).

| Camada | Ficheiro | Papel |
|---|---|---|
| Tokens de marca | `src/styles/tokens.css` | Cores, gradientes, tipografia, raios e sombras (Brand Book v2.0) |
| Estilos globais | `src/styles/global.css` | Workbench (rail + canvas), host de ecrã |
| Logótipo | `src/components/Logo.tsx` | Marca AFROLOC em SVG (casa + pin), recriada do brand book |
| Dados dos ecrãs | `src/data/screens.ts` | **Gerado** — markup fiel de cada ecrã + formato (phone/web) |
| Dados continentais | `src/data/africaAdmin.ts` + `africa-admin.json` | 54 países, 834 unidades nível-1, nomenclatura + línguas |
| Catálogo | `src/data/catalog.ts` | Agrupamento dos ecrãs para o índice lateral |
| Motor de navegação | `src/nav/wire.ts` | Réplica fiel do `wire()`/`next()`/`back()` do protótipo |
| Host de ecrã | `src/components/ScreenHost.tsx` | Renderiza um ecrã e encaminha cliques para o React Router |
| Frame | `src/components/PhoneFrame.tsx` | Escala 390×844 (phone) / 1180×760 (web) ao canvas |
| Índice | `src/components/SideIndex.tsx` | Navegação por todos os 95 ecrãs, agrupados |
| App / rotas | `src/App.tsx` | `HashRouter`, rota `/:screenId`, barra de navegação |

### Motor de navegação

Replica exatamente o comportamento do protótipo:

- `data-go` / `data-nav` → `navigate(id)` (empilha histórico do router)
- `data-next` → avança o fluxo de criação
  `['type','location','qgsq','building','informal','witnesses']`, caindo em
  `detail` no fim
- `data-back` → `navigate(-1)`
- Atribuições por texto/forma (botões "Criar a minha AFROLOC", "Continuar",
  chevron de voltar, tab bar Início/Moradas/Mapa/Perfil, etc.) e enriquecimentos
  por ecrã (cartão hero do `home` → `detail`, cartões de `addresses` → `detail`…).

## Lógica real de criação de endereços (SDK AFROLOC)

A lógica simplificada de células foi **substituída** pela especificação técnica
completa (`afroloc-logica-criacao-enderecos`), implementada em `src/lib/afroloc/`:

- `geo.ts` — projeção **Web Mercator (EPSG:3857)** + codec base36 (zig-zag) para
  X/Y, e haversine (spec §3.1/§4/§9.1)
- `sdk.ts` — `encode` / `decode` / `validate` deterministas; formatos standard
  (`CC-ZU-G10-X-Y`) e nomenclatura (`CC-PROV-MUN-COM-BAI-G10-X-Y`); 54 países
- `gps.ts` — **anti-spoofing**: precisão ≤100 m, divergência EXIF↔GPS ≤500 m,
  frescura EXIF ≤30 min, precisão de coordenadas ≥4 casas (spec §3)
- `engines.ts` — **QG Engine** (grelha 10 m urbano / 25 m rural) + **SQ Engine**
  (subdivisão adaptativa 2×2/3×3/4×4/5×5 por densidade: ≤10/≤50/≤150/>150, spec §4/§5)
- `ats.ts` — **ATS Engine** 0–100 + certificação Bronze/Prata/Ouro/Platina (spec §7)
- `createAddress.ts` — orquestrador da cadeia (§1): validar → GPS/EXIF → QG → SQ →
  sequência local de 4 dígitos → ATS → estado `draft`
- `admin.ts` — códigos PROV/MUN/COM a partir da divisão (province de `africa-admin.json`)

Ligado ao fluxo: `location` mostra a integridade GPS, `qgsq` mostra o código real
de nomenclatura + célula + subdivisão SQ, e o envio em `witnesses` corre a pipeline
completa — o `detail` exibe a AFROLOC gerada (ex.: `AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001`,
Bronze · ATS 47). Verificado: encode/decode round-trip exato e centróide a ~3 m do ponto.

**Formato de código unificado:** todos os registos/ecrãs idiomáticos (morada
primária, livro de moradas, testemunhas, fila do validador, fraude/risco, temporárias,
edifício, certificado, partilha, mockup do site, exemplo da API) usam o **formato
atual** `CC-PROV-MUN-COM-BAI-G10-X-Y-NNNN` (e célula `CC-ZU/ZR-G10-X-Y`). O antigo
`AO-LUA-7F3K-29Q` / `U-1042-7731` foi substituído; os plates compactos foram ajustados
para acomodar o código mais longo (quebra de linha + Space Mono).

## Cobertura

Os **92 ecrãs** do conjunto documentado estão reimplementados como componentes
React idiomáticos (selo `REACT` na barra). Avulsos finais: `publicLookup`
(consulta pública via SDK), `language` (13 línguas), `empty`, `buildingDir`.
Restam apenas 3 ids auxiliares fora do conjunto (`docs` alias, `changePhone`,
`trustedDevices`) servidos pelo markup de design fiel.

## Proof of Daily Presence (PoDP) — reforço silencioso do ATS

Implementação fiel à especificação interna (`PoDP_Proof_of_Daily_Presence`), em
`src/lib/podp/`:

- `kpi.ts` — `PodpConfig` (8 parâmetros + defaults) e a **fórmula exata do KPI**
  (`computeCycleKpi`): base_score / streak_bonus / consistency → `final_score`,
  e `podp_score`. `podpAtsBonus()` deriva o reforço (até **+5**).
- `sampler.ts` — **sampler silencioso** (sem UI ao titular): regras de ativação
  (só nativo/PWA instalada; no-op em iframe/preview/dev), anti-spoofing local
  (precisão, casas decimais, raio por Haversine), intervalo configurável,
  outbox → sync.
- `store.ts` — outbox IndexedDB + arquivo de amostras + **rollup local** (KPI
  client-side, substitui as edge functions `podp-sample`/`podp-rollup`).
- **Integração ATS** (`afroloc/ats.ts`): `computeAts` aceita `podpScore` e soma
  até **+5** (cap +5, cap global 100) — a **fórmula pública dos 6 fatores não
  muda** e o reforço é **invisível ao titular** (não aparece no `detail`).
- **Admin nível ≥ 4** (`countryConfig`): editor dos parâmetros + painel de KPI do
  ciclo (recálculo ao vivo) com o reforço aplicado ao ATS. Amostras/rollups só
  visíveis a admin (privado).
- Arranque em `main.tsx` via `bootstrapPodp()` — no-op silencioso fora de PWA/nativo.

## Estado da refatoração idiomática

Já estão reimplementados como componentes React idiomáticos:

**Fluxo de criação de morada** (`src/screens/create/*`):
- `type`, `location`, `adminDivision`, `qgsq`, `building`, `informal`, `witnesses`
- Estado partilhado do rascunho em `src/state/createFlow.tsx` (+ `types.ts`)
- `adminDivision` lê os 54 países / 834 unidades de `africa-admin.json` e adapta
  a nomenclatura por país (província · wilaya · departamento…)
- Regras do domínio aplicadas: testemunhas exigidas (2 formal / 3 informal),
  ciclo de verificação (6 / 3 meses), ramificação do fluxo por tipo

**Identidade & acesso** (`src/screens/auth/*`):
- `welcome` — boas-vindas (mapa QGSQ + pill + CTAs)
- `otp` — código de 6 dígitos, operadora detectada, **timer de reenvio** a contar
  + opção biométrica
- `login` — email/palavra-passe com mostrar/ocultar, esqueci, entrar por SMS
- `presignup` — escolha telefone/email + aceitação de termos (bloqueia o Continuar)
- `forgotPassword` — código + nova palavra-passe com **medidor de força** e confirmação
- `howitworks` — onboarding de 3 passos em hero gradient (Saltar / Começar)

**GPS & mapa reais** (`location`, `qgsq`):
- `src/lib/useGeolocation.ts` — GPS real via plugin **@capacitor/geolocation**
  (nativo em Android/iOS) com fallback para a **Web Geolocation API**
- `src/components/ui/LiveMap.tsx` — mapa real **Leaflet + OpenStreetMap** (sem
  chave) com pino dourado, círculo de precisão e a **célula QGSQ desenhada**
- `src/lib/qgsq.ts` — deriva a célula (código + limites) a partir das
  coordenadas reais; 10×10 m urbano / 50×50 m rural, código permanente e estável
- O `location` captura GPS ao entrar e refina coordenadas + recalcula a célula;
  se a permissão for recusada, recai nas coordenadas atuais (chip âmbar) e mantém
  o mapa funcional
- Nota offline-first: os *tiles* OSM precisam de rede; **a derivação da célula
  funciona offline** (só matemática sobre o GPS) — em produção, usar tiles em
  cache/SDK de mapa para captura de campo sem rede

**Início + Detalhe** (`src/screens/home/*`):
- `home` — saudação, cartão hero dark com **QR real** (`qrcode.react`), **anel
  ATS** em SVG, contagem para a próxima verificação, ações rápidas, tab bar
- `detail` — placa de código com QR, anel ATS + barras de fatores, ciclo de
  verificação, selo de validação por autoridade
- Conta/morada ativa partilhada em `src/data/account.ts`; primitivas reutilizáveis
  `AtsRing`, `Qr`, `TabBar` em `src/components/ui/`

**Vínculo de ocupação & obrigações tributárias** (`src/screens/tenancy/*`) — _extensão de produto (além do handoff)_:
- À semelhança dos estrangeiros, **nacionais** registam a relação **senhorio ↔
  arrendatário** (AFROLOC + NIF de ambos, contrato, renda) — para registo e
  atualização das moradas e para as **obrigações tributárias**
- Passo `tenancy` no fluxo de criação (`qgsq → tenancy → …`) e cartão no `detail`
- `src/data/tenancy.ts` modela o vínculo e deriva as obrigações por parte
  responsável (Imposto Predial · Retenção na fonte · Imposto de Selo), com
  **taxas ilustrativas e configuráveis por jurisdição (countryConfig)** —
  recálculo ao vivo a partir da renda; **não constitui aconselhamento fiscal**
- Ocupação própria não gera obrigações de renda
- **Tributação de rendas ativada por país — apenas Angola (AO) por defeito.**
  Noutros países o vínculo é registado, mas as obrigações ficam indisponíveis
  com aviso, até a jurisdição ser configurada
- **Editável na consola admin** (`countryConfig`): ativar/desativar por país e
  editar as taxas (Predial / Retenção / Selo). Store partilhado em
  `src/state/jurisdictionConfig.tsx` — as alterações no `countryConfig` refletem-se
  ao vivo no ecrã `tenancy`

**Estrangeiros & arrendamento** (`src/screens/foreign/*`):
- `foreigner` — nacionalidade, passaporte com badge **MRZ LIDO**, autorização de
  residência com validade (que governa a validade da AFROLOC)
- `lease` — tipo de ocupação (proprietário/inquilino/cedência), senhorio que
  confirmou, nº/vigência do contrato e PDF anexado
- `authorityDeclaration` — placa **SME** com protocolo, vínculo (arrendamento),
  senhorio e lembrete de renovação ligado à autorização de residência

**Instalar & descarregar** (`src/screens/dist/*`):
- `install` (hero gradient), `appDownload` (badges + QR), `sourceDownload`
  (pacotes + git clone), `manualDownload` (manual + guias rápidos)

**Docs & PI — web 1180×760** (`src/screens/docs/*`, frame em `components/ui/DocsChrome.tsx`):
- `documentsHub`, `adminDocLibrary` (tabela), `contractDownloads`,
  `ipDocumentation`, `ipDrawings` (FIG. 1–6), `patentClaims`, `gridSystemPdf`
  (documento centrado, **consistente com o motor** 10/25 m + código real),
  `brandGuidelines` (logótipo, cores, tipografia, do/don't)
- Nav + sidebar de documentos partilhados (`DocsChrome`)

**API & parceiros — consola dark** (`src/screens/api/*`):
- `apiDocs` — REST API v1, endpoints (GET/POST) + exemplo JSON 200 OK
- `yamiooApi` — chave de integração (revelar), permissões, uso
- `adminYamiooAgents` — agentes de entrega com estatísticas

**Site público — web 1180×760** (`src/screens/web/*`, frame em `components/ui/WebChrome.tsx`):
- `landing` — hero (gradiente) com mockup + QR real, 3 colunas de features
- `pricing` — 3 tiers (Cidadão/Instituição destacada/Governo)
- `about` — missão + 4 stat cards + bloco AFROFINTEK GmbH
- `faq` — acordeão (primeiro aberto)
- `contact` — detalhes + formulário
- Nav partilhada (Produto/Preços/Sobre/FAQ/Contacto · Entrar/Criar conta) que liga
  as páginas e ao fluxo de registo/login

**Métricas & testes** (`src/screens/metrics/*`):
- `addressTest` — **resolve um código com o `decode()` real do SDK** (centróide,
  célula, zona, formato, tempo de resolução); código inválido → erro
- `certificationKpis` — KPIs + critérios com limiar (4/5 elegível) → exportar
- `kpisExport` — formato (PDF/CSV/API JSON) + toggles de inclusão + período
- `testEnvironment` — modo sandbox + ferramentas (→ `addressTest`)
- `tempAddress` — moradas temporárias (TEMP) com validade/expiração

**Telecom & grelha — consola dark** (`src/screens/grid/*`):
- `telecomOperators` — operadoras (Unitel/Movicel/Africell) com cobertura e
  estado de integração
- `cellTowers` — triangulação de antenas (ponto estimado ±38 m) + lista por Cell ID/dBm
- `importUrbanZones` — importar GeoJSON de zonas urbanas (progresso) → grelha
- `gridMgmt` — geração da grelha QGSQ; **tamanhos vindos do motor** (10×10 / 25×25 m),
  seletor de província real
- `importDivisions` / `continentalCoverage` — **dados reais** de `africa-admin.json`
  (54 países · 834 unidades · nomenclatura/línguas por país)

**Administração — consola dark** (`src/screens/admin/*`):
- `adminDash` — KPIs (moradas/pendentes/validadores/fraude), gráfico semanal,
  lotes a aprovar; tab bar dark (Painel/Utilizadores/Relatórios/Segurança)
- `users` — utilizadores por jurisdição, filtros, criar subordinado
- `roleApprovals` — pedidos de função com Recusar/Aprovar (decisão por linha)
- `security` — eventos por resolver com severidade (crítico/elevado/médio)
- `fraudFlags` — sinalizações com Ignorar/Suspender/Investigar
- `securityAudit` — registo imutável de eventos
- `reports` — taxa de aprovação, validações por comuna, exportar PDF/Excel
- `countryConfig` — config por país + **edição das regras de renda** (ver acima)
- `adminLogin` / `adminSetup` / `admin2fa` — acesso à consola (área restrita,
  criar super-admin Nível 5, 2FA com códigos de backup)
- `regionalMgmt` — municípios + atribuição de validador
- `setup` — config Nível 5 (divisões, números de validação, ciclos); tab bar
  com 4.º item "Sistema" (`AdminTabBar variant="system"`)
- `translationValidation` — completude por idioma (13) + auto-traduzir (IA), RTL
- Primitivas dark partilhadas em `src/screens/admin/adminUi.tsx`

**Validador** (`src/screens/validator/*`):
- `validatorInbox` — fila de pedidos com badges (URGENTE/NOVO/EM ANÁLISE) e SLA
- `validatorReview` — sujeito, validações (raio/GPS), testemunhos, ATS estimado,
  Rejeitar / Aprovar (com confirmação de decisão)
- `aflRequests` — pedidos a aguardar análise, Rejeitar / Rever
- `validationsDashboard` — stat 3 284 (+18%) e barras por validador
- `authorityGps` — mapa de alta precisão (±3 m) + confirmar ponto da autoridade
- `confirmWitness` — lado da testemunha: sujeito, mini-mapa e **OTP de 6 dígitos**
  (confirmar bloqueado até completo)

**Campo / offline** (`src/screens/field/*`):
- `operator` — ecrã escuro com status **OFFLINE**, progresso do lote (42/50),
  por-sincronizar, lista de capturados e botão de captura
- `offline` — estado **SEM REDE** com fila de sincronização e estados de captura
  (GPS / EXIF); `PhoneChrome` ganhou `offlineLabel` configurável

**Agregado & censo** (`src/screens/household/*`):
- `household` — chip da morada + lista de residentes (titular com badge PRIMÁRIA)
- `householdCensus` — cartão de censo (membros/máx, RECENSEADO, tipologia T3,
  ocupação), membros com idade + parentesco, Adicionar / Registar óbito
- `addMember` — chips de relação, **idade auto-calculada** a partir da data de
  nascimento, documento, menor/dependente, limite 1–15; modelo em `src/data/household.ts`
- `deceased` — **tom sóbrio (sem dourado)**: data do óbito, nº da certidão, PDF
  anexado, comunicação ao recenseamento → confirma e retira da base ativa

**Verificação & risco** (`src/screens/risk/*`):
- `reverify` — banner de vencimento, mapa GPS recapturado, **checklist** que
  controla o botão (obrigatórios), nota do ciclo → confirma e volta ao detalhe
- `riskAlerts` — contagens (crítico/alto/médio) e cartões com acento de
  severidade e escalonamento de pontuação (90 vencida / 80 a vencer / 70 incompleta)
- `gpsHistory` — banner de spoofing, **mapa escuro** (tiles OSM invertidos) com
  leituras boas (verde) / rejeitadas (vermelho), linha temporal e estabilidade do ponto
- `notifications` — lista com não-lidas (ponto) e "Ler todas"; cada item navega
  para o ecrã relacionado
- `appeal` — banner de rejeição, motivo do recurso, anexar prova, prazo de
  5 dias úteis → enviar
- `witnessProximity` — mapa com **raio de 1 km** e testemunhas dentro (✓ verde) /
  fora (✕ vermelho), posicionadas por `destinationPoint` (geo.ts)

**Partilhar** (`share`, `src/screens/home/ShareScreen.tsx`):
- Cartão com código + QR real, lista de casos de uso (entregas / banca / serviços
  públicos / emergência) e ações **Cartão PDF** (reutiliza o gerador de
  certificado), **Link · SMS** (`sms:`) e **Partilhar** (Web Share API)

**Reputação** (`witnessRep`, `src/screens/home/WitnessRepScreen.tsx`):
- Cartão de confiança dark (score / 100, progresso até Ouro), histórico de
  reputação (+pontos) e os tiers Bronze / Prata / Ouro

**Guia / wayfinding** (`wayfinding`, `src/screens/home/WayfindingScreen.tsx`):
- **Bússola real** via DeviceOrientation (`src/lib/useDeviceHeading.ts`); a seta
  roda relativamente à direção do dispositivo, com fallback "rumo a partir do
  norte" quando não há sensor
- Distância e rumo calculados por GPS (`src/lib/geo.ts` — haversine + bearing +
  ponto cardeal pt-PT), passos por marcos, "Ligar ao titular" (tel:) / "Iniciar guia"

**Perfil** (`profile`, `src/screens/home/ProfileScreen.tsx`):
- Cartão de autorização **dark com hierarquia de 5 níveis** (barras 1–5,
  confiança), título e jurisdição; reputação (tier + score) → `witnessRep`
- Definições com toggles (biométrica, modo offline) e Idioma → `language`;
  Terminar sessão → `welcome`. Fecha a tab bar (Início · Moradas · Mapa · Perfil)

**Lista de moradas** (`addresses`, `src/screens/home/AddressesScreen.tsx`):
- Cartões com mini-mapa (pino colorido pelo estado), código, estado e ATS
- Chips de filtro (Todas · N / Activas / Pendentes), botão **+** → fluxo de criação
- Cartão rascunho mostra "Concluir →" (retoma a criação); nota de sincronização
  offline; tab bar com Moradas activo

**Mapa de moradas** (`identitiesMap`, `src/screens/home/IdentitiesMapScreen.tsx`):
- Mapa Leaflet de ecrã inteiro com um pino por morada, **colorido pelo estado**
  (verde activa · dourado pendente · cinza rascunho) e auto-enquadramento
- Chips de filtro (Todas / Activas / Pendentes) que filtram pinos + lista
- *Bottom sheet* com a lista das moradas (código + ATS), tab bar com Mapa activo
- Livro de moradas partilhado em `src/data/addresses.ts` (com coordenadas reais)

**Certificado verificável** (`certificate`, `src/screens/home/CertificateScreen.tsx`):
- Documento branco com QR real, badge VERIFICADO · ATS e campos (titular /
  morada / célula QGSQ / validador / emitido)
- **Exportar PDF real** via `src/lib/certificatePdf.ts` (jsPDF + QR embebido como
  PNG) — gera `AFROLOC-<código>.pdf`; **Partilhar** usa a Web Share API com
  fallback para copiar o link

Registo de quais ecrãs são idiomáticos: `src/screens/registry.tsx` (os restantes
caem no markup fiel via `ScreenHost`); a barra mostra o selo `REACT`.

Os restantes ecrãs continuam servidos a partir do markup de design fiel — o que
garante cobertura e fidelidade imediatas. Para evoluir mais um ecrã para um
componente React idiomático (estado real, validação, mapas/QR reais), basta:

1. Criar `src/screens/<Ecra>.tsx` e implementar a UI usando os tokens e as
   primitivas de `src/components/ui/` (`PhoneChrome`, `FlowHeader`,
   `PrimaryButton`, `MapPlaceholder`, `CellPlate`, `Pill`…).
2. Registar esse `id` em `src/screens/registry.tsx` (o `App` rende o componente
   em vez do markup fiel), mantendo as mesmas ações de navegação.
3. Ligar os dados reais (ex.: `africaAdmin` nos seletores `adminDivision` /
   `location`, lib de QR no `detail`/`certificate`, SDK de mapa no `location`/
   `identitiesMap`).

Áreas com lógica de estado já especificada no handoff: OTP + timer de reenvio,
testemunhas (pendente→confirmada), escalonamento de risco (70/80/90), captura
offline + fila de sincronização, contagem do ciclo de verificação, sandbox vs
produção, validação de formulários.
