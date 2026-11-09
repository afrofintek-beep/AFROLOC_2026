# Restore the original AFROLOC application

The Christmas fair interface accidentally occupied the main app URL. Restore src/App.tsx and the original application bootstrap byte-for-byte from the previously deployed source e24116ce8483612a00afc8aee6b1dc63643e4dd9. The complete original router, screen catalogue and providers remain the default.

The fair flow is retained in FairApp.tsx and loaded only on /feira (including /feira/) or an existing SMS link carrying the witness query parameter. New navigation from natal.yamilook.com points to /feira/. This does not change the shared verification backend or the prior factuality audit of the original screens.

Validation: production TypeScript/Vite build and entry selection regression checks. No identities, records or privileges changed.
