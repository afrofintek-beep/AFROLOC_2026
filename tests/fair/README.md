# Verificação factual para a feira

Run `npm ci --prefix tests/fair && npm test --prefix tests/fair` (Node 22.13+).

Tests execute the deployed SQL logic in a local PGlite PostgreSQL database, with synthetic fixtures only. They cover ownership, validator jurisdiction and contact activation, expiry/revocation, condominium membership, coordinates, 500 m boundaries, three separate OTP signatures and certification gates. No production resident or SMS is created by these tests.

`base-witness.sql` is the existing production prerequisite migration, copied from afroc_app26 for repeatable regression tests. The actual release migration only adds fair verification and updates the existing witness RPC conditionally for enrolled records.
