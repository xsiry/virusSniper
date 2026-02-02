export type EnemyArchetypeId =
  | 'Standard'
  | 'VariableSpin'
  | 'OrbitalShield'
  | 'EnergyShield'
  | 'Regenerator'
  | 'RearCore'
  | 'Reflector'
  | 'Decoy'
  | 'Fusion'
  | 'FinalBoss';

export type SpeedMode = 'fixed' | 'variable';
export type ShieldType = 'orbital' | 'energy' | 'breakable';
export type ReflectObjectType = 'fixed' | 'move' | 'rotate';

export interface BossPhaseConfig {
  hpPct: number;
  speedMul?: number;
  regenMul?: number;
  addShield?: boolean;
  weakPointMove?: boolean;
}

export interface LevelConfig {
  levelId: number;
  enemyArchetype: EnemyArchetypeId;
  variantId: string;
  hp: number;
  weakPointCount: number;
  rotateSpeed: number;
  speedMode: SpeedMode;
  speedMin?: number;
  speedMax?: number;
  weakPointMove: boolean;
  shieldEnabled: boolean;
  shieldType?: ShieldType;
  shieldCount?: number;
  shieldSpeed?: number;
  regenEnabled: boolean;
  regenBase?: number;
  regenDelay?: number;
  reflectEnabled: boolean;
  reflectObjectType?: ReflectObjectType;
  reflectObjectCount?: number;
  reflectMaxBounces?: number;
  limitNeedlesEnabled: boolean;
  limitNeedles?: number;
  multiTargetEnabled: boolean;
  targetCount?: number;
  bossPhases?: BossPhaseConfig[];
}

export interface EconomyConfig {
  dropCoinP0: number;
  dropCoinPMax: number;
  dropShardP0: number;
  dropShardPMax: number;
  dropCardP0: number;
  dropCardPMax: number;
  superNeedlePBase: number;
  superNeedlePMin: number;
  superNeedlePCap: number;
  gaugeA: number;
  gaugeB: number;
  gaugeC: number;
  gaugeCarryFail: number;
  pGamma: number;
  pQualityCoef: number;
}

export interface CombatFormulaConfig {
  comboBase: number;
  comboDecayPerLevel: number;
  comboMin: number;
  comboMistakeMul: number;
  M_alpha: number;
  M_k: number;
  Q_comboMaxCoef: number;
  Q_qualityCoef: number;
  Q_min: number;
  Q_max: number;
  regen_delta: number;
  regen_eta: number;
}

export interface EnemyArchetypeConfig {
  archetypeId: EnemyArchetypeId;
  baseScale: number;
  hitShake: number;
  shellOpacity: number;
  coreGlow: number;
  weakPointStyle: 'crack' | 'pulse' | 'ring';
  deathStyle: 'shatter' | 'peel' | 'explode';
}

export interface VariantConfig {
  variantId: string;
  archetypeId: EnemyArchetypeId;
  colorTheme: string;
  noiseStrength: number;
  pulseFreq: number;
  shieldOrbitRadius?: number;
  gridDensity?: number;
  decoyRatio?: number;
}

export interface ConfigBundle {
  levels: LevelConfig[];
  economy: EconomyConfig;
  combatFormula: CombatFormulaConfig;
  archetypes: EnemyArchetypeConfig[];
  variants: VariantConfig[];
}
