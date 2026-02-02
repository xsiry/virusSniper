# Implementation Plan - WeChat Release Target

## Purpose
- Provide a durable task list for AI-driven development.
- Prevent duplicated work across accounts or context switches.

## Source of truth
- Gameplay spec: docs/SPEC.md
- Product PRD: docs/ (Chinese filename)
- Config data: assets/config/*.json
- Schemas: schemas/*.schema.json

## Hard constraints (from SPEC)
- All gameplay behavior must be controlled by configs where applicable.
- No hidden constants except dev defaults when config missing.
- Any new config field must update schema + SPEC + validators.

## Validation commands
- node scripts/validate-schemas.mjs
- node scripts/check-spec-sync.mjs

## DebugPanel (dev build must show)
- levelId
- hpCurrent / hpMax
- rotateSpeedCurrent
- combo
- comboQuality
- comboWindowT
- M(combo)
- Q
- p_superNeedle
- gauge
- regenRateCurrent
- lastHitType (WeakPoint / Shield / Miss / Timeout)

## Status update protocol
- Update this file when a task changes status or acceptance is reached.
- Use: DONE: <ID> - <short summary>
- Keep the Task List statuses in sync with the log.

## Task list (release target)

A. Project skeleton
- A01 TODO - Create Cocos Creator 3.8.8 project scaffold (empty project + default scene).
- A02 TODO - Define script layout (core/data/battle/entities/ui/fx).
- A03 TODO - Create global enums/types (hit type, enemy type, drop type).
- A04 TODO - Bootstrap flow (load config -> init systems -> enter main scene).

B. Config system (priority)
- B01 TODO - Config loader for assets/config/*.json.
- B02 TODO - Runtime config validation (dev only) aligned with schemas/*.schema.json.
- B03 TODO - Data models for Level/Economy/CombatFormula/Archetype/Variant.
- B04 TODO - Dev hot-reload entry for configs.
- B05 TODO - Missing/invalid config handling (dev fail-fast).

C. Core gameplay loop
- C01 TODO - Player input + shooter.
- C02 TODO - Needle entity lifecycle and movement.
- C03 TODO - Hit logic (WeakPoint > Shield > Miss).
- C04 TODO - Virus entity (rotation, weak points, HP).
- C05 TODO - Basic HUD (HP, level, needles).
- C06 TODO - Level loader (LevelConfig driven).
- C07 TODO - Win/lose + settlement flow.
- C08 TODO - DebugPanel (SPEC required fields).

D. Combo and quality
- D01 TODO - Combo window timing (CombatFormulaConfig).
- D02 TODO - Combo multiplier M calculation.
- D03 TODO - Quality Q and decay.
- D04 TODO - Miss/timeout penalties.

E. Mechanics
- E01 TODO - Shield system (orbital/energy/breakable).
- E02 TODO - Regen system (regenEnabled + formula suppression).
- E03 TODO - Drop system (coins/fragments/upgrade cards).
- E04 TODO - Super needle probability + gauge guarantee.

F. Boss and composite
- F01 TODO - Boss phases (bossPhases).
- F02 TODO - Bounce objects (fixed/move/rotate).
- F03 TODO - Decoy weak points (decoyRatio).
- F04 TODO - Multi-target levels (targetCount).

G. UI/UX
- G01 TODO - Expanded HUD (combo/quality/super needle/drop prompts).
- G02 TODO - Main menu + level select.
- G03 TODO - Settlement UI + rewards.
- G04 TODO - Tutorial hints (levels 1-3).

H. FX/Audio
- H01 TODO - Weak point / shield hit feedback.
- H02 TODO - Boss phase change FX.
- H03 TODO - Drop pickup / settlement FX.

I. Performance & stability
- I01 TODO - Object pools (needles/fx/drops).
- I02 TODO - Low-end performance strategy (particles/render/collisions).
- I03 TODO - Runtime monitoring and safe guards.

J. Data finalize
- J01 TODO - LevelConfig 30-level pass.
- J02 TODO - Economy/Formula/Archetype/Variant tuning pass.
- J03 TODO - Run validation scripts and fix failures.

K. WeChat release
- K01 TODO - Build WeChat MiniGame package in Cocos.
- K02 TODO - Package size (4MB first package) + remote assets.
- K03 TODO - Upload trial + submit review + release.
- K04 TODO - Post-release monitoring and regression check.

## Definition of done (release)
- All tasks above are DONE.
- Validation scripts pass with no errors.
- 30 levels are playable end-to-end.
- WeChat MiniGame build is created and passes QA checklist.

## Status log
- DONE: P00 - Planning inputs confirmed (dev stage, version 0.1.0+YYYYMMDD, skeleton via Cocos Dashboard, placeholder assets, full PRD, implement-first then tests)
- DONE: P01 - AppID reserved (TBD); DevTools submission blocked until final AppID
- DONE: G00 - Core runtime scaffolding created (AppRoot, ConfigLoader, ConfigRepo, Formula/Economy/RNG, DebugPanel)
- DONE: G01 - Scene entry wired (AppRoot attached to Canvas) and WorldRoot/UIRoot spawned
- DONE: G02 - Core combat loop implemented (Needle/Shooter/CombatSystem/Virus/WeakPoint/Shield/ReflectObject)
- DONE: G03 - Combo/quality/super needle formulas integrated; DebugPanel/HUD updated
- DONE: G04 - Failure condition set to needle limit exhaustion; ResultBanner placeholder added
- DONE: J01 - LevelConfig 30-level pass (Generated via script)
- DONE: G05 - Main Menu and Tutorial Overlay implemented
- DONE: H01 - AudioService implemented (placeholder)
- DONE: I03 - Runtime config validation passed
