# AFROLOC Administrative Base — Claude Code Export

Purpose: initial import-ready administrative geography base for AFROLOC.

Important: this package treats official administrative layers separately from operational locality layers. Do **not** treat districts, bairros, zonas, aldeias or market/service points as communes unless a primary official or legal source confirms that classification.

## Package contents

- `admin_units.csv` — hierarchy-ready seed table.
- `countries.csv` — country seed table.
- `source_registry.csv` — source audit table.
- `admin_units.seed.json` — same seed as JSON.
- `afroloc_admin_schema.json` — JSON Schema for validation.
- `validation_rules.md` — data-governance rules for imports.
- `CLAUDE_CODE_IMPORT_PROMPT.md` — prompt/instructions to give Claude Code.

## Current seed coverage

- Angola / Luanda only, based on the Portal Oficial do Governo de Angola checked on 2026-06-26.
- Luanda is represented as province + 16 municipalities + verified communes where listed.
- Municipalities marked `Sem comunas` are not given fake commune children. Their local districts remain in `districts_or_localities`.

## Official sources

- https://governo.gov.ao/provincia/luanda
- https://mpla.ao/wp-content/uploads/2024/09/Lei14.24de5deSetembro.pdf
- https://files.lex.ao/presidente-da-republica/2024/decreto-presidencial-n-o-269-24-de-29-de-novembro/download/decreto-presidencial-n-o-269-24-de-29-de-novembro_presidente-da-republica_lex-ao.pdf
