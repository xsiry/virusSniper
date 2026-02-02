# Draft: Cocos Preview Blank

## Requirements (confirmed)
- Fix project so Cocos Creator preview shows content (currently blank).
- Use reference project at /mnt/e/MyGame/virusSniper2.
- Avoid destructive changes; no assumptions.
- Provide parallel task graph, steps, tools, validation, success criteria, and which files to edit/copy.
 - Approach: copy key config files from reference with minimal edits.
 - Target Cocos Creator version: 3.8.8.

## Known Findings (user-provided)
- /mnt/e/MyGame/virusSniper/settings/v2/packages/project.json contains only {"__version__":"1.0.6"}.
- /mnt/e/MyGame/virusSniper/settings/v2/packages/scene.json appears missing.
- /mnt/e/MyGame/virusSniper/temp/tsconfig.cocos.json missing; /mnt/e/MyGame/virusSniper/temp/startup.json missing; temp/* empty/not present.
- assets/scene.scene exists; scene has Canvas + Camera.
- No matches for startScene/launchScene in settings/temp; no director.loadScene in assets scripts.
- Reference /mnt/e/MyGame/virusSniper2 has settings/v2/packages/scene.json and settings/v2/packages/project.json with general config; temp/startup.json exists.

## Technical Decisions
- Pending: prefer copying known-good settings/temp files from reference vs. regenerating via Cocos Creator.

## Research Findings
- Pending: explore agent analysis of local project structure and diffs.
- Pending: librarian agent documentation on Cocos Creator 3.8.x project settings and startup.json (initial call failed; can retry).
 - Explore results: settings/v2/packages/*.json largely empty (version-only); temp/ missing startup/tsconfig; no start-scene/launchScene/scenes; assets/scene.scene exists but not referenced; missing temp outputs likely block preview.
 - Scene inventory: only one scene found at assets/scene.scene → will set as start scene.

## Open Questions
- Which Cocos Creator version should be treated as authoritative (3.8.8 per repo, or specific installed version)?
- Do you prefer minimal manual edits (copy specific config files) or to regenerate metadata using Cocos Creator and then reconcile diffs?
- Is there a specific scene that should be the launch scene (confirm assets/scene.scene is the intended start)?
- Should validation scripts be included in verification (npm run validate:configs / npm run check:spec-sync)?
- Is opening Cocos Creator to regenerate temp/startup allowed if copied configs alone don’t regenerate them automatically?

## Scope Boundaries
- INCLUDE: settings/v2/packages/*, temp/startup.json/tsconfig.cocos.json, and any minimal project metadata required for preview to load the launch scene.
- EXCLUDE: gameplay logic changes, asset modifications, refactors, dependency changes.
