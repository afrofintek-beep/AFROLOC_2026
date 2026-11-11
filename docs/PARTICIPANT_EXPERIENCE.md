# Participant experience at app.afroloc.ao

Entry: /experiencia/. This entry imports only the experience bundle, not the main AFROLOC router, account login, developer gallery or background GPS sampler. The original application and /feira witness flow remain available separately.

The browser talks to the participant-only /api/experiencia-app bridge on natal.yamilook.com. The bridge allows the exact app.afroloc.ao origin, strips all team cookies and native identities, and accepts only catalogue, holder list/create/grant/revoke/close and scoped visitor LOCACCESS operations. An independent private recovery key identifies the holder. Existing Feira keys recover existing records.

Temporary addresses use the canonical codec and administrative catalogue already deployed in the Feira adapter. They are private experimental records, not officially certified residence records. The existing team reviews the same requests in the Feira organisation queue. Approval makes time-limited sharing available. No direct afroloc.ao UI is opened.

A grant records the recipient label, intended use and expiry. The link itself is a bearer credential: the label does not verify the recipient's identity. Only hashed link tokens are stored by the backend. The holder can revoke each grant or close the address. This adapter implements the experimental LOCACCESS path; it does not claim a new central LOCACCESS account or official certification.

The recipient stays on /experiencia/#acesso=... and explicitly opens an embedded NJILA view. NJILA accepts messages only from its app.afroloc.ao parent and uses a random, per-document audience. It resolves the grant directly with LOCACCESS and renders the authorized point using its existing MapView. Exact coordinates are not put in navigation URLs or browser storage. The embedded view mounts no search or routing subsystem. Online leases last at most 60 seconds; revalidation runs every 15 seconds. Denial, expiry, offline/hidden state and closure clear the point. Revocation cannot erase a location already observed by a person.

Backend: Sites v60, source e5b7e152fe2d7868192e7b3c99ad12f9ead4dc7b. NJILA: PR25 merged. App: PR5 targets feat/witness-identity-sms-review to retain the current canonical services and witness implementation rather than the older main branch. Domain publication must use this complete app source and preserve its existing environment variables.

Verification: npm run test:experience and npm run build in this app; experience-app, registration and review-map tests in Feira; embedded map and review tests plus production build in NJILA. Browser preview was unavailable in this run. Final custom-domain verification is still required.
