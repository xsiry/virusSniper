import { resources, JsonAsset } from 'cc';
import { ConfigBundle, LevelConfig, EconomyConfig, CombatFormulaConfig, EnemyArchetypeConfig, VariantConfig } from '../data/ConfigTypes';

export class ConfigLoader {
  /**
   * Load all config JSON assets from the main bundle.
   * @returns Promise<ConfigBundle>
   */
  static async loadAll(): Promise<ConfigBundle> {
    const [levels, economy, combatFormula, archetypes, variants] = await Promise.all([
      this.loadJson<LevelConfig[]>('config/LevelConfig'),
      this.loadJson<EconomyConfig>('config/EconomyConfig'),
      this.loadJson<CombatFormulaConfig>('config/CombatFormulaConfig'),
      this.loadJson<EnemyArchetypeConfig[]>('config/EnemyArchetypeConfig'),
      this.loadJson<VariantConfig[]>('config/VariantConfig')
    ]);

    return {
      levels,
      economy,
      combatFormula,
      archetypes,
      variants
    };
  }

  /**
   * Load a JSON asset by path.
   * @param path Resource path without extension
   * @returns Promise<T>
   */
  private static loadJson<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      resources.load(path, JsonAsset, (err: Error | null, asset: JsonAsset | null) => {
        if (err || !asset) {
          reject(err ?? new Error(`Failed to load ${path}`));
          return;
        }
        resolve(asset.json as T);
      });
    });
  }
}
