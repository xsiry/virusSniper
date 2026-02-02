# Draft: WeChat MiniGame Release Target (Cocos Creator)

## Requirements (confirmed)
- Deliver release-target WeChat MiniGame version in this repo (full Cocos project scaffold).
- Durable docs and task tracking in repo.
- Output should include: parallel task waves + dependencies, per-task category+skills, verification checklist, and critical questions if needed.

## Technical Decisions
- Build full Cocos project inside this repo (user confirmed option 1).
- Use Cocos Creator 3.8.8 (from repo docs) unless user overrides.

## Research Findings
- Repo lacks Cocos project skeleton (no settings/, packages/, project.json, *.scene/prefab/meta, runtime code).
- Cocos project structure requires assets/ + package.json; created via Cocos Dashboard.
- WeChat MiniGame packaging constraints: main package <=4MB, total <=30MB; submission via WeChat DevTools.

## Open Questions
- Confirm test/verification strategy (TDD/tests-after/manual-only) since repo has no test infra.
- Provide WeChat MiniGame appid + release target (dev/test/production) and versioning requirements.
- Asset availability: existing game assets expected or need placeholders while waiting for art?
- Scope: config-only data validation vs full gameplay loop MVP for release target?

## Scope Boundaries
- INCLUDE: Full Cocos project scaffold within repo, build/export pipeline for WeChat MiniGame, docs/checklists.
- EXCLUDE: None specified yet; need confirmation on gameplay scope and asset sourcing.
