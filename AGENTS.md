# Agent Guide for virusSniper

## Scope
- This file documents repo-specific commands and style guidance.
- Update this file whenever build/lint/test tooling changes.

## Project facts
- Engine: Cocos Creator 3.8.8
- Language: TypeScript
- Configs are JSON assets loaded from the Cocos main bundle.
- Config changes must stay in sync with schemas and docs/SPEC.md.

## Commands
### Validation (current automation)
- Validate schemas: `npm run validate:configs`
- Check SPEC sync: `npm run check:spec-sync`
- Direct script (same as above): `node scripts/validate-schemas.mjs`
- Direct script (same as above): `node scripts/check-spec-sync.mjs`

### Build / Lint / Test
- No build/lint/test runner found in repo root.
- No single-test invocation pattern available.
- If you add tests, document how to run all tests and a single test here.

## Tooling and configs (observed)
- `package.json` scripts only include validation and spec sync.
- `tsconfig.json` extends `./temp/tsconfig.cocos.json`.
- `tsconfig.json` sets `compilerOptions.strict=false`.
- `tsconfig.json` includes `assets/**/*.ts` and `cc.lsp.d.ts`.
- `assets/scripts/tsconfig.json` targets ES2015, no emit, decorators on.
- No ESLint, Prettier, or EditorConfig found.
- Preserve existing formatting and avoid style-only diffs.

## Key docs
- Requirements/spec: `docs/SPEC.md`
- Product/PRD: `docs/《病毒狙击》PRD & 配置表说明（V1·硬核向）.md`
- Implementation plan: `docs/IMPLEMENTATION_PLAN.md`
- Release checklist: `docs/RELEASE_CHECKLIST.md`

## Cursor / Copilot rules
- `.cursor/rules/`: not found
- `.cursorrules`: not found
- `.github/copilot-instructions.md`: not found

## Code style (observed)
### Formatting
- Indentation: 2 spaces.
- Semicolons are used.
- Single quotes are used in TypeScript files.
- Keep braces on the same line as declarations.
- Keep one statement per line.
- Keep blank lines between import blocks and class definitions.

### Imports
- External imports first (e.g., `from 'cc'`), then relative imports.
- No enforced import sorting; follow the local file pattern.
- Keep imports minimal and remove unused imports.

### File structure and patterns
- One primary exported class per file is common.
- Cocos components use `_decorator` and `@ccclass`.
- Private fields are marked with `private` and often nullable.
- Use early returns for missing scene/nodes instead of nesting.
- Prefer small, focused methods over long lifecycle bodies.
- Create nodes with clear names (e.g., `WorldRoot`, `UIRoot`).

### Types
- Avoid type suppression (`as any`, `@ts-ignore`, `@ts-expect-error`).
- Prefer explicit return types for public or exported APIs.
- Use unions with `null` where needed (e.g., `GameSession | null`).
- Keep generics explicit when loading JSON configs.
- `strict` is currently disabled; keep new code type-safe anyway.
- Avoid implicit `any` even when compiler allows it.

### Naming
- Classes: PascalCase (`GameSession`, `ConfigLoader`).
- Methods/fields: camelCase (`loadAll`, `spawnGameWorld`).
- Use descriptive names; avoid new abbreviations unless established.

### Comments and docs
- Methods commonly include JSDoc with `@param` and `@returns`.
- Keep comments brief and in English.
- Add comments only when logic is non-obvious.
- Update comments when behavior changes; avoid stale notes.

### Error handling
- Throw `Error` with clear messages when invariants break.
- Do not add empty `catch` blocks.
- Prefer early returns for invalid state in component lifecycle methods.
- Reject Promises with meaningful errors when wrapping callbacks.

### Async and promises
- Prefer `async/await` for async flows.
- Wrap Cocos callbacks into Promises with explicit `resolve/reject`.
- Keep async methods resilient to null scene/bundle states.

### Cocos component patterns (observed)
- Use `@ccclass` for components and keep class names stable.
- Access scene via `director.getScene()` and guard when missing.
- Add child nodes via `Node` and attach components with `addComponent`.

### Config asset loading (observed)
- Load JSON via `assetManager` and `JsonAsset`.
- Config paths use `config/<Name>` without file extensions.
- Use typed JSON loads (e.g., `loadJson<LevelConfig[]>`).

## Config + schema workflow
- When adding config fields:
  - Update the corresponding schema in `schemas/`.
  - Update `docs/SPEC.md` to keep the spec in sync.
  - Update types in `assets/scripts/data/ConfigTypes.ts`.
  - Run validation and spec sync scripts.

## Config loading notes
- Configs are loaded from the main bundle paths like `config/LevelConfig`.
- Keep config JSON keys aligned with schema and TypeScript types.

## Repo layout (top-level)
- `assets/`: game assets and TypeScript scripts
- `schemas/`: JSON schema definitions
- `scripts/`: validation utilities
- `docs/`: specifications and product docs

## Repo layout (scripts)
- `assets/scripts/core`: session, config, formula, and economy services
- `assets/scripts/battle`: combat, game world, and drop systems
- `assets/scripts/entities`: gameplay entities and hit targets
- `assets/scripts/ui`: HUD and UI components
- `assets/scripts/data`: config type definitions
- `assets/scripts/utils`: math helpers and utilities
- `assets/scripts/debug`: developer debug panel

## Operational guidance for agents
- Make minimal, targeted changes aligned with local patterns.
- Avoid introducing new dependencies unless requested.
- Avoid refactors while fixing bugs; change only what's needed.
- If you touch configs, update schemas and SPEC in the same change.
- Document any new commands or tooling in this file.
- Prefer editing related files together (config + schema + spec).
- Keep gameplay logic changes localized to one subsystem when possible.

## Quick checklist
- [ ] Update schemas and SPEC if config fields changed
- [ ] Update `assets/scripts/data/ConfigTypes.ts` if config types changed
- [ ] Run `npm run validate:configs`
- [ ] Run `npm run check:spec-sync`
- [ ] Avoid style-only diffs when no formatter is enforced
