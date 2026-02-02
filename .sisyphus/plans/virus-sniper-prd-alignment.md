# Virus Sniper PRD-Aligned Design and Schema Sync

## TL;DR

> **Quick Summary**: Align docs/SPEC.md and all JSON schemas to the PRD as the single source of truth, while producing a detailed system design and a validation pipeline that enforces PRD-aligned configs.
>
> **Deliverables**:
> - Updated `docs/SPEC.md` fully aligned to PRD field names, enums, examples, and formulas
> - Updated schemas: `schemas/LevelConfig.schema.json`, `schemas/EconomyConfig.schema.json`, `schemas/EnemyArchetypeConfig.schema.json`, `schemas/VariantConfig.schema.json`, plus renamed `schemas/CombatFormulaConfig.schema.json`
> - Alignment appendix mapping PRD fields/formula variables to schema fields
> - Automated validation commands (CI-ready) that fail with explicit CONFIGS_MISSING when configs are absent
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Mapping Matrix → Schema Updates → SPEC Updates → Validation Pipeline

---

## Context

### Original Request
Read PRD and SPEC, generate a detailed design plan, and use PRD as authoritative by synchronizing schemas and SPEC content to PRD.

### Interview Summary
**Key Discussions**:
- PRD is authoritative; SPEC and schemas must be updated to match PRD.
- Alignment defaults accepted: FormulaConfig renamed to CombatFormulaConfig; bossPhases uses addShield(bool); hitShake added; comboMistakeMul/gaugeA/B/C/pGamma/pQualityCoef configurable; weakPointStyle enum = crack/pulse/ring; colorTheme becomes string.

**Research Findings**:
- Repo has only docs and schemas; no runtime code or `assets/config/*.json` found.
- SPEC contains strict schema constraints and fields not in PRD (shieldAdd, pGamma/pQualityCoef as schema fields, enums).

### Metis Review
**Identified Gaps (addressed)**:
- Validation environment: default to Node + Ajv (CI-friendly for TS/Cocos).
- Backward compatibility: assume none (no configs present); add conditional handling if configs appear.
- PRD example numbers: only treat as defaults when PRD explicitly says "recommended"; otherwise mark as user-approved or leave unset.

---

## Work Objectives

### Core Objective
Produce a PRD-aligned technical design and ensure all schema/spec artifacts match PRD fields, naming, and formula definitions, with automated validation.

### Concrete Deliverables
- `docs/SPEC.md` updated to PRD-aligned naming, formulas, and schema blocks
- `schemas/CombatFormulaConfig.schema.json` (renamed + updated)
- PRD alignment appendix (inside SPEC)
- Validation commands with explicit "CONFIGS_MISSING" handling

### Definition of Done
- [ ] SPEC references CombatFormulaConfig and PRD-aligned field names/enums
- [ ] All schemas match PRD field list and defaults
- [ ] No references to FormulaConfig or shieldAdd remain
- [ ] Validation commands run and report success (or CONFIGS_MISSING when configs are absent)

### Must Have
- PRD is the single source of truth
- Schema/spec naming and fields match PRD tables/examples
- Validation pipeline exists for CI use
- Any non-PRD defaults/bounds are tagged as user-approved in the alignment appendix

### Must NOT Have (Guardrails)
- No gameplay/runtime implementation
- No new mechanics beyond PRD/SPEC scope
- No changes outside docs/schemas/config validation unless required for alignment

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no package.json or test config detected)
- **User wants tests**: Automated verification only
- **Framework**: Node + Ajv 8 (default)

### Automated Verification Only (No User Intervention)
All checks must be command-line executable. Node + Ajv is required for the verification scripts.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1:
└── Task 1: PRD → SPEC/Schema alignment matrix

Wave 2 (after Wave 1):
├── Task 2: Update schemas (rename + field alignment)
└── Task 3: Update SPEC (paths, schema blocks, formulas)

Wave 3 (after Wave 2):
└── Task 4: Validation pipeline (no example configs)

Critical Path: Task 1 → Task 2 → Task 3 → Task 4
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 4 | 3 |
| 3 | 1 | 4 | 2 |
| 4 | 2, 3 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|--------------------|
| 1 | 1 | delegate_task(category="writing", load_skills=["6A"], run_in_background=false) |
| 2 | 2, 3 | delegate_task(category="quick", load_skills=["6A"], run_in_background=true) |
| 3 | 4 | delegate_task(category="unspecified-low", load_skills=["6A"], run_in_background=false) |

---

## TODOs

- [ ] 1. Build PRD → SPEC/Schema alignment matrix

  **What to do**:
  - Extract every field and formula variable from PRD config tables and formula sections
  - Map each item to schema field names and SPEC sections
  - Add an "Alignment Appendix" section to `docs/SPEC.md` listing all mapped fields, defaults, and a `Source` tag

  **Source Tags (must use one per field/default/bound)**:
  - `PRD`: directly stated in PRD tables or rules
  - `PRD-Recommended`: labeled as recommended defaults in PRD
  - `PRD-Formula`: constant appears in a PRD formula and is mapped to a config field
  - `User-Approved`: explicitly approved in planning conversation
  - `Derived`: engineering constraint not stated in PRD (must be explicitly justified)

  **Alignment Appendix Structure**:
  - Location: `docs/SPEC.md` under "3. Data Contracts" after "3.1 Common definitions"
  - Required columns: `Field | Config | Required | Default | Bounds | Source | PRD Ref | Schema Path`
  - Example row:
    - `comboMistakeMul | CombatFormulaConfig | required | 0.4 | - | PRD-Formula | 4.2 失误惩罚（硬核） | $.properties.comboMistakeMul`

  **Formula Mapping Rules (explicit)**:
  - PRD Δg formula constants `0.035/0.03/0.02` map to `gaugeA/gaugeB/gaugeC`
  - PRD p_super formula constants `0.5/0.25` map to `pGamma/pQualityCoef`
  - PRD combo mistake constant `0.4` maps to `comboMistakeMul`

  **Schema Policy Rules (apply to ALL fields)**:
  - Required vs Optional: if PRD table lists a field with no optional marker, treat as required; feature-flagged fields remain conditional (as in existing schemas)
  - Bounds/Defaults: use PRD values when explicitly stated; if PRD is silent, keep existing schema bounds/defaults only when tagged `Derived` or `User-Approved` in the appendix; otherwise remove defaults/bounds
  - Fields not present in PRD tables or narrative: remove unless explicitly tagged `User-Approved`

  **Retained Defaults/Bounds List (only these are allowed when PRD is silent)**:
  - `bossPhases.addShield` default=false (User-Approved)
  - `hitShake` bounds 0..5 and default=0 (User-Approved)
  - EconomyConfig drop defaults (PRD-Recommended, 6.2 EconomyConfig（硬核推荐默认）):
    - dropCoinP0=0.22, dropCoinPMax=0.55
    - dropShardP0=0.04, dropShardPMax=0.12
    - dropCardP0=0.015, dropCardPMax=0.04
    - superNeedlePBase=0.008, superNeedlePMin=0.003, superNeedlePCap=0.05
    - gaugeCarryFail=0.2
  - CombatFormulaConfig defaults (PRD-Formula, 4.1/4.3/4.4/4.6 数值规则):
    - comboBase=1.15, comboDecayPerLevel=0.01, comboMin=0.75
    - comboMistakeMul=0.4
    - M_alpha=0.8, M_k=10
    - Q_comboMaxCoef=0.08, Q_qualityCoef=0.15, Q_min=0.4, Q_max=2.0
    - regen_delta=1.6, regen_eta=0.8
  - EconomyConfig formula constants (PRD-Formula, 4.5 超级针（概率+保底）):
    - gaugeA=0.035, gaugeB=0.03, gaugeC=0.02
    - pGamma=0.5, pQualityCoef=0.25

  **Must NOT do**:
  - Do not introduce new mechanics beyond PRD
  - Do not change PRD content

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Requires structured documentation and mapping clarity
  - **Skills**: `["6A"]`
    - `6A`: Planning workflow and structured documentation
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:
  - `docs/《病毒狙击》PRD & 配置表说明（V1·硬核向）.md` - authoritative field list and formulas
  - `docs/SPEC.md` - target for alignment appendix and synchronized rules
  - `schemas/LevelConfig.schema.json` - current field set to compare against PRD
  - `schemas/EconomyConfig.schema.json` - current field set to compare against PRD
  - `schemas/FormulaConfig.schema.json` - rename target and field adjustments

  **WHY Each Reference Matters**:
  - PRD provides the authoritative field names, defaults, and formula constants
  - SPEC is the engineering contract that must be updated to reflect PRD
  - Schemas define strict validation and must match PRD fields and defaults

  **Acceptance Criteria**:
  - [ ] `docs/SPEC.md` contains a new "Alignment Appendix" section
  - [ ] Appendix lists every PRD field + default + `Source` tag and its schema mapping
  - [ ] Appendix header row matches: Field | Config | Required | Default | Bounds | Source | PRD Ref | Schema Path

  **Commit**: NO

- [ ] 2. Update schemas to PRD-aligned fields and names

  **What to do**:
  - Rename `schemas/FormulaConfig.schema.json` → `schemas/CombatFormulaConfig.schema.json`
  - Update `$id` and `title` to CombatFormulaConfig
  - Apply the Field Policy Table (required/optional/default/bounds) below
  - VariantConfig: `colorTheme` becomes `string` (no enum)
  - EnemyArchetypeConfig: `weakPointStyle` enum becomes crack/pulse/ring

  **Field Policy Table (explicit rules)**:
  - `bossPhases.addShield` (LevelConfig): optional boolean, default false, Source=User-Approved; PRD reference: 6.1 Level 15（回血Boss示例）
  - `hitShake` (EnemyArchetypeConfig): required number, bounds 0..5, default 0, Source=User-Approved; PRD reference: 5.2 EnemyArchetypeConfig（病毒类型配置）
  - `comboMistakeMul` (CombatFormulaConfig): required number, default 0.4, Source=PRD-Formula; PRD reference: 4.2 失误惩罚（硬核）
  - `gaugeA/B/C` (EconomyConfig): required numbers, defaults 0.035/0.03/0.02, Source=PRD-Formula; PRD reference: 4.5 超级针（概率+保底）
  - `pGamma/pQualityCoef` (EconomyConfig): required numbers, defaults 0.5/0.25, Source=PRD-Formula; PRD reference: 4.5 超级针（概率+保底）
  - EconomyConfig drop defaults (PRD-Recommended): dropCoinP0/Max, dropShardP0/Max, dropCardP0/Max; PRD reference: 6.2 EconomyConfig（硬核推荐默认）
  - EconomyConfig super needle defaults (PRD-Recommended): superNeedlePBase/PMin/PCap, gaugeCarryFail; PRD reference: 6.2 EconomyConfig（硬核推荐默认）
  - CombatFormulaConfig defaults (PRD-Formula): comboBase, comboDecayPerLevel, comboMin, M_alpha, M_k, Q_comboMaxCoef, Q_qualityCoef, Q_min, Q_max, regen_delta, regen_eta; PRD reference: 4.1 连击窗口随关卡收紧 / 4.3 连击倍率（慢增长） / 4.4 掉落质量因子 / 4.6 回血与连击绑定

  **Must NOT do**:
  - Do not add gameplay-only fields
  - Do not modify unrelated schemas

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused JSON schema edits and file rename
  - **Skills**: `["6A"]`
    - `6A`: Structured execution and consistency checks
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:
  - `docs/《病毒狙击》PRD & 配置表说明（V1·硬核向）.md` - authoritative fields and defaults
  - `schemas/LevelConfig.schema.json` - bossPhases and addShield update
  - `schemas/EnemyArchetypeConfig.schema.json` - add hitShake, enum update
  - `schemas/EconomyConfig.schema.json` - add gaugeA/B/C, pGamma, pQualityCoef
  - `schemas/FormulaConfig.schema.json` - rename source to CombatFormulaConfig
  - `schemas/VariantConfig.schema.json` - relax colorTheme enum

  **Acceptance Criteria**:
  - [ ] `schemas/CombatFormulaConfig.schema.json` exists with updated `$id` and `title`
  - [ ] `schemas/LevelConfig.schema.json` contains `addShield` and no `shieldAdd`
  - [ ] `schemas/EnemyArchetypeConfig.schema.json` contains `hitShake`
  - [ ] `schemas/VariantConfig.schema.json` uses `"colorTheme": { "type": "string" }`
  - [ ] `rg "shieldAdd" schemas/LevelConfig.schema.json` returns no matches

  **Commit**: NO

- [ ] 3. Update SPEC to PRD-aligned naming and schema blocks

  **What to do**:
  - Update config path names to `assets/config/CombatFormulaConfig.json`
  - Replace schema sections to match updated schemas (CombatFormulaConfig, addShield, hitShake)
  - Update formula text to PRD constants and naming
  - Align enums (weakPointStyle crack/pulse/ring; colorTheme string)
  - Add validation commands under SPEC "Data Contracts" section
  - Update SPEC example configs to use CombatFormulaConfig naming and PRD-aligned values

  **Must NOT do**:
  - Do not change gameplay rules beyond PRD/SPEC alignment
  - Do not alter PRD text

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Spec text and schema block updates
  - **Skills**: `["6A"]`
    - `6A`: Structured documentation updates
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:
  - `docs/SPEC.md` - update target
  - `docs/《病毒狙击》PRD & 配置表说明（V1·硬核向）.md` - authoritative formulas and field names
  - `schemas/FormulaConfig.schema.json` - rename source (becomes CombatFormulaConfig in Task 2)

  **Acceptance Criteria**:
  - [ ] `rg "CombatFormulaConfig" docs/SPEC.md` shows updated path and schema title
  - [ ] `rg "addShield" docs/SPEC.md` appears in bossPhases section
  - [ ] `rg "hitShake" docs/SPEC.md` appears in EnemyArchetypeConfig section
  - [ ] `rg "shieldAdd" docs/SPEC.md` returns no matches
  - [ ] SPEC example sections use CombatFormulaConfig naming (no FormulaConfig.json)
  - [ ] SPEC formulas include PRD constants: 1.15, 0.01, 0.75, 0.8, 10, 0.08, 0.15, 0.4, 2.0, 0.008, 0.5, 0.25, 0.003, 0.05, 0.035, 0.03, 0.02, 1.6, 0.8

  **Commit**: NO

- [ ] 4. Add validation pipeline (no example configs)

  **What to do**:
  - Add `package.json` (if missing) with devDependencies: `ajv`, `ajv-formats`
    - If `package.json` exists: merge devDependencies and add scripts `validate:configs` and `check:spec-sync` without overwriting existing entries
    - Script commands:
      - `validate:configs`: `node scripts/validate-schemas.mjs`
      - `check:spec-sync`: `node scripts/check-spec-sync.mjs`
  - Add `scripts/validate-schemas.mjs` using Ajv 8 to validate configs under `assets/config/`
    - If any required config file is missing, print `CONFIGS_MISSING:<list>` and exit 1
  - Add `scripts/check-spec-sync.mjs` to assert SPEC uses CombatFormulaConfig naming
  - Document the validation commands in SPEC (CI requirement)

  **check-spec-sync.mjs rules (exact asserts)**:
  - SPEC contains `assets/config/CombatFormulaConfig.json`
  - SPEC contains `CombatFormulaConfig.schema.json`
  - SPEC does NOT contain `FormulaConfig`
  - SPEC contains `addShield`
  - SPEC does NOT contain `shieldAdd`
  - SPEC contains "Alignment Appendix"

  **Validation Input Map**:
  - `assets/config/LevelConfig.json` → `schemas/LevelConfig.schema.json` (array)
  - `assets/config/EconomyConfig.json` → `schemas/EconomyConfig.schema.json` (object)
  - `assets/config/CombatFormulaConfig.json` → `schemas/CombatFormulaConfig.schema.json` (object)
  - `assets/config/EnemyArchetypeConfig.json` → `schemas/EnemyArchetypeConfig.schema.json` (array)
  - `assets/config/VariantConfig.json` → `schemas/VariantConfig.schema.json` (array)

  **Config Creation Policy**:
  - If `assets/config/` does not exist, create the directory only
  - Do NOT fabricate example configs; missing files must fail validation with `CONFIGS_MISSING`

  **CONFIGS_MISSING format**:
  - Output: `CONFIGS_MISSING:assets/config/LevelConfig.json,assets/config/EconomyConfig.json,assets/config/CombatFormulaConfig.json,assets/config/EnemyArchetypeConfig.json,assets/config/VariantConfig.json`
  - Ordering: LevelConfig, EconomyConfig, CombatFormulaConfig, EnemyArchetypeConfig, VariantConfig

  **Must NOT do**:
  - Do not add runtime gameplay code
  - Do not add dependencies not required for schema validation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Small scripts and validation wiring
  - **Skills**: `["6A"]`
    - `6A`: Structured implementation workflow
  - **Skills Evaluated but Omitted**:
    - `git-master`: No git operations needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 3

  **References**:
  - `docs/SPEC.md` - update CI validation requirement section
  - `schemas/*.schema.json` - validation targets
  - `assets/config/` - authoritative config path in SPEC

  **Acceptance Criteria**:
  - [ ] `node scripts/validate-schemas.mjs` prints `SCHEMAS_OK`
  - [ ] `node scripts/check-spec-sync.mjs` prints `SPEC_SYNC_OK`
  - [ ] `rg "CombatFormulaConfig" docs/SPEC.md` confirms updated naming
  - [ ] If configs are missing (dev/local): validation prints `CONFIGS_MISSING:<list>` and exits 1
  - [ ] If configs exist (CI): validation prints `SCHEMAS_OK` and exits 0

  **Commit**: NO

---

## Success Criteria

### Verification Commands
```bash
node scripts/validate-schemas.mjs
# Expected: SCHEMAS_OK (CI with configs) or CONFIGS_MISSING (local without configs)

node scripts/check-spec-sync.mjs
# Expected: SPEC_SYNC_OK

python -m jsonschema -i assets/config/EconomyConfig.json schemas/EconomyConfig.schema.json
# Expected: no output, exit 0
```

### Final Checklist
- [ ] PRD-aligned schemas and SPEC updated
- [ ] All schema validations pass
- [ ] No legacy naming remains (FormulaConfig/shieldAdd)
