import { ConfigBundle, EnemyArchetypeConfig, LevelConfig, VariantConfig } from '../data/ConfigTypes';

export class ConfigRepo {
  static readonly instance = new ConfigRepo();

  levels: LevelConfig[] = [];
  economy = null as ConfigBundle['economy'] | null;
  combatFormula = null as ConfigBundle['combatFormula'] | null;
  archetypes: EnemyArchetypeConfig[] = [];
  variants: VariantConfig[] = [];

  /**
   * Initialize repository with loaded configs.
   * @param bundle Config data bundle
   * @returns void
   */
  initialize(bundle: ConfigBundle) {
    this.levels = bundle.levels;
    this.economy = bundle.economy;
    this.combatFormula = bundle.combatFormula;
    this.archetypes = bundle.archetypes;
    this.variants = bundle.variants;
  }

  /**
   * Find a level config by levelId.
   * @param levelId Level id
   * @returns LevelConfig or null
   */
  getLevel(levelId: number): LevelConfig | null {
    return this.levels.find((level) => level.levelId === levelId) ?? null;
  }

  /**
   * Find a variant config by variantId.
   * @param variantId Variant id
   * @returns VariantConfig or null
   */
  getVariant(variantId: string): VariantConfig | null {
    return this.variants.find((variant) => variant.variantId === variantId) ?? null;
  }

  /**
   * Find an archetype config by id.
   * @param archetypeId Archetype id
   * @returns EnemyArchetypeConfig or null
   */
  getArchetype(archetypeId: EnemyArchetypeConfig['archetypeId']): EnemyArchetypeConfig | null {
    return this.archetypes.find((arch) => arch.archetypeId === archetypeId) ?? null;
  }
}
