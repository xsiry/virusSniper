# Virus Sniper Week1 Core Loop Plan

## TL;DR

> **Quick Summary**: Implement Week1 core loop (levels 1-5) in Cocos Creator 3.8.8 using existing scaffolding, add auto-advance, and set up Vitest-based unit tests for logic and config integrity.
>
> **Deliverables**:
> - `assets/config/LevelConfig.json` updated with levels 1-5 (auto-generated), keep level 15
> - `assets/config/EnemyArchetypeConfig.json` add `Standard` archetype
> - `assets/config/VariantConfig.json` add `S1` variant
> - Auto-advance level progression (1→5) in runtime flow
> - DebugPanel fields aligned with `docs/SPEC.md`
> - Vitest setup + unit tests for pure logic and config integrity
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Test infra → Config data → Progression + DebugPanel

---

## Context

### Original Request
Implement PRD Week1 milestone using Cocos Creator 3.8.8; ensure levels 1–5 are playable; add automated tests.

### Interview Summary
- Use existing config pipeline and scaffolding under `assets/scripts`.
- Add Vitest tests.
- Auto-generate LevelConfig 1–5 aligned with the PRD/SPEC teaching curve.
- Auto-advance between levels (no manual UI).

### Research Findings
- Configs live in `assets/config/*.json` with schemas in `schemas/*.schema.json`.
- `assets/config/LevelConfig.json` only contains `levelId: 15` today.
- `assets/config/EnemyArchetypeConfig.json` has only `Regenerator` archetype; `VariantConfig.json` only `R3`.
- `AppRoot` loads configs and spawns `GameWorld`; `GameWorld` assembles Shooter/Virus/UI and drives the loop.
- `FormulaService`, `EconomyService`, `RngService`, `GameSession` are pure logic and testable.
- `docs/SPEC.md` defines required DebugPanel fields and formulas.

### Metis Review
**Identified Gaps (addressed):**
- End-of-level behavior after level 5 → default to stop on Level 5 clear (no loop).
- Config generation script vs direct JSON → default to direct JSON edits (no generator script).
- RNG determinism → default seed per levelId with optional Debug override if minimal.

---

## Work Objectives

### Core Objective
Make the Week1 core loop playable for levels 1–5 with auto-advance, data-driven configs, and automated unit tests.

### Concrete Deliverables
- Updated config JSONs for levels/archetypes/variants.
- Auto-advance logic implemented in runtime flow.
- DebugPanel output fields aligned to SPEC.
- Vitest infrastructure + tests.

### Definition of Done
- `assets/config/LevelConfig.json` contains levels 1–5 + level 15; schemas validate.
- Auto-advance from level 1 → 5 occurs without UI interaction.
- DebugPanel shows all required fields from `docs/SPEC.md`.
- Vitest tests run and pass.

### Must Have
- Levels 1–5 in config (Standard archetype, S1 variant).
- Auto-advance behavior after clear.
- Deterministic RNG seeding per level.
- Vitest test setup and unit coverage for core logic/config.

### Must NOT Have (Guardrails)
- No Week2 mechanics implementation (shield/regen/drops/super needle behavior) beyond config disabling.
- No new scenes or art assets.
- No new config fields (avoid schema/spec churn).

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: YES (Tests-after)
- **Framework**: Vitest + TypeScript

### Test Setup Task (new infrastructure)
- Install: `npm add -D vitest @types/node`
- Config: `vitest.config.ts`
- Scripts: add `"test": "vitest run"`, `"test:watch": "vitest"`
- Update `AGENTS.md` with test commands

### Automated Verification Only

Use the following commands for acceptance (agent-executable):

```bash
npm run validate:configs
npm run check:spec-sync
npm test
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Vitest setup + base tests
└── Task 2: Config data for levels/archetypes/variants

Wave 2 (After Wave 1):
├── Task 3: Level progression + deterministic RNG
└── Task 4: DebugPanel fields alignment

Wave 3 (After Wave 2):
└── Task 5: Final validation run + test proof

Critical Path: Task 1 → Task 3 → Task 4
Parallel Speedup: ~35%
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 3, 4 | 2 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | 4 | None |
| 4 | 1, 3 | 5 | None |
| 5 | 1, 2, 3, 4 | None | None |

---

## TODOs

> Implementation + Tests are in the same task.

### [ ] 1. Set up Vitest infrastructure and base unit tests

**What to do**:
- Add dev deps: `vitest`, `@types/node` in `package.json`.
- Add `vitest.config.ts` (node environment, tsconfig reference if needed).
- Add `tests/core/rng.test.ts` (deterministic seed test).
- Add `tests/core/formula.test.ts` (combo window and M/Q formula sanity).
- Add `tests/core/economy.test.ts` (drop prob clamping + gauge delta).
- Update `AGENTS.md` with how to run all tests and single test.

**Must NOT do**:
- Do not add heavy test frameworks or unrelated tools.

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
  - Reason: Multi-file setup + TS config + tests.
- **Skills**: `git-master`
  - `git-master`: manage edits consistently across configs and docs.
- **Skills Evaluated but Omitted**:
  - `frontend-ui-ux`: not needed.

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 2)
- **Blocks**: Tasks 3, 4
- **Blocked By**: None

**References**:
- `package.json` - add test scripts and devDependencies.
- `assets/scripts/core/RngService.ts` - target for deterministic test.
- `assets/scripts/core/FormulaService.ts` - formulas to test.
- `assets/scripts/core/EconomyService.ts` - drop probability logic.
- `AGENTS.md` - update test commands guidance.

**Acceptance Criteria**:
```bash
npm test
# Assert: 0 failed
```

---

### [ ] 2. Populate Week1 configs (LevelConfig 1–5, Standard archetype, S1 variant)

**What to do**:
- Update `assets/config/LevelConfig.json` to include levels 1–5 with a simple teaching curve, keep level 15 intact.
- Add `Standard` archetype to `assets/config/EnemyArchetypeConfig.json` (mirror Regenerator values for placeholders).
- Add `S1` variant to `assets/config/VariantConfig.json` (basic colorTheme/noise/pulse values).

**Proposed LevelConfig 1–5 values** (auto-generated, aligned with SPEC sample):
```json
[
  { "levelId": 1, "enemyArchetype": "Standard", "variantId": "S1", "hp": 5, "weakPointCount": 2, "rotateSpeed": 0.6, "speedMode": "fixed", "weakPointMove": false, "shieldEnabled": false, "regenEnabled": false, "reflectEnabled": false, "limitNeedlesEnabled": false, "multiTargetEnabled": false },
  { "levelId": 2, "enemyArchetype": "Standard", "variantId": "S1", "hp": 6, "weakPointCount": 2, "rotateSpeed": 0.8, "speedMode": "fixed", "weakPointMove": false, "shieldEnabled": false, "regenEnabled": false, "reflectEnabled": false, "limitNeedlesEnabled": false, "multiTargetEnabled": false },
  { "levelId": 3, "enemyArchetype": "Standard", "variantId": "S1", "hp": 8, "weakPointCount": 3, "rotateSpeed": 1.0, "speedMode": "fixed", "weakPointMove": false, "shieldEnabled": false, "regenEnabled": false, "reflectEnabled": false, "limitNeedlesEnabled": false, "multiTargetEnabled": false },
  { "levelId": 4, "enemyArchetype": "Standard", "variantId": "S1", "hp": 9, "weakPointCount": 3, "rotateSpeed": 1.2, "speedMode": "fixed", "weakPointMove": true,  "shieldEnabled": false, "regenEnabled": false, "reflectEnabled": false, "limitNeedlesEnabled": false, "multiTargetEnabled": false },
  { "levelId": 5, "enemyArchetype": "Standard", "variantId": "S1", "hp": 11, "weakPointCount": 4, "rotateSpeed": 1.3, "speedMode": "fixed", "weakPointMove": true,  "shieldEnabled": false, "regenEnabled": false, "reflectEnabled": false, "limitNeedlesEnabled": false, "multiTargetEnabled": false }
]
```

**Must NOT do**:
- Do not add new schema fields or change formulas.
- Do not remove existing level 15 / Regenerator / R3 entries.

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Data config edits.
- **Skills**: `git-master`
  - `git-master`: keep config changes clean and consistent.
- **Skills Evaluated but Omitted**:
  - `frontend-ui-ux`: not needed.

**Parallelization**:
- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 1)
- **Blocks**: Task 3
- **Blocked By**: None

**References**:
- `docs/SPEC.md` - sample LevelConfig and required fields.
- `assets/config/LevelConfig.json` - current data (only level 15).
- `assets/config/EnemyArchetypeConfig.json` - add Standard archetype.
- `assets/config/VariantConfig.json` - add S1 variant.

**Acceptance Criteria**:
```bash
node -e "const cfg=require('./assets/config/LevelConfig.json'); console.log(cfg.filter(l=>l.levelId>=1&&l.levelId<=5).length)"
# Assert: 5

node -e "const cfg=require('./assets/config/LevelConfig.json'); console.log(cfg.some(l=>l.levelId===15))"
# Assert: true

node -e "const cfg=require('./assets/config/EnemyArchetypeConfig.json'); console.log(cfg.some(a=>a.archetypeId==='Standard'))"
# Assert: true

node -e "const cfg=require('./assets/config/VariantConfig.json'); console.log(cfg.some(v=>v.variantId==='S1'))"
# Assert: true
```

---

### [ ] 3. Implement auto-advance level progression + deterministic RNG seeding

**What to do**:
- Add a level progression helper in `ConfigRepo` (sorted level list, next level lookup).
- Add `GameSession` tracking for `currentLevelId` and `advanceLevel()` returning next level config.
- Update `AppRoot` to start at level 1 if exists, otherwise fallback to first.
- Update `GameWorld` to auto-advance after `levelCleared` (e.g., 1.2s delay), respawn viruses/shooter/UI for next level without changing scene.
- Seed `RngService` using `levelId` on each level start; optionally allow DebugPanel override later (optional).

**Must NOT do**:
- Do not add new scenes or UI flows.
- Do not implement Week2 mechanics (shield/regen/drops/super needle behaviors beyond config off).

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
  - Reason: multi-file gameplay flow changes.
- **Skills**: `git-master`
  - `git-master`: multi-file coordination.
- **Skills Evaluated but Omitted**:
  - `frontend-ui-ux`: not needed.

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 2
- **Blocks**: Task 4
- **Blocked By**: Tasks 1, 2

**References**:
- `assets/scripts/AppRoot.ts` - initialization and session creation.
- `assets/scripts/battle/GameWorld.ts` - game loop, clear/fail detection.
- `assets/scripts/core/GameSession.ts` - session state and formula usage.
- `assets/scripts/core/ConfigRepo.ts` - config lookups.
- `assets/scripts/core/RngService.ts` - deterministic RNG.

**Acceptance Criteria**:
```bash
npm test
# Assert: tests for progression + RNG pass
```

---

### [ ] 4. Align DebugPanel with SPEC fields (and lastHitType tracking)

**What to do**:
- Ensure `DebugPanel` shows fields listed in `docs/SPEC.md`:
  `levelId`, `hpCurrent/hpMax`, `rotateSpeedCurrent`, `combo`, `comboQuality`, `comboWindowT`, `M`, `Q`, `p_superNeedle`, `gauge`, `regenRateCurrent`, `lastHitType`.
- Add `lastHitType` tracking in `GameSession` and update on WeakPoint / Shield / Miss / Timeout.
- If needed, add a pure helper function to format debug lines so it can be unit tested.

**Must NOT do**:
- Do not add UI art or new panels.

**Recommended Agent Profile**:
- **Category**: `unspecified-high`
  - Reason: multi-file updates + testable formatting helper.
- **Skills**: `git-master`
  - `git-master`: ensure correct wiring of fields.
- **Skills Evaluated but Omitted**:
  - `frontend-ui-ux`: not needed.

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 2
- **Blocks**: Task 5
- **Blocked By**: Tasks 1, 3

**References**:
- `docs/SPEC.md` - required DebugPanel fields.
- `assets/scripts/debug/DebugPanel.ts` - current debug display.
- `assets/scripts/core/GameSession.ts` - source of runtime stats.
- `assets/scripts/core/FormulaService.ts` / `assets/scripts/core/EconomyService.ts` - derived metrics.

**Acceptance Criteria**:
```bash
npm test
# Assert: DebugPanel helper formatting tests pass
```

---

### [ ] 5. Final validation run

**What to do**:
- Run schema validation and spec sync checks.
- Run full test suite.

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: command execution and verification only.
- **Skills**: `git-master`
  - `git-master`: consistent verification reporting.

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 3
- **Blocks**: None
- **Blocked By**: Tasks 1–4

**Acceptance Criteria**:
```bash
npm run validate:configs
# Assert: exit code 0

npm run check:spec-sync
# Assert: exit code 0

npm test
# Assert: 0 failed
```

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `test(setup): add vitest` | `package.json`, `vitest.config.ts`, `tests/**`, `AGENTS.md` | `npm test` |
| 2 | `config: add level1-5 data` | `assets/config/*.json` | `npm run validate:configs` |
| 3-4 | `feat: auto-advance week1 loop` | `assets/scripts/**` | `npm test` |

---

## Success Criteria

### Verification Commands
```bash
node -e "const cfg=require('./assets/config/LevelConfig.json'); console.log(cfg.filter(l=>l.levelId>=1&&l.levelId<=5).length)"
npm run validate:configs
npm run check:spec-sync
npm test
```

### Final Checklist
- [ ] Levels 1–5 exist and are valid per schema
- [ ] Level 15 remains intact
- [ ] Auto-advance works from 1 → 5 (logic verified by tests)
- [ ] DebugPanel fields meet SPEC
- [ ] All tests pass
