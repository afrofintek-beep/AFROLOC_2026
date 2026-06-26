# AFROLOC Administrative Data Validation Rules

1. Primary hierarchy:
   Country → Province/State/Region → Municipality/County → Commune → District/Locality → Neighbourhood/Village → AFROLOC Cell.

2. Never downgrade or upgrade a unit type by assumption.
   Example: if the official portal says a municipality has “Sem comunas”, create the municipality only and store districts/localities separately.

3. Every record must have:
   - `unit_id`
   - `parent_unit_id` unless country/province root
   - `country_code_iso2`
   - `admin_level`
   - `official_name`
   - `unit_type`
   - `status`
   - `source_url`
   - `source_date_checked`

4. Code policy:
   - `unit_id` is an internal AFROLOC identifier.
   - Do not claim it is the official state code unless the official codification is loaded.
   - When MAT/INE official codes are obtained, add fields such as `official_code`, `mat_code`, `ine_code` without replacing existing `unit_id`.

5. Status values:
   - `verified_official_portal`: from government portal or ministry source.
   - `verified_legal`: from law/decree/official gazette.
   - `pending_mat_ine_confirmation`: needs MAT/INE confirmation.
   - `legacy_to_review`: inherited from old lists, CityPopulation, Wikipedia or field data.
   - `deprecated`: obsolete after DPA reform.

6. Conflict handling:
   - Primary legal source beats public database.
   - MAT/INE dataset beats secondary websites.
   - If sources conflict, keep both in source audit and mark data as `pending_mat_ine_confirmation`.

7. AFROLOC app design:
   - Administrative hierarchy must be kept separate from geocoding grid cells.
   - A cell may map to multiple administrative units if it crosses boundaries; handle with a join table.
