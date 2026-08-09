# CLAUDE.md — AFROLOC 2026

## Mission

Maintain and evolve the official AFROLOC product currently represented by `https://www.afroloc.ao/landing`. Build `app.afroloc.ao` as the operational application surface of this same product and repository, not as a separate greenfield product.

Source-of-truth hierarchy:

1. Founder-approved AFROLOC domain decisions and canonical nomenclature.
2. Existing official product behavior and visual identity at `https://www.afroloc.ao/landing`.
3. The working implementation in this repository.
4. This implementation plan.

Preserve the official landing experience, brand, public navigation and working routes. New map, address, privacy and institutional capabilities must integrate into the existing product. Do not replace the official landing page with a generic dashboard.

## Product separation: AFROLOC and NJILA

The approved brand source is **NJILA Brand Identity Manual 2026 — Master Edition 1.0, August 2026**. Read `docs/NJILA_BRAND_IMPLEMENTATION.md` before implementing any NJILA UI. The PDF/manual and approved vector assets outrank developer-created visual interpretations.

- **AFROLOC** is the sovereign identity, addressing, verification, privacy and access-control layer.
- **NJILA** is the mapping, wayfinding, routing and circulation product for places with weak or absent conventional toponymy.
- Official NJILA domain: `https://njilamaps.com`.
- MapLibre, OpenStreetMap-derived basemaps and optional HERE/TomTom routing adapters belong behind the NJILA capability boundary.
- AFROLOC may embed or consume NJILA maps through a provider-neutral internal SDK/API, but AFROLOC must not be renamed to NJILA and NJILA must not issue or own AFROLOC identities.

AFROLOC is not a generic map or a Google/Apple Maps clone. It is a sovereign territorial identity system that turns a real place into a verifiable, privacy-controlled and economically useful digital address.

Core principle:

> A localização permanece privada. O acesso é que pode ser autorizado.

## Non-negotiable product decision: canonical AFROLOC code

The canonical visible address supplied by the founder is:

```text
AO-LDA-BELAS-GEN-G10-35A8-N250U
```

Do not generate examples such as `AO-LUA-CAC-KKL-A7X9`.
Do not silently keep the current visible `X...-Y...-0001` format as canonical.
Do not infer or rename code segments without a signed domain specification.

Treat the canonical code as a versioned domain identifier, not as a UI-formatted coordinate. Keep exact original casing normalized to uppercase and hyphen separators. Coordinates and internal grid indexes are private data and must not be exposed merely because someone knows an AFROLOC code.

The current repository supports older standard/nomenclature formats. Preserve backward resolution during migration, but all newly issued user-facing addresses must use the canonical v2 codec after the domain rules and fixtures are approved.

Required golden fixture:

```text
AO-LDA-BELAS-GEN-G10-35A8-N250U
```

The fixture must parse, normalize, validate, serialize and round-trip without mutation.

## Existing system: inspect before editing

This is an existing React 18 + Vite + TypeScript + Capacitor PWA. It contains:

- a large screen catalogue and idiomatic React screens;
- Leaflet/OpenStreetMap rendering in `src/components/ui/LiveMap.tsx`;
- AFROLOC SDK code under `src/lib/afroloc/`;
- address creation state and workflows;
- optional Supabase integration;
- offline/PWA and field-operation foundations;
- ATS, validation, QR, household, administration and API screens.

Before making changes:

1. Read `README.md`, `package.json`, `src/App.tsx`, `src/lib/afroloc/`, `src/lib/qgsq.ts`, `src/state/`, `src/screens/registry.tsx` (or equivalent registry), Supabase files and tests.
2. Run the current tests, lint and production build.
3. Record the baseline failures separately from failures introduced by the work.
4. Preserve branded screens and working flows unless a migration explicitly replaces them.
5. Never commit credentials, production data, private coordinates or service-role keys.

## Target architecture

### NJILA map rendering boundary

Create a provider-neutral NJILA map adapter inside the current integration phase, with the extraction path to the `njilamaps.com` product/repository documented. Avoid hard coupling AFROLOC domain logic to a map vendor or to NJILA UI components.

Migrate the application map renderer from Leaflet to MapLibre GL JS / MapLibre Native-compatible patterns.

- Use OpenStreetMap-derived vector data through a configurable tile/style endpoint.
- Never use `tile.openstreetmap.org` as the production tile backend.
- Configure public client endpoints through environment variables.
- Keep map provider concerns behind an adapter so MapTiler, Stadia, self-hosted tiles or another MapLibre-compatible provider can be switched without changing product screens.
- HERE or TomTom may be optional adapters for advanced routing/traffic only. They must not become the source of truth for AFROLOC identities.
- Show required attribution.
- Support low-bandwidth and offline field capture; address/grid derivation must work without a network.

### Spatial backend

Use Supabase PostgreSQL with PostGIS as the production spatial source of truth.

Minimum entities:

- `profiles`
- `afroloc_addresses`
- `afroloc_code_aliases`
- `address_geometries`
- `address_evidence`
- `address_relationships`
- `address_verifications`
- `locaccess_grants`
- `field_capture_batches`
- `sync_outbox`
- `audit_events`

Requirements:

- UUID internal identifiers; AFROLOC code is a unique versioned business identifier.
- PostGIS `geography` or justified `geometry` types with explicit SRID.
- Point, cell and optional boundary stored separately from the public card.
- RLS enabled on every user or location-bearing table.
- Public lookup returns a privacy-safe projection, never raw private coordinates by default.
- Append-only audit trail for code issue, alias, verification, access grant, revocation and sensitive reads.
- Idempotency keys for offline sync and address issuance.
- No client-side `COUNT()+1` sequence allocation in production.

### Offline-first

- IndexedDB outbox for field captures.
- Stable client-generated UUID and idempotency key.
- Conflict-aware server reconciliation.
- Downloadable municipal/field map packs where licensing permits.
- Clear states: local draft, queued, syncing, conflict, server accepted, verification pending, verified.
- Never claim an offline draft is certified.

### Privacy and LOCACCESS

LOCACCESS is a revocable capability, separate from the permanent AFROLOC code.

A grant must support:

- purpose;
- recipient or bearer token;
- start and expiry;
- maximum uses;
- optional delivery/order reference;
- revocation;
- audit of each resolution;
- scope-limited output (route endpoint, approximate area, or exact destination as authorized).

Store only a hash of bearer tokens. Exact coordinates must be returned only when policy and active grant allow it.

## Product routes for the first production slice

Keep existing routing compatible, but establish these product capabilities:

- home/search map;
- create address;
- address wallet;
- private address detail;
- privacy-safe public lookup;
- LOCACCESS create/read/revoke;
- validator review;
- field operator/offline queue;
- municipal coverage dashboard;
- partner API documentation.

Use existing screens where suitable. Do not rebuild 95 screens merely to change the renderer.

## Canonical codec migration

Implement a versioned codec boundary:

- `legacy`: resolves existing codes already stored or shown by the app;
- `v2`: issues the canonical format;
- alias table maps legacy code to immutable address UUID and canonical code;
- parsing and validation are pure and shared between client/server;
- rendering never reconstructs a code from labels ad hoc;
- the database enforces normalized uniqueness.

Before issuing v2 codes in production, create a domain decision record that defines each segment, its allowed character set, administrative source, grid derivation, collision behavior and checksum/error-detection rule. Until that specification is approved, ship the v2 parser/fixture and migration boundary behind a feature flag; do not invent live codes.

## Security rules

- Deny by default with Supabase RLS.
- Public anon key may be used client-side; service-role keys are server-only.
- Rate-limit lookup, token resolution and address creation.
- Validate GPS accuracy and evidence server-side; client checks are UX only.
- Strip EXIF not required after verification.
- Encrypt or tightly restrict sensitive evidence.
- Do not expose owner phone, identity, household, witnesses or exact geometry in public search.
- Log security-sensitive actions without logging bearer tokens or raw secrets.
- Add abuse tests for enumeration, expired/revoked LOCACCESS, cross-user reads and replayed offline submissions.

## Delivery method

Work in small reviewable commits. Recommended order:

1. Baseline audit and architecture decision records.
2. Canonical codec v2 boundary, fixture tests and legacy resolver.
3. Map provider interface and MapLibre migration.
4. PostGIS migrations, RLS policies and generated TypeScript types.
5. Address repository/service layer; remove production dependence on mocks/local sequence.
6. Offline outbox and idempotent sync.
7. LOCACCESS end-to-end.
8. Product screen integration.
9. Security, accessibility, performance and end-to-end acceptance tests.
10. Deployment/runbook updates.

Do not rewrite the entire application in one commit.

## Definition of done for each change

- TypeScript strict checks pass.
- Unit tests pass.
- Production build passes.
- New migrations are reversible where practical and contain RLS.
- Mobile-sized and desktop layouts are checked.
- Keyboard navigation and visible focus are preserved.
- Loading, empty, offline, permission-denied and failure states are implemented.
- No map-provider secret is bundled in the client.
- No private coordinate leaks into logs, QR payloads, analytics or public APIs.
- Documentation and `.env.example` are updated.

## Phase 1 acceptance criteria

Phase 1 is complete when:

1. The golden canonical code round-trips exactly.
2. Legacy codes remain resolvable through aliases without being issued to new users.
3. The visible map uses MapLibre through a provider adapter.
4. Production does not call the public OSM tile server.
5. A user can create an offline draft and safely synchronize it once.
6. PostGIS stores the authoritative point/cell and RLS blocks another user.
7. A public lookup does not reveal raw coordinates.
8. LOCACCESS grants exact access only while valid and authorized.
9. Revocation, expiry, maximum-use and replay tests pass.
10. CI runs typecheck, tests, lint and build.

## Stop conditions

Pause and request a founder/product decision instead of guessing when:

- segment semantics for the v2 code are not documented;
- the authoritative Angola administrative dataset is unclear;
- an existing production database would need destructive migration;
- a map/data license conflicts with storage or offline use;
- privacy policy would permit public exact-coordinate disclosure;
- a feature would alter the patented/canonical AFROLOC algorithm.
