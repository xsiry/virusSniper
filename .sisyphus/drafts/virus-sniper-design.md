# Draft: Virus Sniper Design + Config Alignment

## Requirements (confirmed)
- Produce a detailed design plan based on PRD + SPEC.
- PRD is authoritative; update schemas/*.schema.json and SPEC to match PRD.

## Technical Decisions
- Use PRD as source of truth; SPEC becomes derived.
- Align schema validation rules to PRD fields/constraints.
- Rename FormulaConfig to CombatFormulaConfig (schema/$id/config path).
- bossPhases uses addShield (bool) with speedMul/regenMul; weakPointMove kept as optional extension.
- EnemyArchetypeConfig adds hitShake (number, range 0..5, default 0).
- comboMistakeMul, gaugeA/B/C, pGamma, pQualityCoef become configurable with PRD defaults.
- weakPointStyle enum becomes crack/pulse/ring; colorTheme becomes string (no enum).

## Research Findings
- Repo currently contains docs and JSON schemas; no runtime code found.
- No assets/config JSON files detected.
- SPEC defines config paths, gameplay rules, formulas, and JSON Schemas.
- PRD defines gameplay goals, formulas, and config tables; includes fields not in schemas (e.g., hitShake, addShield).
- SPEC currently contains strict enums for weakPointStyle/colorTheme and includes pGamma/pQualityCoef in formulas and schema.

## Open Questions
- None (defaults accepted).

## Scope Boundaries
- INCLUDE: detailed design doc; schema/spec alignment; compatibility mapping strategy; validation pipeline updates.
- EXCLUDE: runtime gameplay implementation; art/asset production; full level data authoring.
