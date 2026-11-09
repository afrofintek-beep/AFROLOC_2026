# Auditoria de factualidade AFROLOC — 9 novembro 2026

## Resultado
A versão pública de app.afroloc.ao contém simulações e integrações incompletas. Não está demonstrado que todas as funcionalidades sejam reais. app.afroloc.com devolveu HTTP 503 durante a verificação; .ao devolveu 200. Isto não prova que os dois domínios sirvam a mesma aplicação.

Base inspecionada: AFROLOC_2026, commit e24116ce8483612a00afc8aee6b1dc63643e4dd9, correspondente à implantação pública identificada. A inspeção de código não substitui testes autenticados ponta a ponta de cada módulo.

## Defeitos confirmados

| Função | Evidência | Consequência |
|---|---|---|
| Testemunhas | src/screens/create/WitnessesScreen.tsx: distância 300 + comprimento do código × 17 | Distância não calculada sobre residências reais |
| Aprovação de residência | ValidatorReviewScreen.tsx: setDecision apenas local | Aprovar no ecrã não comprova registo no servidor |
| Confirmação de testemunho | ConfirmWitnessScreen.tsx: setDecision apenas local | Confirmação visual sem evidência persistida |
| Consulta pública | PublicLookupScreen.tsx: expressão regular/validação sintática e resultado fixo | Código sintaticamente válido apresentado como morada verificada |
| 2FA administrativo | Admin2faScreen.tsx: seis dígitos preenchidos permitem navegar; códigos de backup fixos | Este ecrã não verifica um segundo fator real; não prova por si só acesso à base de dados |
| Endereços | src/lib/supabase/addresses.ts consulta public.addresses | Consulta SQL confirmou tabela inexistente na base ligada; registo canónico é afroloc_records |
| Indicadores | AdminDashScreen WEEK; CountryConfig demoSeries/DEMO_HOURS | Métricas demonstrativas |
| Operação de campo e validação | OperatorScreen CAPTURED; AflRequests REQUESTS | Listas fixas |
| Telecomunicações e torres | TelecomOperators OPERATORS; CellTowers TOWERS | Listas fixas, integração não demonstrada |
| Moradas temporárias e proximidade | TempAddress TEMP; WitnessProximity lista fixa | Estados/distâncias demonstrativos |

Autenticação por email e telefone possui chamadas reais Supabase no código, mas a existência dessas chamadas não comprova entrega de SMS, recuperação de conta ou funcionamento integral. Mapas e geração local de ficheiros também não comprovam certificação oficial.

## Alteração preparada para a feira
Backend implantado: fair-verification e migração de regras. Registos canónicos, três utilizadores distintos, OTP, distância residencial até 500 m, mesmo condomínio quando aplicável, residência revista por validador autorizado e certificação condicionada. Proteções de propriedade, estado, privacidade e alteração posterior das coordenadas cobertas por testes automatizados. Nenhum SMS real foi enviado nem residência real certificada nos testes.

Interface disponível apenas em preview: https://dist-9fopq4is4-afrofintek-2071s-projects.vercel.app/ (pode exigir sessão Vercel). Esta interface é focada na feira e substitui a galeria anterior; não é uma correção de todos os módulos antigos. Criação de novo endereço encaminha para www.afroloc.ao/identities/create; códigos existentes são lidos da base canónica sem inventar formato.

A promoção da interface para produção foi bloqueada pela revisão automática por falta de autorização específica para essa alteração pública. app.afroloc.ao permanece com a interface anterior. Não foi verificada alteração da ligação em natal.yamilook.com nesta etapa.

## Pendências de aceitação
- Teste real com titular, três testemunhas e validador oficialmente designado, incluindo entrega SMS e registo final.
- Confirmar contactos oficiais publicáveis e evidências das residências; não inventar contactos ou validações.
- Corrigir ou identificar explicitamente módulos demonstrativos antes de os apresentar como serviços operacionais.
- Testes autenticados de cada percurso original, incluindo persistência, permissões, erros e consultas após nova sessão.
- Decidir publicação do percurso da feira sem eliminar inadvertidamente funcionalidades fora desse âmbito.

## Inventário de rotas e indícios de implementação
A lista abaixo abrange o registo de ecrãs encontrado. Os excertos são indícios para investigação, não aprovação funcional. Rotas sem defeito confirmado acima permanecem NÃO CERTIFICADAS ponta a ponta.

### welcome

Ficheiro: `src/screens/auth/WelcomeScreen.tsx`

```tsx
22: <PrimaryButton onClick={() => navigate("/phoneLogin")}>Continuar com telemóvel</PrimaryButton>
23: <GhostButton onClick={() => navigate("/login")}>Entrar com email</GhostButton>
```

### type

Ficheiro: `src/screens/create/TypeScreen.tsx`

```tsx
63: onClick={() => dispatch({ type: "setType", value: o.value })}
141: <PrimaryButton onClick={() => navigate("/" + nextStep("type", draft.type))}>Continuar</PrimaryButton>
```

### location

Ficheiro: `src/screens/create/LocationScreen.tsx`

```tsx
76: onClick={locate}
128: <FieldButton label="País" value={`${country?.flag ?? ""} ${draft.division.countryName}`} onClick={() => navigate("/adminDivision")} />
153: <PrimaryButton onClick={() => navigate("/" + nextStep("location", draft.type))}>Continuar</PrimaryButton>
194: <button onClick={onClick} style={{ all: "unset", cursor: "pointer", width: "100%" }}>
```

### adminDivision

Ficheiro: `src/screens/create/AdminDivisionScreen.tsx`

```tsx
10: const [iso, setIso] = useState(draft.division.countryIso);
11: const [query, setQuery] = useState("");
44: <button onClick={() => navigate(-1)} aria-label="Voltar" style={chevronBtn}>
94: onClick={() => pickCountry(c.iso)}
140: onClick={() => pickProvince(u.nome)}
```

### qgsq

Ficheiro: `src/screens/create/QgsqScreen.tsx`

```tsx
26: <button onClick={() => navigate(-1)} aria-label="Voltar" style={chevronBtn}>
60: <PrimaryButton onClick={() => navigate("/" + nextStep("qgsq", draft.type))}>Confirmar célula</PrimaryButton>
```

### building

Ficheiro: `src/screens/create/BuildingScreen.tsx`

```tsx
78: <Toggle key={x} active={b.bloco === x} onClick={() => set({ bloco: x })}>
87: <Stepper onClick={() => pisoDelta(-1)}>–</Stepper>
91: <Stepper onClick={() => pisoDelta(1)}>+</Stepper>
129: <PrimaryButton onClick={() => navigate("/" + nextStep("building", draft.type))}>Continuar</PrimaryButton>
130: <GhostButton onClick={() => navigate("/buildingDir")}>Ver edifício</GhostButton>
```

### informal

Ficheiro: `src/screens/create/InformalScreen.tsx`

```tsx
11: const [newLandmark, setNewLandmark] = useState("");
47: <Switch on={draft.noNumber} onClick={() => dispatch({ type: "setNoNumber", value: !draft.noNumber })} />
88: onClick={() => dispatch({ type: "removeLandmark", id: l.id })}
120: onClick={() => dispatch({ type: "setEntryPhoto", value: !draft.hasEntryPhoto })}
164: <PrimaryButton onClick={() => navigate("/" + nextStep("informal", draft.type))}>Continuar</PrimaryButton>
```

### witnesses

Ficheiro: `src/screens/create/WitnessesScreen.tsx`

```tsx
15: const { saveGenerated } = useCitizenData();
17: const [code, setCode] = useState("");
18: const [saving, setSaving] = useState(false);
64: // Grava na conta do cidadão (quando há backend ligado). Em demo é no-op.
65: setSaving(true);
```

### home

Ficheiro: `src/screens/home/HomeScreen.tsx`

```tsx
18: const { configured, profile } = useAuth();
19: const { primary } = useCitizenData();
21: // Identidade: real (perfil da BD) ou demonstração.
26: // Morada principal: real, ou demo quando não há backend.
29: const showActivity = !configured; // atividade é dados de demonstração
```

### detail

Ficheiro: `src/screens/home/DetailScreen.tsx`

```tsx
15: const { configured, primary } = useCitizenData();
26: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
32: <button onClick={() => navigate("/share")} aria-label="Partilhar" style={iconBtn}>
167: <button onClick={() => navigate("/tenancy")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px" }}>
```

### identitiesMap

Ficheiro: `src/screens/home/IdentitiesMapScreen.tsx`

```tsx
38: setTimeout(() => map.invalidateSize(), 50);
45: const [filter, setFilter] = useState<Filter>("todas");
96: onClick={() => setFilter(f.id)}
140: onClick={() => navigate("/detail")}
```

### publicLookup

Ficheiro: `src/screens/home/PublicLookupScreen.tsx`

```tsx
8: const [code, setCode] = useState("AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001");
9: const [result, setResult] = useState<"verified" | "none" | null>(null);
20: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
37: <button onClick={lookup} style={{ border: "none", background: "#1A1814", color: "#E8C97A", font: "700 13px Inter", borderRadius: 14, padding: "0 18px", cursor: "pointer" }}>Consultar</button>
```

### language

Ficheiro: `src/screens/home/LanguageScreen.tsx`

```tsx
32: const [selected, setSelected] = useState("Português");
33: const [q, setQ] = useState("");
41: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
63: <button key={l.name} onClick={() => setSelected(l.name)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: on ? "#FBF2DC" : "#FFFDF9", border: on ? "1.5px solid #D4A853" : "1px solid #EAE3D7", borderRadius: 13, padding: "11px 13px" }}>
69: {l.downloaded ? (
```

### empty

Ficheiro: `src/screens/home/EmptyScreen.tsx`

```tsx
24: <button onClick={() => navigate("/type")} style={{ border: "none", width: "100%", height: 54, borderRadius: 16, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.6)" }}>
27: <button onClick={() => navigate("/howitworks")} style={{ border: "1.5px solid #E2D8C8", width: "100%", height: 54, borderRadius: 16, background: "transparent", color: "#1A1814", font: "600 14px Inter", cursor: "pointer" }}>
```

### buildingDir

Ficheiro: `src/screens/create/BuildingDirScreen.tsx`

```tsx
27: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
```

### changePhone

Ficheiro: `src/screens/home/ChangePhoneScreen.tsx`

```tsx
8: const [newNumber, setNewNumber] = useState("+244 936 110 244");
9: const [digits, setDigits] = useState(["7", "2", "1", "", "", ""]);
22: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
65: <PrimaryButton disabled={!complete} onClick={() => navigate("/profile")}>Confirmar novo número</PrimaryButton>
```

### trustedDevices

Ficheiro: `src/screens/home/TrustedDevicesScreen.tsx`

```tsx
15: const [biometric, setBiometric] = useState(true);
16: const [removed, setRemoved] = useState<Record<string, boolean>>({});
21: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
34: <Switch on={biometric} onClick={() => setBiometric((v) => !v)} />
52: <button onClick={() => setRemoved((m) => ({ ...m, [d.id]: true }))} style={{ all: "unset", cursor: "pointer", font: "700 12px Inter", color: "#D14B3A" }}>Remover</button>
```

### docs

Ficheiro: `src/screens/home/DocsSupportScreen.tsx`

```tsx
16: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
30: <button onClick={() => navigate("/manualDownload")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, background: "#1A1814", borderRadius: 16, padding: "14px 16px", color: "#F8F5F0" }}>
44: <button key={d.label} onClick={() => navigate(d.to)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 13, padding: "13px 14px" }}>
```

### certificate

Ficheiro: `src/screens/home/CertificateScreen.tsx`

```tsx
14: const [busy, setBusy] = useState(false);
15: const [done, setDone] = useState<string | null>(null);
18: setBusy(true);
54: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
109: <PrimaryButton onClick={download} disabled={busy}>
```

### addresses

Ficheiro: `src/screens/home/AddressesScreen.tsx`

```tsx
19: const { configured, addresses: rows } = useCitizenData();
20: const [filter, setFilter] = useState<Filter>("todas");
22: // Lista real do cidadão, ou dados de demonstração sem backend.
48: <button onClick={() => navigate("/type")} aria-label="Nova morada" style={addBtn}>
62: onClick={() => setFilter(c.id)}
```

### profile

Ficheiro: `src/screens/home/ProfileScreen.tsx`

```tsx
10: const { configured, profile, signOut } = useAuth();
11: // Em modo real usa o perfil da BD; em demo, a "Ana Cardoso".
27: const [biometric, setBiometric] = useState(true);
28: const [offline, setOffline] = useState(true);
90: <button onClick={() => navigate("/witnessRep")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 16, padding: "14px 16px" }}>
```

### wayfinding

Ficheiro: `src/screens/home/WayfindingScreen.tsx`

```tsx
41: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
79: <PrimaryButton onClick={() => { void request(); void locate(); }}>Iniciar guia</PrimaryButton>
```

### share

Ficheiro: `src/screens/home/ShareScreen.tsx`

```tsx
19: const [toast, setToast] = useState<string | null>(null);
23: setTimeout(() => setToast(null), 2200);
63: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
106: <ActionBtn label="Cartão PDF" onClick={pdf} icon={pdfIcon} />
107: <ActionBtn label="Link · SMS" onClick={sms} icon={smsIcon} />
```

### witnessRep

Ficheiro: `src/screens/home/WitnessRepScreen.tsx`

```tsx
25: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
```

### reverify

Ficheiro: `src/screens/risk/ReverifyScreen.tsx`

```tsx
18: const [done, setDone] = useState<Record<string, boolean>>({ resides: true, located: true });
26: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
56: onClick={() => setDone((d) => ({ ...d, [c.id]: !d[c.id] }))}
100: <PrimaryButton disabled={!requiredMet} onClick={() => navigate("/detail")}>
```

### riskAlerts

Ficheiro: `src/screens/risk/RiskAlertsScreen.tsx`

```tsx
55: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
88: <button onClick={() => navigate(al.to)} style={{ all: "unset", cursor: "pointer", font: "700 12.5px Inter", color: "#B0831F", marginTop: 10, display: "inline-block" }}>
```

### gpsHistory

Ficheiro: `src/screens/risk/GpsHistoryScreen.tsx`

```tsx
39: setTimeout(() => map.invalidateSize(), 50);
50: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
```

### notifications

Ficheiro: `src/screens/risk/NotificationsScreen.tsx`

```tsx
31: const [items, setItems] = useState(INITIAL);
36: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
42: <button onClick={() => setItems((xs) => xs.map((x) => ({ ...x, unread: false })))} style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: "#B0831F" }}>
53: onClick={() => {
```

### appeal

Ficheiro: `src/screens/risk/AppealScreen.tsx`

```tsx
8: const [reason, setReason] = useState(
11: const [photo, setPhoto] = useState(false);
12: const [sent, setSent] = useState(false);
17: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
54: onClick={() => setPhoto((v) => !v)}
```

### witnessProximity

Ficheiro: `src/screens/risk/WitnessProximityScreen.tsx`

```tsx
40: setTimeout(() => map.invalidateSize(), 50);
54: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
```

### household

Ficheiro: `src/screens/household/HouseholdScreen.tsx`

```tsx
11: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
51: <button onClick={() => navigate("/addMember")} style={{ border: "1.5px dashed #D4A853", background: "transparent", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: "#B0831F", cursor: "pointer" }}>
55: <button onClick={() => navigate("/householdCensus")} style={{ all: "unset", cursor: "pointer", textAlign: "center", font: "700 13px Inter", color: "#1A1814" }}>
```

### householdCensus

Ficheiro: `src/screens/household/HouseholdCensusScreen.tsx`

```tsx
12: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
71: <button onClick={() => navigate("/addMember")} style={{ flex: 1, border: "1.5px solid #D4A853", background: "#FBF2DC", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: "#B0831F", cursor: "pointer" }}>
74: <button onClick={() => navigate("/deceased")} style={{ flex: 1, border: "1.5px solid #EAE3D7", background: "#FFFDF9", borderRadius: 14, padding: "13px", font: "600 13px Inter", color: "#8A8073", cursor: "pointer" }}>
```

### addMember

Ficheiro: `src/screens/household/AddMemberScreen.tsx`

```tsx
24: const [rel, setRel] = useState<Relationship>("filho");
25: const [name, setName] = useState("Lúcia Cardoso");
26: const [dob, setDob] = useState("14/03/2014");
27: const [doc, setDoc] = useState("Cédula pessoal");
28: const [minor, setMinor] = useState(true);
```

### deceased

Ficheiro: `src/screens/household/DeceasedScreen.tsx`

```tsx
8: const [date, setDate] = useState("18/10/2026");
9: const [cert, setCert] = useState("OB-2026-30142");
10: const [done, setDone] = useState(false);
17: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
66: onClick={() => setDone(true)}
```

### operator

Ficheiro: `src/screens/field/OperatorScreen.tsx`

```tsx
69: onClick={() => navigate("/type")}
```

### offline

Ficheiro: `src/screens/field/OfflineScreen.tsx`

```tsx
10: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
41: onClick={() => navigate("/operator")}
```

### validatorInbox

Ficheiro: `src/screens/validator/ValidatorInboxScreen.tsx`

```tsx
53: <button key={q.code} onClick={() => navigate("/validatorReview")} style={{ all: "unset", cursor: "pointer", background: "#FFFDF9", border: "1px solid #EAE3D7", borderRadius: 14, padding: "12px 14px" }}>
```

### validatorReview

Ficheiro: `src/screens/validator/ValidatorReviewScreen.tsx`

```tsx
17: const [decision, setDecision] = useState<null | "approved" | "rejected">(null);
22: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
82: <button onClick={() => setDecision("rejected")} style={{ flex: 1, border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 15, height: 52, font: "700 14px Inter", color: "#D14B3A", cursor: "pointer" }}>Rejeitar</button>
83: <button onClick={() => setDecision("approved")} style={{ flex: 1.4, border: "none", background: "#2F7A57", borderRadius: 15, height: 52, font: "700 14px Inter", color: "#F5F0E8", cursor: "pointer" }}>Aprovar morada</button>
```

### aflRequests

Ficheiro: `src/screens/validator/AflRequestsScreen.tsx`

```tsx
13: const [removed, setRemoved] = useState<Record<string, "rej">>({});
18: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
57: <button onClick={() => setRemoved((m) => ({ ...m, [r.id]: "rej" }))} style={{ flex: 1, border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 11, height: 38, font: "700 12px Inter", color: "#D14B3A", cursor: "pointer" }}>Rejeitar</button>
58: <button onClick={() => navigate("/validatorReview")} style={{ flex: 1, border: "none", background: "#1A1814", borderRadius: 11, height: 38, font: "700 12px Inter", color: "#E8C97A", cursor: "pointer" }}>Rever</button>
```

### validationsDashboard

Ficheiro: `src/screens/validator/ValidationsDashboardScreen.tsx`

```tsx
18: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
54: <button onClick={() => navigate("/validatorInbox")} style={{ border: "1.5px solid #EAE3D7", background: "#FFFDF9", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: "#1A1814", cursor: "pointer" }}>
```

### authorityGps

Ficheiro: `src/screens/validator/AuthorityGpsScreen.tsx`

```tsx
10: const [confirmed, setConfirmed] = useState(false);
16: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
51: <PrimaryButton disabled={confirmed} onClick={() => setConfirmed(true)}>
```

### confirmWitness

Ficheiro: `src/screens/validator/ConfirmWitnessScreen.tsx`

```tsx
9: const [digits, setDigits] = useState(["9", "1", "4", "", "", ""]);
10: const [decision, setDecision] = useState<null | "ok" | "no">(null);
24: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
75: <button onClick={() => setDecision("no")} style={{ flex: 1, border: "1.5px solid #E2D8C8", background: "transparent", borderRadius: 15, height: 52, font: "700 14px Inter", color: "#D14B3A", cursor: "pointer" }}>Rejeitar</button>
76: <button disabled={!complete} onClick={() => setDecision("ok")} style={{ flex: 1.4, border: "none", background: complete ? "#2F7A57" : "#D9D2C6", borderRadius: 15, height: 52, font: "700 14px Inter", color: complete ? "#F5F0E8" : "#8A8073", cursor: complete ? "pointer" : "not-allowed" }}>Confirmar testemunho</button>
```

### foreigner

Ficheiro: `src/screens/foreign/ForeignerScreen.tsx`

```tsx
58: <PrimaryButton onClick={() => navigate("/lease")}>Continuar</PrimaryButton>
```

### lease

Ficheiro: `src/screens/foreign/LeaseScreen.tsx`

```tsx
10: const [occ, setOcc] = useState("Inquilino");
28: <button key={o} onClick={() => setOcc(o)} style={{ flex: 1, border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", background: on ? "#FBF2DC" : "#FFFDF9", borderRadius: 11, padding: "11px 4px", font: `${on ? 700 : 600} 12px Inter`, color: "#1A1814", cursor: "pointer" }}>
70: <PrimaryButton onClick={() => navigate("/authorityDeclaration")}>Continuar</PrimaryButton>
```

### authorityDeclaration

Ficheiro: `src/screens/foreign/AuthorityDeclarationScreen.tsx`

```tsx
11: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
57: <GhostButton onClick={() => navigator.share?.({ title: "Declaração SME", text: "PROT. SME-2026-09813 · AFROLOC AO-LUA-BEL-RAM-GEN-G10-X6AUQ-Y49HV-0001" })}>Partilhar</GhostButton>
60: <PrimaryButton onClick={() => navigate("/share")}>Descarregar</PrimaryButton>
```

### tenancy

Ficheiro: `src/screens/tenancy/TenancyScreen.tsx`

```tsx
50: onClick={() => dispatch({ type: "setTenancy", value: { occupancy: o } })}
159: <PrimaryButton onClick={() => navigate("/" + nextStep("tenancy", draft.type))}>Continuar</PrimaryButton>
```

### countryConfig

Ficheiro: `src/screens/admin/CountryConfigScreen.tsx`

```tsx
19: const [iso, setIso] = useState("AO");
20: const podpKpi = computeCycleKpi(demoSeries(podp), podp);
25: const [saved, setSaved] = useState(false);
68: <Switch on={enabled} onClick={() => { setEnabled(iso, !enabled); setSaved(false); }} />
110: <Switch on={podp.enabled} onClick={() => { setPodp({ enabled: !podp.enabled }); setSaved(false); }} />
```

### otp

Ficheiro: `src/screens/auth/OtpScreen.tsx`

```tsx
16: const { configured, pendingPhone, verifyPhoneOtp, sendPhoneOtp } = useAuth();
17: const [digits, setDigits] = useState(["", "", "", "", "", ""]);
18: const [seconds, setSeconds] = useState(45);
19: const [busy, setBusy] = useState(false);
20: const [error, setError] = useState<string | null>(null);
```

### login

Ficheiro: `src/screens/auth/LoginScreen.tsx`

```tsx
10: const { configured, signInEmail } = useAuth();
11: const [email, setEmail] = useState(configured ? "" : "ana.cardoso@email.ao");
12: const [pw, setPw] = useState(configured ? "" : "12345678");
13: const [show, setShow] = useState(false);
14: const [busy, setBusy] = useState(false);
```

### register

Ficheiro: `src/screens/auth/RegisterScreen.tsx`

```tsx
11: const { configured, signUpEmail } = useAuth();
12: const [name, setName] = useState("");
13: const [email, setEmail] = useState("");
14: const [pw, setPw] = useState("");
15: const [accepted, setAccepted] = useState(false);
```

### phoneLogin

Ficheiro: `src/screens/auth/PhoneLoginScreen.tsx`

```tsx
11: const { configured, sendPhoneOtp } = useAuth();
12: const [digits, setDigits] = useState(""); // 9 dígitos nacionais (sem +244)
13: const [busy, setBusy] = useState(false);
14: const [error, setError] = useState<string | null>(null);
22: navigate("/otp"); // modo demo
```

### presignup

Ficheiro: `src/screens/auth/PresignupScreen.tsx`

```tsx
26: const [method, setMethod] = useState<Method>("phone");
27: const [accepted, setAccepted] = useState(false);
32: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
44: <button key={o.id} onClick={() => setMethod(o.id)} style={{ textAlign: "left", display: "flex", gap: 14, alignItems: "center", padding: 16, borderRadius: 18, cursor: "pointer", background: on ? "#FBF2DC" : "#FFFDF9", border: on ? "2px solid #D4A853" : "1.5px solid #EAE3D7", position: "relative" }}>
61: <button onClick={() => setAccepted((a) => !a)} role="checkbox" aria-checked={accepted} style={{ width: 22, height: 22, flex: "none", marginTop: 1, borderRadius: 7, border: accepted ? "none" : "1.5px solid #C9BDA8", background: accepted ? "#D4A853" : "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
```

### forgotPassword

Ficheiro: `src/screens/auth/ForgotPasswordScreen.tsx`

```tsx
25: const [digits, setDigits] = useState(["5", "8", "2", "", "", ""]);
26: const [pw, setPw] = useState("Belas2026!");
27: const [confirm, setConfirm] = useState("Belas2026!");
42: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
77: <PrimaryButton disabled={!valid} onClick={() => navigate("/home")}>Repor e entrar</PrimaryButton>
```

### howitworks

Ficheiro: `src/screens/auth/HowItWorksScreen.tsx`

```tsx
16: <button onClick={() => navigate("/welcome")} style={{ all: "unset", cursor: "pointer", font: "600 13px Inter", color: "#A99E8C", padding: "8px 4px" }}>Saltar</button>
36: <button onClick={() => navigate("/presignup")} style={{ border: "none", width: "100%", height: 56, borderRadius: 16, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 16px Inter", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.5)" }}>
```

### adminDash

Ficheiro: `src/screens/admin/AdminDashScreen.tsx`

```tsx
50: <button onClick={() => navigate("/aflRequests")} style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: DARK.gold }}>Ver todos</button>
59: <button onClick={() => navigate(b.to)} style={{ border: "none", background: "var(--afl-grad-glow)", color: "#2D2519", font: "700 12px Inter", borderRadius: 10, padding: "8px 14px", cursor: "pointer" }}>Rever</button>
```

### users

Ficheiro: `src/screens/admin/UsersScreen.tsx`

```tsx
18: const [filter, setFilter] = useState("Todos");
34: <button key={f} onClick={() => setFilter(f)} style={{ border: on ? "none" : `1.5px solid ${DARK.line}`, background: on ? "var(--afl-grad-glow)" : "transparent", color: on ? "#2D2519" : DARK.muted, borderRadius: 18, padding: "7px 14px", font: `${on ? 700 : 600} 12px Inter`, cursor: "pointer" }}>{f}</button>
```

### roleApprovals

Ficheiro: `src/screens/admin/RoleApprovalsScreen.tsx`

```tsx
14: const [decided, setDecided] = useState<Record<string, "ok" | "no">>({});
41: <button onClick={() => setDecided((d) => ({ ...d, [p.id]: "no" }))} style={{ flex: 1, border: `1.5px solid ${DARK.line}`, background: "transparent", borderRadius: 11, height: 38, font: "700 12px Inter", color: DARK.danger, cursor: "pointer" }}>Recusar</button>
42: <button onClick={() => setDecided((d) => ({ ...d, [p.id]: "ok" }))} style={{ flex: 1, border: "none", background: DARK.greenDeep, borderRadius: 11, height: 38, font: "700 12px Inter", color: DARK.fg, cursor: "pointer" }}>Aprovar</button>
```

### securityAudit

Ficheiro: `src/screens/admin/SecurityAuditScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### security

Ficheiro: `src/screens/admin/SecurityScreen.tsx`

```tsx
25: <button key={i} onClick={() => navigate(e.to)} style={{ all: "unset", cursor: "pointer", background: DARK.card, border: `1px solid ${DARK.line}`, borderLeft: `4px solid ${sev.fg}`, borderRadius: 14, padding: "12px 14px" }}>
```

### fraudFlags

Ficheiro: `src/screens/admin/FraudFlagsScreen.tsx`

```tsx
16: const [done, setDone] = useState<Record<string, string>>({});
42: <button key={a} onClick={() => setDone((d) => ({ ...d, [f.id]: a === "Ignorar" ? "Ignorado" : a === "Suspender" ? "Suspenso" : "Em investigação" }))} style={{ flex: 1, border: `1.5px solid ${a === "Investigar" ? "transparent" : DARK.line}`, background: a === "Investigar" ? DARK.danger : "transparent", borderRadius: 10, height: 36, font: "700 11px Inter", color: a === "Investigar" ? DARK.fg : DARK.muted, cursor: "pointer" }}>{a}</button>
```

### reports

Ficheiro: `src/screens/admin/ReportsScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### adminLogin

Ficheiro: `src/screens/admin/AdminLoginScreen.tsx`

```tsx
9: const [email, setEmail] = useState("c.nguvu@gov.ao");
10: const [pw, setPw] = useState("12345678");
39: <button disabled={!valid} onClick={() => navigate("/admin2fa")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: valid ? "linear-gradient(135deg,#D4A853,#E07B2C)" : DARK.line, color: valid ? "#2D2519" : DARK.muted, font: "700 15px Inter", cursor: valid ? "pointer" : "not-allowed" }}>
```

### adminSetup

Ficheiro: `src/screens/admin/AdminSetupScreen.tsx`

```tsx
8: const [name, setName] = useState("Carlos Nguvu");
9: const [email, setEmail] = useState("c.nguvu@gov.ao");
10: const [twofa, setTwofa] = useState(true);
35: <button onClick={() => setTwofa((v) => !v)} role="switch" aria-checked={twofa} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: twofa ? DARK.greenDeep : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
48: <button onClick={() => navigate("/admin2fa")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
```

### admin2fa

Ficheiro: `src/screens/admin/Admin2faScreen.tsx`

```tsx
10: const [digits, setDigits] = useState(["4", "8", "", "", "", ""]);
51: <button disabled={!complete} onClick={() => navigate("/adminDash")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: complete ? "linear-gradient(135deg,#D4A853,#E07B2C)" : DARK.line, color: complete ? "#2D2519" : DARK.muted, font: "700 15px Inter", cursor: complete ? "pointer" : "not-allowed" }}>
```

### regionalMgmt

Ficheiro: `src/screens/admin/RegionalMgmtScreen.tsx`

```tsx
42: <button onClick={() => navigate("/roleApprovals")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", marginTop: 4 }}>
```

### setup

Ficheiro: `src/screens/admin/SetupScreen.tsx`

```tsx
48: {action && <button onClick={onAction} style={{ all: "unset", cursor: "pointer", font: "600 12px Inter", color: DARK.gold }}>{action}</button>}
```

### translationValidation

Ficheiro: `src/screens/admin/TranslationValidationScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### telecomOperators

Ficheiro: `src/screens/grid/TelecomOperatorsScreen.tsx`

```tsx
57: <button onClick={() => navigate("/cellTowers")} style={{ border: `1.5px dashed ${DARK.goldDeep}`, background: "transparent", borderRadius: 14, padding: "13px", font: "700 13px Inter", color: DARK.gold, cursor: "pointer" }}>
```

### cellTowers

Ficheiro: `src/screens/grid/CellTowersScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### importUrbanZones

Ficheiro: `src/screens/grid/ImportUrbanZonesScreen.tsx`

```tsx
55: <button onClick={() => navigate("/gridMgmt")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
```

### gridMgmt

Ficheiro: `src/screens/grid/GridMgmtScreen.tsx`

```tsx
11: const [province, setProvince] = useState("Luanda");
12: const [useUrban, setUseUrban] = useState(true);
13: const [gen, setGen] = useState(false);
53: <button onClick={() => setUseUrban((v) => !v)} role="switch" aria-checked={useUrban} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: useUrban ? DARK.greenDeep : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
61: <button onClick={() => setGen(true)} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
```

### importDivisions

Ficheiro: `src/screens/grid/ImportDivisionsScreen.tsx`

```tsx
12: const [imported, setImported] = useState<Record<string, boolean>>({ AO: true });
53: <button onClick={() => setImported((m) => ({ ...m, [c.iso]: true }))} disabled={done}
62: <button onClick={() => navigate("/continentalCoverage")} style={{ border: `1px solid ${DARK.line}`, background: DARK.card, borderRadius: 14, padding: "13px", font: "700 13px Inter", color: DARK.fg, cursor: "pointer" }}>
```

### continentalCoverage

Ficheiro: `src/screens/grid/ContinentalCoverageScreen.tsx`

```tsx
9: const [q, setQ] = useState("");
```

### certificationKpis

Ficheiro: `src/screens/metrics/CertificationKpisScreen.tsx`

```tsx
52: <button onClick={() => navigate("/kpisExport")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
```

### kpisExport

Ficheiro: `src/screens/metrics/KpisExportScreen.tsx`

```tsx
22: const [fmt, setFmt] = useState("pdf");
23: const [inc, setInc] = useState<Record<string, boolean>>({ "Cobertura por província": true, "Taxa de verificação": true, "Métricas de fraude": true });
24: const [done, setDone] = useState(false);
37: <button key={f.id} onClick={() => { setFmt(f.id); setDone(false); }} style={{ flex: 1, border: on ? "2px solid #D4A853" : `1.5px solid ${DARK.line}`, background: on ? "#332B1E" : DARK.card, borderRadius: 14, padding: "13px 6px", cursor: "pointer", color: DARK.fg }}>
52: <button onClick={() => { setInc((m) => ({ ...m, [label]: !m[label] })); setDone(false); }} role="switch" aria-checked={!!inc[label]}
```

### testEnvironment

Ficheiro: `src/screens/metrics/TestEnvironmentScreen.tsx`

```tsx
8: const [sandbox, setSandbox] = useState(true);
31: <button onClick={() => setSandbox((v) => !v)} role="switch" aria-checked={sandbox} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: sandbox ? DARK.warn : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
50: <button key={t.label} onClick={t.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: DARK.card, border: `1px solid ${DARK.line}`, borderRadius: 14, padding: "13px 15px" }}>
```

### addressTest

Ficheiro: `src/screens/metrics/AddressTestScreen.tsx`

```tsx
21: const [code, setCode] = useState("AO-ZU-G10-X6AUQ-Y49HV");
22: const [res, setRes] = useState<Resolution | null>(null);
52: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
63: <button onClick={resolve} style={{ border: "none", background: "#1A1814", color: "#E8C97A", font: "700 13px Inter", borderRadius: 14, padding: "0 18px", cursor: "pointer" }}>Resolver</button>
```

### tempAddress

Ficheiro: `src/screens/metrics/TempAddressScreen.tsx`

```tsx
15: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
51: <button onClick={() => navigate("/type")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.6)" }}>
```

### apiDocs

Ficheiro: `src/screens/api/ApiDocsScreen.tsx`

```tsx
53: <button onClick={() => navigate("/yamiooApi")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
```

### yamiooApi

Ficheiro: `src/screens/api/YamiooApiScreen.tsx`

```tsx
14: const [reveal, setReveal] = useState(false);
15: const [perms, setPerms] = useState<Record<string, boolean>>({ [PERMISSIONS[0]]: true, [PERMISSIONS[1]]: true });
36: <button onClick={() => setReveal((r) => !r)} style={{ border: "none", background: DARK.card, color: DARK.fg, font: "600 11px Inter", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>{reveal ? "Ocultar" : "Revelar"}</button>
46: <button onClick={() => setPerms((m) => ({ ...m, [p]: !m[p] }))} role="switch" aria-checked={!!perms[p]} style={{ width: 42, height: 25, borderRadius: 13, border: "none", background: perms[p] ? DARK.greenDeep : DARK.line, position: "relative", cursor: "pointer", flex: "none" }}>
58: <button onClick={() => navigate("/adminYamiooAgents")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer" }}>
```

### adminYamiooAgents

Ficheiro: `src/screens/api/AdminYamiooAgentsScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### landing

Ficheiro: `src/screens/web/LandingScreen.tsx`

```tsx
29: <button onClick={() => navigate("/presignup")} style={{ border: "none", height: 52, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", padding: "0 24px", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(212,168,83,.5)" }}>Criar a minha AFROLOC</button>
30: <button onClick={() => navigate("/howitworks")} style={{ border: "1.5px solid #3A332D", height: 52, borderRadius: 15, background: "transparent", color: "#F8F5F0", font: "600 15px Inter", padding: "0 22px", cursor: "pointer" }}>Como funciona</button>
34: {/* phone mockup card */}
```

### pricing

Ficheiro: `src/screens/web/PricingScreen.tsx`

```tsx
36: <button onClick={() => navigate("/presignup")} style={{ border: t.highlight ? "none" : "1.5px solid #E2D8C8", width: "100%", height: 46, borderRadius: 13, background: t.highlight ? "linear-gradient(135deg,#D4A853,#E07B2C)" : "transparent", color: t.highlight ? "#2D2519" : "#1A1814", font: "700 14px Inter", cursor: "pointer" }}>Começar</button>
```

### about

Ficheiro: `src/screens/web/AboutScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### faq

Ficheiro: `src/screens/web/FaqScreen.tsx`

```tsx
13: const [open, setOpen] = useState(0);
23: <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", width: "100%", boxSizing: "border-box" }}>
```

### contact

Ficheiro: `src/screens/web/ContactScreen.tsx`

```tsx
11: const [name, setName] = useState("Ana Cardoso");
12: const [email, setEmail] = useState("ana@email.ao");
13: const [msg, setMsg] = useState("Gostaria de saber como aderir como autoridade municipal…");
14: const [sent, setSent] = useState(false);
40: <button onClick={() => setSent(true)} style={{ border: "none", width: "100%", height: 50, borderRadius: 14, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", marginTop: 18 }}>
```

### install

Ficheiro: `src/screens/dist/InstallScreen.tsx`

```tsx
39: <button onClick={() => navigate("/appDownload")} style={{ all: "unset", cursor: "pointer", textAlign: "center", font: "600 13px Inter", color: "#A99E8C" }}>Prefiro a loja de apps</button>
```

### appDownload

Ficheiro: `src/screens/dist/AppDownloadScreen.tsx`

```tsx
10: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
29: <button onClick={() => navigate("/install")} style={{ border: "1.5px solid #D4A853", background: "#FBF2DC", borderRadius: 16, height: 54, font: "700 14px Inter", color: "#B0831F", cursor: "pointer" }}>
38: <button onClick={() => navigate("/sourceDownload")} style={{ all: "unset", cursor: "pointer", textAlign: "center", marginTop: "auto", paddingTop: 16, paddingBottom: 8, font: "700 13px Inter", color: "#B0831F" }}>
```

### sourceDownload

Ficheiro: `src/screens/dist/SourceDownloadScreen.tsx`

```tsx
15: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
46: <button onClick={() => navigate("/ipDocumentation")} style={{ all: "unset", cursor: "pointer", font: "400 12px Inter", color: "#8A8073", lineHeight: 1.45 }}>
```

### manualDownload

Ficheiro: `src/screens/dist/ManualDownloadScreen.tsx`

```tsx
15: <button onClick={() => navigate(-1)} aria-label="Voltar" style={iconBtn}>
50: <button onClick={() => navigate("/documentsHub")} style={{ border: "none", width: "100%", height: 54, borderRadius: 15, background: "linear-gradient(135deg,#D4A853,#E07B2C)", color: "#2D2519", font: "700 15px Inter", cursor: "pointer", marginTop: 4 }}>
```

### documentsHub

Ficheiro: `src/screens/docs/DocumentsHubScreen.tsx`

```tsx
23: <button key={c.title} onClick={() => navigate(c.to)} style={{ all: "unset", cursor: "pointer", background: "#FFFFFF", border: "1px solid #EAE3D7", borderRadius: 16, padding: 22 }}>
```

### adminDocLibrary

Ficheiro: `src/screens/docs/AdminDocLibraryScreen.tsx`

```tsx
15: const [filter, setFilter] = useState("Todos");
30: <button key={f} onClick={() => setFilter(f)} style={{ border: on ? "none" : "1.5px solid #E6DCCC", borderRadius: 18, padding: "7px 14px", font: `${on ? 700 : 600} 12px Inter`, cursor: "pointer", color: on ? "#2D2519" : "#8A8073", background: on ? "var(--afl-grad-glow)" : "transparent" }}>
```

### contractDownloads

Ficheiro: `src/screens/docs/ContractDownloadsScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### ipDocumentation

Ficheiro: `src/screens/docs/IpDocumentationScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### ipDrawings

Ficheiro: `src/screens/docs/IpDrawingsScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### patentClaims

Ficheiro: `src/screens/docs/PatentClaimsScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### gridSystemPdf

Ficheiro: `src/screens/docs/GridSystemPdfScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

### brandGuidelines

Ficheiro: `src/screens/docs/BrandGuidelinesScreen.tsx`

```tsx
Sem integração conclusiva nos indícios recolhidos.
```

