# Draft: TypeScript LSP Diagnostics

## Requirements (confirmed)
- Run plan only (no execution) for: install TypeScript language server globally and run LSP diagnostics for all TypeScript files under assets/scripts in /mnt/e/MyGame/virusSniper.
- Use bash tool for npm install -g.
- Use lsp_diagnostics per file.
- No git operations.
- Output must be concise plan with minimal ordered steps and verification criteria.

## Technical Decisions
- Pending: exact command for global install (npm package name) and whether to include typescript dependency.
- Pending: enumerate TS files under assets/scripts for per-file diagnostics.

## Research Findings
- Pending: explore codebase and external guidance.

## Open Questions
- None yet.

## Scope Boundaries
- INCLUDE: Global install of TypeScript language server, file discovery under assets/scripts, per-file diagnostics run.
- EXCLUDE: Any code edits, git operations, other directories.
