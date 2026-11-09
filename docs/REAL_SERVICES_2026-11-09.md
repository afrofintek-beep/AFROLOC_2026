# Operational services on the original AFROLOC interface

Base: selected deployment dist-p4ge2m63q (e24116ce), with the previously prepared restoration of the full application at `/` and the fair at `/feira/` (4c5d14a0).

## Implemented in this change

- Adds `#/services`; it was not a registered component in the selected source revision.
- Uses canonical `afroloc_records`, `profiles.user_id`, `countries` and `administrative_divisions` from the same Supabase project as afroloc.ao.
- Owned address listing, record-specific details, label editing, actual map coordinates, QR/link sharing and profile name editing. Null scores/dates remain unknown; approval is not described as certification.
- Address creation checks administrative selection, obtains a code from the official `qg-engine`, and saves a draft. No local code fallback, invented witnesses, EXIF or ATS. Failed saves cannot navigate to a success page. Account approval is required in the UI and creation adapter; database RLS remains authoritative.
- Public lookup calls `afroloc_public_lookup`; a plausible format does not establish a record's existence. Public output excludes personal identity and exact coordinates.
- Reuses working email/phone authentication; removes demo login bypasses and corrects `full_name` signup metadata. Recovery opens the existing canonical recovery flow.
- Removes background presence sampling against a hard-coded house.
- Removes fabricated time, network and battery readings from the operational frame.
- Preserves original design markup in a labelled, inert reference gallery. No original prototype component is mounted by operational routing. Unsupported routes cannot show simulated successful operations.
- Maintains existing fair frontend/backend. Three witnesses, 500 m, same condominium and official review are specific to the fair. No changes to other validation policies.

## Explicit boundaries

Native in this interface: catalogue, home, addresses, create, detail/rename, map, public lookup, sharing, profile, auth.

Links to existing source-platform routes: official validation, certificates/documents, account security, validators, administration and specialised panels. These are links, not newly implemented or end-to-end audited integrations.

Still pending native integration and real end-to-end verification: household, tenancy, foreign-residence declarations, offline field operation, notifications, appeals, carrier integrations and other specialised prototype screens. The UI lists the state of each catalogue entry.

Address creation does not allocate a postal box or issue a certificate. Those workflows remain on the origin platform. No claims about bank or government acceptance have been added.

## Validation

- `node --test tests/canonical-api.test.mjs tests/entry-routing.test.mjs`: 12 passing tests, including owner scoping, no-session access, real read errors, public lookup absence/error, official code issuance, failed-codec write refusal, invalid administrative selection, account approval, coordinates, apartment unit and safe rename.
- `NODE_ENV=production node --test tests/live-render.test.mjs`: 5 passing render tests for empty/loading/error/actual-state separation and service availability labels. Fixtures are in the test process only.
- `npm run build`: TypeScript and production Vite build passed.
- Production read-only SQL under `anon`: lookup for an unregistered code returned zero rows.
- Security advisors reviewed; no database grants, policies or schema changed in this patch.
- No production registration, SMS, certification or witness was created for testing.
- Browser could inspect the selected deployed login, but cannot reach this workspace's local preview (connection refused). Full browser acceptance remains pending deployment.

## Deployment status and next verification

Not deployed. The Vercel connector returns 404 for the known `dist` project ID in the known team; the authenticated dashboard can see it. This is an access limitation, not a failed application build. The selected deployment URL is an immutable historical deployment; publishing must produce a new deployment before updating `app.afroloc.ao`.

After scoped Vercel access is restored: deploy this branch, keep `/feira/` and legacy witness query links, then test sign-in, actual owned records, creation and reload using an authorised real resident, public lookup state, profile changes, official validator access, SMS delivery and the three-witness distance/condominium constraints. Official validator names/contacts still require real designation; do not seed them as approved users.
