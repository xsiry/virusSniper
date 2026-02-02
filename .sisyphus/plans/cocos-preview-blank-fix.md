# Cocos Preview Blank Fix (Config Restore)

## TL;DR

> **Quick Summary**: Restore minimal Cocos Creator 3.8.8 project metadata by copying key settings/temp files from the reference project and setting the only scene (`assets/scene.scene`) as the launch/start scene.
> 
> **Deliverables**:
> - Restored settings in `settings/v2/packages/*.json` with a valid `start-scene`/`launchScene` and `scenes` list
> - Restored `temp/tsconfig.cocos.json` and `temp/startup/*` as needed for preview
> - Verified preview/run loads the scene in Cocos Creator
> 
> **Estimated Effort**: Short
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Inventory & diff → Copy configs → Update scene refs → Verify in Creator

---

## Context

### Original Request
Fix project so Cocos Creator preview is not blank. Use `/mnt/e/MyGame/virusSniper2` as reference. Minimal-change strategy; copy key config files and set start scene based on scene list.

### Interview Summary
**Key Decisions**:
- Target Cocos Creator version: 3.8.8
- Approach: copy key config files from reference, minimal edits
- Start scene selection rule: if only one scene exists, use it

**Repository Findings**:
- `settings/v2/packages/*.json` in `virusSniper` are mostly version-only (missing start scene and scenes list)
- `temp/` lacks `tsconfig.cocos.json` and startup scripts
- Only one scene exists: `assets/scene.scene`

### Metis Review
Metis agent is not available in the current toolset. Performed manual gap check instead and added explicit guardrails and acceptance criteria.

---

## Work Objectives

### Core Objective
Restore the minimum Cocos Creator project metadata required for preview/run to load a start scene, without touching gameplay logic or assets.

### Concrete Deliverables
- Updated `settings/v2/packages/project.json` (and related packages) with start scene and scenes list
- Presence of `temp/tsconfig.cocos.json` and `temp/startup/*` consistent with Creator 3.8.8 expectations

### Definition of Done
- Cocos Creator preview/run loads `assets/scene.scene` (Canvas + Camera visible)
- No changes made to gameplay scripts or assets

### Must Have
- `start-scene`/`launchScene` points to `db://assets/scene.scene`
- `scenes` array includes `assets/scene.scene` with correct UUID

### Must NOT Have (Guardrails)
- Do not modify gameplay logic or scripts
- Do not rename or move assets
- Do not introduce new dependencies

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: No formal test runner; only validation scripts exist
- **User wants tests**: Manual verification + optional existing validation scripts
- **Framework**: none

### Manual Verification (Cocos Creator)
1. Open Cocos Creator 3.8.8
2. Open project `/mnt/e/MyGame/virusSniper`
3. Confirm project loads without errors
4. Run Preview/Run
5. Verify scene renders (Canvas + Camera) and no blank screen

### Automated/Scripted Checks (Optional but Recommended)
- `npm run validate:configs`
- `npm run check:spec-sync`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Inventory scene UUID and reference config content
└── Task 2: Identify which settings/temp files to copy from reference

Wave 2 (After Wave 1):
├── Task 3: Copy settings/temp files to target project
└── Task 4: Patch start scene and scenes list to match assets/scene.scene UUID

Wave 3 (After Wave 2):
└── Task 5: Validate (optional) + verify in Cocos Creator preview

Critical Path: Task 1 → Task 3 → Task 4 → Task 5
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 3, 4 | 2 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | 4, 5 | None |
| 4 | 1, 3 | 5 | None |
| 5 | 3, 4 | None | None |

---

## TODOs

- [ ] 1. Inventory scene UUID + reference config fields

  **What to do**:
  - Read `assets/scene.scene.meta` (or `assets/scene.scene`) to obtain UUID
  - Inspect reference `virusSniper2`:
    - `settings/v2/packages/project.json`
    - `settings/v2/packages/scene.json`
    - `settings/v2/packages/builder.json`
    - `temp/tsconfig.cocos.json`
    - `temp/startup/*`
  - Identify keys used for start scene + scenes list

  **Must NOT do**:
  - No edits yet; read-only inspection

  **Recommended Agent Profile**:
  - **Category**: quick
  - **Skills**: none
  - **Skills Evaluated but Omitted**: playwright (not needed for file inspection)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3, Task 4
  - **Blocked By**: None

  **References**:
  - `assets/scene.scene.meta` - canonical scene UUID for scenes list
  - `assets/scene.scene` - verify only one scene exists
  - `../virusSniper2/settings/v2/packages/project.json` - reference start scene config
  - `../virusSniper2/settings/v2/packages/scene.json` - reference scenes list placement

  **Acceptance Criteria**:
  - Scene UUID captured and ready to apply
  - Reference files reviewed and keys identified

- [ ] 2. Identify minimal file copy set

  **What to do**:
  - Determine minimal set of files to copy from `/mnt/e/MyGame/virusSniper2`:
    - `settings/v2/packages/project.json`
    - `settings/v2/packages/scene.json` (if present in reference)
    - `settings/v2/packages/builder.json`
    - `settings/v2/packages/engine.json` (if required by reference)
    - `settings/v2/packages/device.json` (if required by reference)
    - `settings/v2/packages/information.json` (splash defaults)
    - `settings/v2/packages/program.json`
    - `temp/tsconfig.cocos.json`
    - `temp/startup/*`
  - Flag any entries that embed absolute paths or machine-specific data

  **Must NOT do**:
  - Do not overwrite assets or scripts

  **Recommended Agent Profile**:
  - **Category**: quick
  - **Skills**: none
  - **Skills Evaluated but Omitted**: ui-ux-pro-max (not relevant)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `../virusSniper2/settings/v2/packages/*` - source of known-good defaults
  - `settings/v2/packages/*` - target files to replace/merge
  - `../virusSniper2/temp/*` - reference temp outputs

  **Acceptance Criteria**:
  - Minimal file list confirmed, with any risky fields noted

- [ ] 3. Copy reference config/temp files into target

  **What to do**:
  - Copy the minimal set from `/mnt/e/MyGame/virusSniper2` to `/mnt/e/MyGame/virusSniper`
  - Preserve directory structure
  - Do not touch non-config assets

  **Must NOT do**:
  - Do not overwrite `assets/` or `packages/` unrelated to settings

  **Recommended Agent Profile**:
  - **Category**: quick
  - **Skills**: none
  - **Skills Evaluated but Omitted**: git-master (no commits requested)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 4, Task 5
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `settings/v2/packages/*` - destination for copied settings
  - `temp/tsconfig.cocos.json` - needed by `tsconfig.json` extends
  - `temp/startup/*` - required for preview startup scripts

  **Acceptance Criteria**:
  - Files copied without altering assets/scripts

- [ ] 4. Patch start scene and scenes list

  **What to do**:
  - In copied settings files, set start scene to the only scene:
    - `start-scene` or `launchScene` → `db://assets/scene.scene`
  - Update `scenes` list to include `assets/scene.scene` with correct UUID
  - Ensure any UUID/URL pairs match the actual scene UUID

  **Must NOT do**:
  - Do not change scene content

  **Recommended Agent Profile**:
  - **Category**: quick
  - **Skills**: none
  - **Skills Evaluated but Omitted**: playwright (not needed)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 5
  - **Blocked By**: Task 1, Task 3

  **References**:
  - `settings/v2/packages/project.json` - start scene and scenes list
  - `settings/v2/packages/scene.json` - if this file holds scene registry in reference
  - `assets/scene.scene.meta` - UUID source of the scene asset

  **Acceptance Criteria**:
  - `start-scene`/`launchScene` points to `db://assets/scene.scene`
  - `scenes` contains matching UUID + URL

- [ ] 5. Verify preview/run and optional scripts

  **What to do**:
  - Open Cocos Creator 3.8.8 → open project → run preview
  - Confirm scene renders (no blank view)
  - Optionally run config validation scripts
  - If preview is still blank, reopen the project to let Creator regenerate temp/startup outputs and retry preview

  **Must NOT do**:
  - No additional refactors or edits during verification

  **Recommended Agent Profile**:
  - **Category**: unspecified-low
  - **Skills**: playwright (if automating web preview), dev-browser (optional)
  - **Skills Evaluated but Omitted**: ui-ux-pro-max (not needed)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Task 3, Task 4

  **References**:
  - `docs/SPEC.md` - only if validation scripts report spec issues
  - `package.json` - scripts `validate:configs` / `check:spec-sync`

  **Acceptance Criteria**:
  - Cocos Creator preview/run loads the scene (Canvas + Camera visible)
  - If run: `npm run validate:configs` succeeds
  - If run: `npm run check:spec-sync` succeeds

---

## Commit Strategy

- No commit requested. If a commit is needed later, group config changes into a single commit.

---

## Success Criteria

### Verification Commands (Optional)
```bash
npm run validate:configs
npm run check:spec-sync
```

### Final Checklist
- [ ] `settings/v2/packages/project.json` has valid `start-scene`/`launchScene`
- [ ] `scenes` list includes `assets/scene.scene` with correct UUID
- [ ] `temp/tsconfig.cocos.json` and `temp/startup/*` exist
- [ ] Cocos Creator preview is no longer blank
