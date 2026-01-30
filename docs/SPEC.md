# SPEC.md — Virus Sniper (WeChat MiniGame) — Engineering Spec (Cocos Creator 3.8.8)

> Scope: MVP + 30 levels, Sprite/Graphics route.
> Engine: Cocos Creator 3.8.8, TypeScript, data-driven configs.
> Hard-mode formulas are authoritative (do NOT change without updating this spec).

---

## 0. Repository Conventions

### 0.1 Config file paths (authoritative)
- `assets/config/LevelConfig.json` (array of LevelConfig)
- `assets/config/EconomyConfig.json` (single EconomyConfig)
- `assets/config/FormulaConfig.json` (single FormulaConfig)
- `assets/config/EnemyArchetypeConfig.json` (array)
- `assets/config/VariantConfig.json` (array)

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
  - else => `combo = 1` (and this event is also treated as Timeout mistake if you maintain a separate timer; implementation may set combo=1 and apply mistake policy—see FormulaConfig flag)
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
- `levelId` is 1..999
- All rates/speeds are positive floats.
- Enums must match exactly.

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
    "shieldEnabled",
    "regenEnabled",
    "reflectEnabled",
    "limitNeedlesEnabled",
    "multiTargetEnabled"
  ],
  "properties": {
    "levelId": { "type": "integer", "minimum": 1, "maximum": 999 },

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
    "variantId": { "type": "string", "minLength": 1, "maxLength": 16 },

    "hp": { "type": "integer", "minimum": 1, "maximum": 9999 },
    "weakPointCount": { "type": "integer", "minimum": 1, "maximum": 12 },

    "rotateSpeed": { "type": "number", "exclusiveMinimum": 0, "maximum": 10 },

    "speedMode": { "type": "string", "enum": ["fixed", "variable"] },
    "speedMin": { "type": "number", "exclusiveMinimum": 0, "maximum": 10 },
    "speedMax": { "type": "number", "exclusiveMinimum": 0, "maximum": 10 },

    "weakPointMove": { "type": "boolean", "default": false },

    "shieldEnabled": { "type": "boolean" },
    "shieldType": {
      "type": "string",
      "enum": ["orbital", "energy", "breakable"],
      "default": "orbital"
    },
    "shieldCount": { "type": "integer", "minimum": 0, "maximum": 6, "default": 0 },
    "shieldSpeed": { "type": "number", "minimum": 0, "maximum": 10, "default": 1.0 },

    "regenEnabled": { "type": "boolean" },
    "regenBase": { "type": "number", "minimum": 0, "maximum": 10, "default": 0.0 },
    "regenDelay": { "type": "number", "minimum": 0, "maximum": 10, "default": 1.5 },

    "reflectEnabled": { "type": "boolean" },
    "reflectObjectType": { "type": "string", "enum": ["fixed", "move", "rotate"], "default": "fixed" },
    "reflectObjectCount": { "type": "integer", "minimum": 0, "maximum": 4, "default": 0 },
    "reflectMaxBounces": { "type": "integer", "minimum": 0, "maximum": 3, "default": 0 },

    "limitNeedlesEnabled": { "type": "boolean" },
    "limitNeedles": { "type": "integer", "minimum": 1, "maximum": 999, "default": 999 },

    "multiTargetEnabled": { "type": "boolean" },
    "targetCount": { "type": "integer", "minimum": 1, "maximum": 3, "default": 1 },

    "bossPhases": {
      "type": "array",
      "maxItems": 5,
      "default": [],
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["hpPct"],
        "properties": {
          "hpPct": { "type": "number", "exclusiveMinimum": 0, "exclusiveMaximum": 1 },
          "speedMul": { "type": "number", "minimum": 0.5, "maximum": 3, "default": 1.0 },
          "regenMul": { "type": "number", "minimum": 0, "maximum": 3, "default": 1.0 },
          "shieldAdd": { "type": "integer", "minimum": 0, "maximum": 3, "default": 0 },
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
    "dropCoinP0": { "type": "number", "minimum": 0, "maximum": 1 },
    "dropCoinPMax": { "type": "number", "minimum": 0, "maximum": 1 },

    "dropShardP0": { "type": "number", "minimum": 0, "maximum": 1 },
    "dropShardPMax": { "type": "number", "minimum": 0, "maximum": 1 },

    "dropCardP0": { "type": "number", "minimum": 0, "maximum": 1 },
    "dropCardPMax": { "type": "number", "minimum": 0, "maximum": 1 },

    "superNeedlePBase": { "type": "number", "minimum": 0, "maximum": 1 },
    "superNeedlePMin": { "type": "number", "minimum": 0, "maximum": 1 },
    "superNeedlePCap": { "type": "number", "minimum": 0, "maximum": 1 },

    "gaugeA": { "type": "number", "minimum": 0, "maximum": 1 },
    "gaugeB": { "type": "number", "minimum": 0, "maximum": 1 },
    "gaugeC": { "type": "number", "minimum": 0, "maximum": 1 },

    "gaugeCarryFail": { "type": "number", "minimum": 0, "maximum": 1 },

    "pGamma": { "type": "number", "minimum": 0, "maximum": 5 },
    "pQualityCoef": { "type": "number", "minimum": 0, "maximum": 2 }
  }
}
```
### 3.4 FormulaConfig schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "schemas/FormulaConfig.schema.json",
  "title": "FormulaConfig",
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
    "comboBase": { "type": "number", "minimum": 0.1, "maximum": 3 },
    "comboDecayPerLevel": { "type": "number", "minimum": 0, "maximum": 0.1 },
    "comboMin": { "type": "number", "minimum": 0.2, "maximum": 2 },

    "comboMistakeMul": { "type": "number", "minimum": 0, "maximum": 1 },

    "M_alpha": { "type": "number", "minimum": 0, "maximum": 3 },
    "M_k": { "type": "number", "minimum": 1, "maximum": 50 },

    "Q_comboMaxCoef": { "type": "number", "minimum": 0, "maximum": 1 },
    "Q_qualityCoef": { "type": "number", "minimum": 0, "maximum": 1 },
    "Q_min": { "type": "number", "minimum": 0, "maximum": 5 },
    "Q_max": { "type": "number", "minimum": 0, "maximum": 5 },

    "regen_delta": { "type": "number", "minimum": 0, "maximum": 10 },
    "regen_eta": { "type": "number", "minimum": 0, "maximum": 10 }
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
  "required": ["archetypeId", "baseScale", "shellOpacity", "coreGlow", "weakPointStyle", "deathStyle"],
  "properties": {
    "archetypeId": { "type": "string" },
    "baseScale": { "type": "number", "minimum": 0.1, "maximum": 5 },
    "shellOpacity": { "type": "number", "minimum": 0, "maximum": 1 },
    "coreGlow": { "type": "number", "minimum": 0, "maximum": 10 },
    "weakPointStyle": { "type": "string", "enum": ["crackPulse", "pulseDot", "ringPulse"] },
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
    "variantId": { "type": "string", "minLength": 1, "maxLength": 16 },
    "archetypeId": { "type": "string" },

    "colorTheme": { "type": "string", "enum": ["green", "cyan", "purple", "red", "gold"] },
    "noiseStrength": { "type": "number", "minimum": 0, "maximum": 1 },
    "pulseFreq": { "type": "number", "minimum": 0.1, "maximum": 10 },

    "shieldOrbitRadius": { "type": "number", "minimum": 0, "maximum": 5, "default": 1.0 },
    "gridDensity": { "type": "number", "minimum": 0, "maximum": 5, "default": 1.0 },
    "decoyRatio": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.0 }
  }
}
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

### 4.2 FormulaConfig.json (hardcore default)

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

