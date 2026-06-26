# Claude Code Import Prompt — AFROLOC Administrative Base

You are implementing the AFROLOC administrative geography module.

Use the files in this folder as the seed package.

Tasks:
1. Create database tables or models for:
   - countries
   - admin_units
   - source_registry
   - admin_unit_source_links if needed later
   - afroloc_cells later, separated from admin_units
2. Import `countries.csv`, `admin_units.csv`, and `source_registry.csv`.
3. Validate imported records against `afroloc_admin_schema.json`.
4. Enforce parent-child integrity:
   - each child must reference an existing parent_unit_id;
   - admin_level must be parent admin_level + 1, except where a country/province root strategy is intentionally defined.
5. Do not turn `districts_or_localities` into communes automatically.
6. Add tests:
   - Luanda province has 16 municipality children.
   - Cacuaco has commune children Cacuaco and Kikolo.
   - Cazenga has commune children Cazenga and Kima Kieza.
   - Municipalities marked `Sem comunas` have no commune children.
7. Expose API endpoints:
   - GET /countries
   - GET /admin-units?country=AO&level=1
   - GET /admin-units/:unit_id/children
   - GET /admin-units/search?q=
8. Keep source_url and source_date_checked visible in admin/debug responses.

Data caveat:
This is a structured seed for Angola/Luanda only. The full 54-country African database should be loaded incrementally using the same schema and validation rules.
