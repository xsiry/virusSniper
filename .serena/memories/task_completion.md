Before finishing a task:
1. Update schemas/ and docs/SPEC.md when config changes occur.
2. Run `node scripts/validate-schemas.mjs`.
3. Run `node scripts/check-spec-sync.mjs`.
4. Ensure no style-only diffs since no formatter enforces layout.