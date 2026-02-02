# SPEC.md — Virus Sniper (WeChat MiniGame) — Engineering Spec (Cocos Creator 3.8.8)

> Scope: MVP + 30 levels, Sprite/Graphics route.
> Engine: Cocos Creator 3.8.8, TypeScript, data-driven configs.
> Hard-mode formulas are authoritative (do NOT change without updating this spec).

---

## 0. Repository Conventions

### 0.1 Config file paths (authoritative)
- `assets/resources/config/LevelConfig.json` (array of LevelConfig)
- `assets/resources/config/EconomyConfig.json` (single EconomyConfig)
- `assets/resources/config/CombatFormulaConfig.json` (single CombatFormulaConfig)
- `assets/resources/config/EnemyArchetypeConfig.json` (array)
- `assets/resources/config/VariantConfig.json` (array)

### 0.2 Runtime contract (must-have)
- All gameplay behavior must be controlled by configs where applicable.
- No "hidden" constants in code except defaults used when config missing in dev mode.
- Any new config fields must be added to JSON Schema + SPEC.md + validators.

### 0.3 DebugPanel (must show)
At runtime (dev build), show:
- `levelId`
- `hpCurrent / hpMax`
- `rotateSpeedCurrent`
- `combo`
- `comboQuality`
- `comboWindowT`
- `M(combo)`
- `Q`
- `p_superNeedle`
- `gauge`
- `regenRateCurrent`
- `lastHitType` (WeakPoint / Shield / Miss / Timeout)

---

## 1. Gameplay Rules (authoritative)

### 1.1 Hit resolution priority
When a needle intersects multiple colliders in the same frame:
1) WeakPoint
2) Shield
3) Miss

### 1.2 Hit types
- **WeakPoint**: Valid weak-point hit. Reduces HP and updates combo.
- **Shield**: Hits shield collider. Does NOT reduce HP (MVP). Counts as mistake in hard mode.
- **Miss**: Needle exits screen without any hit. Counts as mistake in hard mode.
- **Timeout**: A weakpoint hit arrives but exceeds combo window. Counts as mistake in hard mode.

### 1.3 Combo update (hard mode)
- Combo increments ONLY on WeakPoint hits within combo window.
- On WeakPoint hit:
  - if `(t_now - t_lastWeakHit) <= Tcombo(level)` => `combo += 1`
  - else => `combo = 1` (this event is also treated as Timeout mistake; implementation may set combo=1 and apply mistake policy—see CombatFormulaConfig)
- On mistake event (Shield/Miss/Timeout):
  - `combo = floor(combo * comboMistakeMul)` (default 0.4)
  - `comboQuality -= 1`

Maintain:
- `comboMax` (max combo achieved this level)
- `comboQuality` (starts at 0 each level; can go negative)

### 1.4 Regen (healing)
- Regen triggers if `regenEnabled=true` and player has not hit a WeakPoint for `regenDelay` seconds.
- Regen rate is reduced by combo and comboQuality using formula in §2.6.

### 1.5 Super Needle (rare, fairness via gauge)
- SuperNeedle can be granted on WeakPoint hit by (probability + gauge).
- Gauge increases on each WeakPoint hit when not granted.
- If `gauge >= 1.0`, grant SuperNeedle immediately and reset gauge to 0.

### 1.6 Boss phases
Boss phases trigger when `hpCurrent / hpMax <= hpPct` (descending order).
Each phase can apply multipliers to rotate speed, regen, shield, weakpoint movement, etc.

---

## 2. Hard Mode Formulas (authoritative)

> Use float math; clamp where specified.

### 2.1 Combo window per level
Tcombo(level):
`T = clamp(comboBase - comboDecayPerLevel*(level-1), comboMin, comboBase)`

### 2.2 Combo multiplier M(combo)
`M = 1 + M_alpha*(1 - exp(-combo/M_k))`

### 2.3 Drop quality factor Q
`Q = clamp(1 + Q_comboMaxCoef*comboMax + Q_qualityCoef*comboQuality, Q_min, Q_max)`

### 2.4 Drop probability for item i
`p[i] = clamp(p0[i] * Q, 0, pMax[i])`

### 2.5 SuperNeedle probability per WeakPoint hit
`p_super = clamp(pBase * (1 + pGamma*(M-1)) * (1 + pQualityCoef*comboQuality), pMin, pCap)`

### 2.6 Gauge increment per WeakPoint hit (when not granted)
`Δg = gaugeA + gaugeB*(M-1) + gaugeC*max(0, comboQuality)`

### 2.7 Gauge carry on fail
On level fail:
`gaugeNext = gaugeCarryFail * gauge` (default 0.2)

### 2.8 Regen rate suppression
`regenRate = regenBase / (1 + regen_delta*(M-1) + regen_eta*max(0, comboQuality))`

---

## 3. Data Contracts — JSON Schema (draft 2020-12)

> These schemas are authoritative. Runtime must validate configs in dev builds.
> In production you may skip validation for performance, but CI must validate.

### 3.1 Common definitions
- Enums must match exactly.
- Bounds/defaults are defined in the Alignment Appendix with Source tags.

### 3.1.1 Alignment Appendix (PRD → Schema mapping)

#### LevelConfig

| Field | Config | Required | Default | Bounds | Source | PRD Ref | Schema Path |
| --- | --- | --- | --- | --- | --- | --- | --- |
| levelId | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.levelId |
| enemyArchetype | LevelConfig | required | - | enum: Standard, VariableSpin, OrbitalShield, EnergyShield, Regenerator, RearCore, Reflector, Decoy, Fusion, FinalBoss | PRD | 3.2 敌人体系, 5.1 LevelConfig | $.properties.enemyArchetype |
| variantId | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.variantId |
| hp | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.hp |
| weakPointCount | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.weakPointCount |
| rotateSpeed | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.rotateSpeed |
| speedMode | LevelConfig | required | - | enum: fixed, variable | PRD | 5.1 LevelConfig | $.properties.speedMode |
| speedMin | LevelConfig | conditional (speedMode=variable) | - | - | PRD | 5.1 LevelConfig | $.properties.speedMin |
| speedMax | LevelConfig | conditional (speedMode=variable) | - | - | PRD | 5.1 LevelConfig | $.properties.speedMax |
| weakPointMove | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.weakPointMove |
| shieldEnabled | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.shieldEnabled |
| shieldType | LevelConfig | conditional (shieldEnabled=true) | - | enum: orbital, energy, breakable | PRD | 5.1 LevelConfig | $.properties.shieldType |
| shieldCount | LevelConfig | conditional (shieldEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.shieldCount |
| shieldSpeed | LevelConfig | conditional (shieldEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.shieldSpeed |
| regenEnabled | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.regenEnabled |
| regenBase | LevelConfig | conditional (regenEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.regenBase |
| regenDelay | LevelConfig | conditional (regenEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.regenDelay |
| reflectEnabled | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.reflectEnabled |
| reflectObjectType | LevelConfig | conditional (reflectEnabled=true) | - | enum: fixed, move, rotate | PRD | 5.1 LevelConfig | $.properties.reflectObjectType |
| reflectObjectCount | LevelConfig | conditional (reflectEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.reflectObjectCount |
| reflectMaxBounces | LevelConfig | conditional (reflectEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.reflectMaxBounces |
| limitNeedlesEnabled | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.limitNeedlesEnabled |
| limitNeedles | LevelConfig | conditional (limitNeedlesEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.limitNeedles |
| multiTargetEnabled | LevelConfig | required | - | - | PRD | 5.1 LevelConfig | $.properties.multiTargetEnabled |
| targetCount | LevelConfig | conditional (multiTargetEnabled=true) | - | - | PRD | 5.1 LevelConfig | $.properties.targetCount |
| bossPhases | LevelConfig | optional | - | - | PRD | 6.1 Level 15（回血Boss示例） | $.properties.bossPhases |
| bossPhases[].hpPct | LevelConfig | required | - | - | PRD | 6.1 Level 15（回血Boss示例） | $.properties.bossPhases.items.properties.hpPct |
| bossPhases[].speedMul | LevelConfig | optional | - | - | PRD | 6.1 Level 15（回血Boss示例） | $.properties.bossPhases.items.properties.speedMul |
| bossPhases[].regenMul | LevelConfig | optional | - | - | PRD | 6.1 Level 15（回血Boss示例） | $.properties.bossPhases.items.properties.regenMul |
| bossPhases[].addShield | LevelConfig | optional | false | - | User-Approved | 6.1 Level 15（回血Boss示例） | $.properties.bossPhases.items.properties.addShield |
| bossPhases[].weakPointMove | LevelConfig | optional | - | - | User-Approved | - | $.properties.bossPhases.items.properties.weakPointMove |

#### EconomyConfig

| Field | Config | Required | Default | Bounds | Source | PRD Ref | Schema Path |
| --- | --- | --- | --- | --- | --- | --- | --- |
| dropCoinP0 | EconomyConfig | required | 0.22 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.dropCoinP0 |
| dropCoinPMax | EconomyConfig | required | 0.55 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.dropCoinPMax |
| dropShardP0 | EconomyConfig | required | 0.04 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.dropShardP0 |
| dropShardPMax | EconomyConfig | required | 0.12 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.dropShardPMax |
| dropCardP0 | EconomyConfig | required | 0.015 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.dropCardP0 |
| dropCardPMax | EconomyConfig | required | 0.04 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.dropCardPMax |
| superNeedlePBase | EconomyConfig | required | 0.008 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.superNeedlePBase |
| superNeedlePMin | EconomyConfig | required | 0.003 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.superNeedlePMin |
| superNeedlePCap | EconomyConfig | required | 0.05 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.superNeedlePCap |
| gaugeA | EconomyConfig | required | 0.035 | - | PRD-Formula | 4.5 超级针（概率+保底） | $.properties.gaugeA |
| gaugeB | EconomyConfig | required | 0.03 | - | PRD-Formula | 4.5 超级针（概率+保底） | $.properties.gaugeB |
| gaugeC | EconomyConfig | required | 0.02 | - | PRD-Formula | 4.5 超级针（概率+保底） | $.properties.gaugeC |
| gaugeCarryFail | EconomyConfig | required | 0.2 | - | PRD-Recommended | 6.2 EconomyConfig（硬核推荐默认） | $.properties.gaugeCarryFail |
| pGamma | EconomyConfig | required | 0.5 | - | PRD-Formula | 4.5 超级针（概率+保底） | $.properties.pGamma |
| pQualityCoef | EconomyConfig | required | 0.25 | - | PRD-Formula | 4.5 超级针（概率+保底） | $.properties.pQualityCoef |

#### CombatFormulaConfig

| Field | Config | Required | Default | Bounds | Source | PRD Ref | Schema Path |
| --- | --- | --- | --- | --- | --- | --- | --- |
| comboBase | CombatFormulaConfig | required | 1.15 | - | PRD-Formula | 4.1 连击窗口随关卡收紧 | $.properties.comboBase |
| comboDecayPerLevel | CombatFormulaConfig | required | 0.01 | - | PRD-Formula | 4.1 连击窗口随关卡收紧 | $.properties.comboDecayPerLevel |
| comboMin | CombatFormulaConfig | required | 0.75 | - | PRD-Formula | 4.1 连击窗口随关卡收紧 | $.properties.comboMin |
| comboMistakeMul | CombatFormulaConfig | required | 0.4 | - | PRD-Formula | 4.2 失误惩罚（硬核） | $.properties.comboMistakeMul |
| M_alpha | CombatFormulaConfig | required | 0.8 | - | PRD-Formula | 4.3 连击倍率（慢增长） | $.properties.M_alpha |
| M_k | CombatFormulaConfig | required | 10 | - | PRD-Formula | 4.3 连击倍率（慢增长） | $.properties.M_k |
| Q_comboMaxCoef | CombatFormulaConfig | required | 0.08 | - | PRD-Formula | 4.4 掉落质量因子 | $.properties.Q_comboMaxCoef |
| Q_qualityCoef | CombatFormulaConfig | required | 0.15 | - | PRD-Formula | 4.4 掉落质量因子 | $.properties.Q_qualityCoef |
| Q_min | CombatFormulaConfig | required | 0.4 | - | PRD-Formula | 4.4 掉落质量因子 | $.properties.Q_min |
| Q_max | CombatFormulaConfig | required | 2.0 | - | PRD-Formula | 4.4 掉落质量因子 | $.properties.Q_max |
| regen_delta | CombatFormulaConfig | required | 1.6 | - | PRD-Formula | 4.6 回血与连击绑定 | $.properties.regen_delta |
| regen_eta | CombatFormulaConfig | required | 0.8 | - | PRD-Formula | 4.6 回血与连击绑定 | $.properties.regen_eta |

#### EnemyArchetypeConfig

| Field | Config | Required | Default | Bounds | Source | PRD Ref | Schema Path |
| --- | --- | --- | --- | --- | --- | --- | --- |
| archetypeId | EnemyArchetypeConfig | required | - | - | PRD | 5.2 EnemyArchetypeConfig | $.properties.archetypeId |
| baseScale | EnemyArchetypeConfig | required | - | - | PRD | 5.2 EnemyArchetypeConfig | $.properties.baseScale |
| hitShake | EnemyArchetypeConfig | required | 0 | min 0, max 5 | User-Approved | 5.2 EnemyArchetypeConfig | $.properties.hitShake |
| coreGlow | EnemyArchetypeConfig | required | - | - | PRD | 5.2 EnemyArchetypeConfig | $.properties.coreGlow |
| shellOpacity | EnemyArchetypeConfig | required | - | - | PRD | 5.2 EnemyArchetypeConfig | $.properties.shellOpacity |
| weakPointStyle | EnemyArchetypeConfig | required | - | enum: crack, pulse, ring | PRD | 5.2 EnemyArchetypeConfig | $.properties.weakPointStyle |
| deathStyle | EnemyArchetypeConfig | required | - | enum: shatter, peel, explode | PRD | 5.2 EnemyArchetypeConfig | $.properties.deathStyle |

#### VariantConfig

| Field | Config | Required | Default | Bounds | Source | PRD Ref | Schema Path |
| --- | --- | --- | --- | --- | --- | --- | --- |
| variantId | VariantConfig | required | - | - | PRD | 5.3 VariantConfig | $.properties.variantId |
| archetypeId | VariantConfig | required | - | - | PRD | 5.3 VariantConfig | $.properties.archetypeId |
| colorTheme | VariantConfig | required | - | - | PRD | 5.3 VariantConfig | $.properties.colorTheme |
| noiseStrength | VariantConfig | required | - | - | PRD | 5.3 VariantConfig | $.properties.noiseStrength |
| pulseFreq | VariantConfig | required | - | - | PRD | 5.3 VariantConfig | $.properties.pulseFreq |
| shieldOrbitRadius | VariantConfig | optional (if applicable) | - | - | PRD | 5.3 VariantConfig | $.properties.shieldOrbitRadius |
| gridDensity | VariantConfig | optional (if applicable) | - | - | PRD | 5.3 VariantConfig | $.properties.gridDensity |
| decoyRatio | VariantConfig | optional (if applicable) | - | - | PRD | 5.3 VariantConfig | $.properties.decoyRatio |

---

### 3.2 LevelConfig schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "schemas/LevelConfig.schema.json",
  "title": "LevelConfig",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "levelId",
    "enemyArchetype",
    "variantId",
    "hp",
    "weakPointCount",
    "rotateSpeed",
    "speedMode",
    "weakPointMove",
    "shieldEnabled",
    "regenEnabled",
    "reflectEnabled",
    "limitNeedlesEnabled",
    "multiTargetEnabled"
  ],
  "properties": {
    "levelId": { "type": "integer" },

    "enemyArchetype": {
      "type": "string",
      "enum": [
        "Standard",
        "VariableSpin",
        "OrbitalShield",
        "EnergyShield",
        "Regenerator",
        "RearCore",
        "Reflector",
        "Decoy",
        "Fusion",
        "FinalBoss"
      ]
    },
    "variantId": { "type": "string" },

    "hp": { "type": "integer" },
    "weakPointCount": { "type": "integer" },

    "rotateSpeed": { "type": "number" },

    "speedMode": { "type": "string", "enum": ["fixed", "variable"] },
    "speedMin": { "type": "number" },
    "speedMax": { "type": "number" },

    "weakPointMove": { "type": "boolean" },

    "shieldEnabled": { "type": "boolean" },
    "shieldType": {
      "type": "string",
      "enum": ["orbital", "energy", "breakable"]
    },
    "shieldCount": { "type": "integer" },
    "shieldSpeed": { "type": "number" },

    "regenEnabled": { "type": "boolean" },
    "regenBase": { "type": "number" },
    "regenDelay": { "type": "number" },

    "reflectEnabled": { "type": "boolean" },
    "reflectObjectType": { "type": "string", "enum": ["fixed", "move", "rotate"] },
    "reflectObjectCount": { "type": "integer" },
    "reflectMaxBounces": { "type": "integer" },

    "limitNeedlesEnabled": { "type": "boolean" },
    "limitNeedles": { "type": "integer" },

    "multiTargetEnabled": { "type": "boolean" },
    "targetCount": { "type": "integer" },

    "bossPhases": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["hpPct"],
        "properties": {
          "hpPct": { "type": "number" },
          "speedMul": { "type": "number" },
          "regenMul": { "type": "number" },
          "addShield": { "type": "boolean", "default": false },
          "weakPointMove": { "type": "boolean" }
        }
      }
    }
  },
  "allOf": [
    {
      "if": { "properties": { "speedMode": { "const": "variable" } } },
      "then": { "required": ["speedMin", "speedMax"] }
    },
    {
      "if": { "properties": { "shieldEnabled": { "const": true } } },
      "then": { "required": ["shieldType", "shieldCount", "shieldSpeed"] }
    },
    {
      "if": { "properties": { "regenEnabled": { "const": true } } },
      "then": { "required": ["regenBase", "regenDelay"] }
    },
    {
      "if": { "properties": { "reflectEnabled": { "const": true } } },
      "then": { "required": ["reflectObjectType", "reflectObjectCount", "reflectMaxBounces"] }
    },
    {
      "if": { "properties": { "limitNeedlesEnabled": { "const": true } } },
      "then": { "required": ["limitNeedles"] }
    },
    {
      "if": { "properties": { "multiTargetEnabled": { "const": true } } },
      "then": { "required": ["targetCount"] }
    }
  ]
}
```
### 3.3 EconomyConfig schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "schemas/EconomyConfig.schema.json",
  "title": "EconomyConfig",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "dropCoinP0", "dropCoinPMax",
    "dropShardP0", "dropShardPMax",
    "dropCardP0", "dropCardPMax",
    "superNeedlePBase", "superNeedlePMin", "superNeedlePCap",
    "gaugeA", "gaugeB", "gaugeC",
    "gaugeCarryFail",
    "pGamma", "pQualityCoef"
  ],
  "properties": {
    "dropCoinP0": { "type": "number", "default": 0.22 },
    "dropCoinPMax": { "type": "number", "default": 0.55 },

    "dropShardP0": { "type": "number", "default": 0.04 },
    "dropShardPMax": { "type": "number", "default": 0.12 },

    "dropCardP0": { "type": "number", "default": 0.015 },
    "dropCardPMax": { "type": "number", "default": 0.04 },

    "superNeedlePBase": { "type": "number", "default": 0.008 },
    "superNeedlePMin": { "type": "number", "default": 0.003 },
    "superNeedlePCap": { "type": "number", "default": 0.05 },

    "gaugeA": { "type": "number", "default": 0.035 },
    "gaugeB": { "type": "number", "default": 0.03 },
    "gaugeC": { "type": "number", "default": 0.02 },

    "gaugeCarryFail": { "type": "number", "default": 0.2 },

    "pGamma": { "type": "number", "default": 0.5 },
    "pQualityCoef": { "type": "number", "default": 0.25 }
  }
}
```
### 3.4 CombatFormulaConfig schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "schemas/CombatFormulaConfig.schema.json",
  "title": "CombatFormulaConfig",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "comboBase", "comboDecayPerLevel", "comboMin",
    "comboMistakeMul",
    "M_alpha", "M_k",
    "Q_comboMaxCoef", "Q_qualityCoef", "Q_min", "Q_max",
    "regen_delta", "regen_eta"
  ],
  "properties": {
    "comboBase": { "type": "number", "default": 1.15 },
    "comboDecayPerLevel": { "type": "number", "default": 0.01 },
    "comboMin": { "type": "number", "default": 0.75 },

    "comboMistakeMul": { "type": "number", "default": 0.4 },

    "M_alpha": { "type": "number", "default": 0.8 },
    "M_k": { "type": "number", "default": 10 },

    "Q_comboMaxCoef": { "type": "number", "default": 0.08 },
    "Q_qualityCoef": { "type": "number", "default": 0.15 },
    "Q_min": { "type": "number", "default": 0.4 },
    "Q_max": { "type": "number", "default": 2.0 },

    "regen_delta": { "type": "number", "default": 1.6 },
    "regen_eta": { "type": "number", "default": 0.8 }
  }
}
```
### 3.5 EnemyArchetypeConfig schema (visual/behavior base)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "schemas/EnemyArchetypeConfig.schema.json",
  "title": "EnemyArchetypeConfig",
  "type": "object",
  "additionalProperties": false,
  "required": ["archetypeId", "baseScale", "hitShake", "shellOpacity", "coreGlow", "weakPointStyle", "deathStyle"],
  "properties": {
    "archetypeId": { "type": "string" },
    "baseScale": { "type": "number" },
    "hitShake": { "type": "number", "minimum": 0, "maximum": 5, "default": 0 },
    "shellOpacity": { "type": "number" },
    "coreGlow": { "type": "number" },
    "weakPointStyle": { "type": "string", "enum": ["crack", "pulse", "ring"] },
    "deathStyle": { "type": "string", "enum": ["shatter", "peel", "explode"] }
  }
}
```

### 3.6 VariantConfig schema (low-cost variants)

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "schemas/VariantConfig.schema.json",
  "title": "VariantConfig",
  "type": "object",
  "additionalProperties": false,
  "required": ["variantId", "archetypeId", "colorTheme", "noiseStrength", "pulseFreq"],
  "properties": {
    "variantId": { "type": "string" },
    "archetypeId": { "type": "string" },

    "colorTheme": { "type": "string" },
    "noiseStrength": { "type": "number" },
    "pulseFreq": { "type": "number" },

    "shieldOrbitRadius": { "type": "number" },
    "gridDensity": { "type": "number" },
    "decoyRatio": { "type": "number" }
  }
}
```

### 3.7 Validation commands (CI)

```
node scripts/validate-schemas.mjs
# Expected: SCHEMAS_OK (CI with configs)
# If configs missing: CONFIGS_MISSING:<list> and non-zero exit

node scripts/check-spec-sync.mjs
# Expected: SPEC_SYNC_OK
```

------

## 4. Minimal Example Configs

### 4.1 EconomyConfig.json (hardcore default)

```
{
  "dropCoinP0": 0.22, "dropCoinPMax": 0.55,
  "dropShardP0": 0.04, "dropShardPMax": 0.12,
  "dropCardP0": 0.015, "dropCardPMax": 0.04,

  "superNeedlePBase": 0.008,
  "superNeedlePMin": 0.003,
  "superNeedlePCap": 0.05,

  "gaugeA": 0.035,
  "gaugeB": 0.03,
  "gaugeC": 0.02,
  "gaugeCarryFail": 0.2,

  "pGamma": 0.5,
  "pQualityCoef": 0.25
}
```

### 4.2 CombatFormulaConfig.json (hardcore default)

```
{
  "comboBase": 1.15,
  "comboDecayPerLevel": 0.01,
  "comboMin": 0.75,
  "comboMistakeMul": 0.4,

  "M_alpha": 0.8,
  "M_k": 10,

  "Q_comboMaxCoef": 0.08,
  "Q_qualityCoef": 0.15,
  "Q_min": 0.4,
  "Q_max": 2.0,

  "regen_delta": 1.6,
  "regen_eta": 0.8
}
```

### 4.3 LevelConfig.json (MVP sample 3 levels)

```
[
  {
    "levelId": 1,
    "enemyArchetype": "Standard",
    "variantId": "S1",
    "hp": 5,
    "weakPointCount": 2,
    "rotateSpeed": 0.6,
    "speedMode": "fixed",
    "weakPointMove": false,
    "shieldEnabled": false,
    "regenEnabled": false,
    "reflectEnabled": false,
    "limitNeedlesEnabled": false,
    "multiTargetEnabled": false
  },
  {
    "levelId": 6,
    "enemyArchetype": "OrbitalShield",
    "variantId": "O1",
    "hp": 10,
    "weakPointCount": 3,
    "rotateSpeed": 1.0,
    "speedMode": "fixed",
    "weakPointMove": false,
    "shieldEnabled": true,
    "shieldType": "orbital",
    "shieldCount": 1,
    "shieldSpeed": 0.9,
    "regenEnabled": false,
    "reflectEnabled": false,
    "limitNeedlesEnabled": false,
    "multiTargetEnabled": false
  },
  {
    "levelId": 16,
    "enemyArchetype": "RearCore",
    "variantId": "B1",
    "hp": 12,
    "weakPointCount": 1,
    "rotateSpeed": 1.2,
    "speedMode": "fixed",
    "weakPointMove": false,
    "shieldEnabled": false,
    "regenEnabled": false,
    "reflectEnabled": true,
    "reflectObjectType": "move",
    "reflectObjectCount": 1,
    "reflectMaxBounces": 1,
    "limitNeedlesEnabled": false,
    "multiTargetEnabled": false
  }
]
```

------

## 5. Implementation Requirements

### 5.1 Deterministic RNG (dev + QA)

- Provide `seed` for deterministic runs in dev builds.
- All probability checks must use the same RNG source.

### 5.2 Performance constraints (WeChat)

- Must use object pools for: Needles, VFX particles, Debris.
- Avoid per-frame allocations in Update loops.
- Avoid frequent dynamic resource loads during gameplay; preload per level/subpackage.

### 5.3 No heavy physics requirement

- Needle path is linear (ray/segment).
- WeakPoint collider can be circle.
- Shield collider can be ring/segment.
- Reflect objects: line segment/rect; reflect via vector math (do not rely on full physics engine).

------

## 6. Acceptance Checklist (per milestone)

M1: single level playable

- Shoot -> hit weakpoint -> hp decreases -> kill -> win screen
- DebugPanel shows required fields (values can be 0 for unimplemented subsystems)

M2: hard formulas integrated

- combo/quality updates on hit/mistake
- gauge increases and grants super needle
- regen rate changes with combo/quality in regen levels

M3: data-driven 30 levels

- level loader swaps configs correctly
- at least: shield level, regen level, reflect level run correctly
