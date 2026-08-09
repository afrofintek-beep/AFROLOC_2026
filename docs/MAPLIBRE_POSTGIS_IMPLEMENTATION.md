# AFROLOC MapLibre + PostGIS implementation plan

## Outcome

Modernize the existing `AFROLOC_2026` application behind `app.afroloc.ao` without discarding its working screens. The result is a sovereign, provider-portable, offline-first territorial identity platform.

## Product boundary

AFROLOC owns:

- permanent territorial identity;
- the canonical AFROLOC code;
- verification state and provenance;
- privacy and access policy;
- spatial relationships and audit history.

OpenStreetMap-derived data supplies basemap context. MapLibre renders it. PostGIS stores authoritative AFROLOC spatial records. HERE/TomTom are optional routing adapters only.

## Current gaps found in the repository

1. `LiveMap.tsx` uses Leaflet and the public OSM raster tile endpoint.
2. The current SDK patterns issue/accept `X...-Y...` codes and optional four-digit sequences.
3. Address creation allocates a local sequence with an in-memory `Map`, which is not safe for production or offline reconciliation.
4. The README's current visible example conflicts with the founder-approved canonical example.
5. Map rendering, address identity, privacy policy and provider selection need explicit boundaries.

## Founder-approved canonical fixture

```text
AO-LDA-BELAS-GEN-G10-35A8-N250U
```

This exact value is a mandatory fixture. Segment meanings beyond what is formally documented must not be invented in code.

## Work packages

### WP0 — Baseline and decisions

- Capture current build/test/lint status.
- Document the deployed branch and environment.
- Add ADRs for code versioning, map provider boundary, spatial SRID and public privacy projection.
- Inventory Supabase migrations and production data before schema changes.

### WP1 — Codec v2 and compatibility

- Create a versioned `AddressCodeCodec` interface.
- Move existing patterns behind `legacyCodec`.
- Add `v2Codec` parser/normalizer with the golden fixture.
- Add an alias/resolution service keyed by immutable address UUID.
- Feature-flag v2 issuance until segment semantics and collision/check rules are signed off.
- Remove user-facing hard-coded legacy examples.

### WP2 — MapLibre provider layer

Suggested interface:

```ts
interface MapProviderConfig {
  styleUrl: string;
  attribution: string;
  maxZoom?: number;
  offlinePackPolicy?: "disabled" | "municipal" | "field";
}
```

- Add MapLibre GL.
- Implement an AFROLOC map component with marker, accuracy radius, QG/SQ polygon and privacy-safe layers.
- Read style URL from `VITE_MAP_STYLE_URL`.
- Add a development-only safe fallback.
- Remove production traffic to `tile.openstreetmap.org`.
- Add attribution and CSP documentation.

### WP3 — PostGIS domain schema

- Add PostGIS extension migration.
- Add core address, geometry, aliases, relationships, verification, evidence, LOCACCESS, outbox and audit tables.
- Add spatial indexes and normalized-code uniqueness.
- Add RLS and policy tests from the first migration.
- Generate/update Supabase TypeScript types.
- Implement privacy-safe database functions for public lookup and grant resolution.

### WP4 — Offline capture and synchronization

- Persist drafts and capture evidence in IndexedDB.
- Generate stable client UUID/idempotency keys.
- Sync through a server endpoint or Edge Function.
- Make retries idempotent.
- Surface conflicts for review.
- Keep map context optional: GPS/grid math must work without tile connectivity.

### WP5 — LOCACCESS

- Create, display, resolve and revoke time-bound access.
- Hash tokens at rest.
- Support expiry, start time, max uses, purpose and order reference.
- Return only the minimum spatial detail authorized.
- Audit reads and block replay, revocation and overuse.

### WP6 — Product integration

Use the existing screen inventory to support:

- map/search home;
- creation flow;
- wallet and private card;
- public privacy-safe card;
- field operator capture;
- validator queue;
- municipal dashboard;
- partner API.

Update QR content to use a resolver URL or signed/access-controlled payload, not embedded raw coordinates.

### WP7 — Quality and launch gate

- Codec property/fixture tests.
- RLS cross-user and anonymous tests.
- Map component and offline state tests.
- LOCACCESS expiry/revocation/replay tests.
- End-to-end create → sync → validate → share → revoke flow.
- Accessibility and low-bandwidth checks.
- CI: typecheck, test, lint, build.
- Staging migration rehearsal and rollback/runbook.

## Suggested first commits

1. `docs: define canonical code and migration boundaries`
2. `refactor: introduce versioned AFROLOC codecs`
3. `feat: add MapLibre provider adapter`
4. `feat: add PostGIS address foundation and RLS`
5. `feat: persist offline address outbox`
6. `feat: implement revocable LOCACCESS grants`
7. `test: cover privacy and end-to-end address lifecycle`
8. `docs: add deployment and operations runbook`

## Phase 1 exclusions

Do not include these until the foundation is accepted:

- live HERE/TomTom billing integration;
- nationwide imagery acquisition;
- cadastral ownership claims;
- automatic financial scoring;
- public exact-coordinate search;
- destructive conversion of legacy production records.

## Required product decisions before v2 issuance

1. Formal meaning of every segment in `AO-LDA-BELAS-GEN-G10-35A8-N250U`.
2. Authoritative administrative boundaries and update owner.
3. Whether `N250U` is a unit, sublocation, access, checksum-bearing token or another construct.
4. Collision and re-issuance rules when boundaries or labels change.
5. Public information returned for residential, commercial and institutional addresses.
