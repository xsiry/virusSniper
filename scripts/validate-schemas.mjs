import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const REQUIRED = [
  {
    config: "assets/config/LevelConfig.json",
    schema: "schemas/LevelConfig.schema.json",
    expectsArray: true
  },
  {
    config: "assets/config/EconomyConfig.json",
    schema: "schemas/EconomyConfig.schema.json",
    expectsArray: false
  },
  {
    config: "assets/config/CombatFormulaConfig.json",
    schema: "schemas/CombatFormulaConfig.schema.json",
    expectsArray: false
  },
  {
    config: "assets/config/EnemyArchetypeConfig.json",
    schema: "schemas/EnemyArchetypeConfig.schema.json",
    expectsArray: true
  },
  {
    config: "assets/config/VariantConfig.json",
    schema: "schemas/VariantConfig.schema.json",
    expectsArray: true
  }
];

const missingConfigs = REQUIRED.filter((item) => !fs.existsSync(item.config));
if (missingConfigs.length > 0) {
  const list = missingConfigs.map((item) => item.config).join(",");
  console.log(`CONFIGS_MISSING:${list}`);
  process.exit(1);
}

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`JSON_PARSE_ERROR:${filePath}:${error.message}`);
    return null;
  }
}

let hasErrors = false;

for (const item of REQUIRED) {
  const schemaPath = item.schema;
  if (!fs.existsSync(schemaPath)) {
    console.error(`SCHEMA_MISSING:${schemaPath}`);
    hasErrors = true;
    continue;
  }

  const schema = readJson(schemaPath);
  if (!schema) {
    hasErrors = true;
    continue;
  }

  const schemaKey = schema.$id || schemaPath;
  ajv.addSchema(schema, schemaKey);
  const validate = ajv.getSchema(schemaKey);
  if (!validate) {
    console.error(`SCHEMA_COMPILE_FAILED:${schemaPath}`);
    hasErrors = true;
    continue;
  }

  const data = readJson(item.config);
  if (data === null) {
    hasErrors = true;
    continue;
  }

  if (item.expectsArray) {
    if (!Array.isArray(data)) {
      console.error(`INVALID:${item.config}:expected array`);
      hasErrors = true;
      continue;
    }

    data.forEach((entry, index) => {
      const valid = validate(entry);
      if (!valid) {
        console.error(`INVALID:${item.config}[${index}]`);
        console.error(validate.errors);
        hasErrors = true;
      }
    });
  } else {
    const valid = validate(data);
    if (!valid) {
      console.error(`INVALID:${item.config}`);
      console.error(validate.errors);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log("SCHEMAS_OK");
