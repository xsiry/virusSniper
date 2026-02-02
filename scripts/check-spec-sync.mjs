import fs from "node:fs";

const specPath = "docs/SPEC.md";

if (!fs.existsSync(specPath)) {
  console.error(`SPEC_MISSING:${specPath}`);
  process.exit(1);
}

const spec = fs.readFileSync(specPath, "utf-8");
const failures = [];

if (!spec.includes("assets/resources/config/CombatFormulaConfig.json")) {
  failures.push("Missing assets/resources/config/CombatFormulaConfig.json");
}

if (!spec.includes("CombatFormulaConfig.schema.json")) {
  failures.push("Missing CombatFormulaConfig.schema.json");
}

if (!spec.includes("Alignment Appendix")) {
  failures.push("Missing Alignment Appendix");
}

if (!spec.includes("addShield")) {
  failures.push("Missing addShield");
}

if (spec.includes("shieldAdd")) {
  failures.push("Found shieldAdd");
}

const formulaConfigRegex = /\bFormulaConfig\b/;
if (formulaConfigRegex.test(spec)) {
  failures.push("Found FormulaConfig");
}

if (failures.length > 0) {
  console.error("SPEC_SYNC_FAILED");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("SPEC_SYNC_OK");
