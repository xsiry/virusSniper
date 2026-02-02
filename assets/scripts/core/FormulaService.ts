import { CombatFormulaConfig, EconomyConfig } from '../data/ConfigTypes';

export class FormulaService {
  constructor(private readonly config: CombatFormulaConfig) {}

  /**
   * Compute combo window duration for a given level index.
   * @param levelIndex Level id/index
   * @returns Combo window in seconds
   */
  comboWindow(levelIndex: number): number {
    const value = this.config.comboBase - this.config.comboDecayPerLevel * (levelIndex - 1);
    return this.clamp(value, this.config.comboMin, this.config.comboBase);
  }

  /**
   * Compute combo multiplier M.
   * @param combo Current combo count
   * @returns Multiplier M
   */
  computeM(combo: number): number {
    return 1 + this.config.M_alpha * (1 - Math.exp(-combo / this.config.M_k));
  }

  /**
   * Compute quality factor Q.
   * @param comboMax Max combo reached
   * @param comboQuality Quality value
   * @returns Quality factor Q
   */
  computeQ(comboMax: number, comboQuality: number): number {
    const value = 1 + this.config.Q_comboMaxCoef * comboMax + this.config.Q_qualityCoef * comboQuality;
    return this.clamp(value, this.config.Q_min, this.config.Q_max);
  }

  /**
   * Compute regen rate with combo suppression.
   * @param regenBase Base regen rate
   * @param M Combo multiplier
   * @param comboQuality Quality value
   * @returns Regen rate
   */
  computeRegenRate(regenBase: number, M: number, comboQuality: number): number {
    return regenBase / (1 + this.config.regen_delta * (M - 1) + this.config.regen_eta * Math.max(0, comboQuality));
  }

  /**
   * Apply mistake rule to combo count.
   * @param combo Current combo
   * @returns New combo count
   */
  applyMistakeCombo(combo: number): number {
    return Math.floor(combo * this.config.comboMistakeMul);
  }

  /**
   * Compute super needle probability.
   * @param economy Economy config
   * @param M Combo multiplier
   * @param comboQuality Quality value
   * @returns Probability in [pMin, pCap]
   */
  computeSuperNeedleP(economy: EconomyConfig, M: number, comboQuality: number): number {
    const value = economy.superNeedlePBase * (1 + economy.pGamma * (M - 1)) * (1 + economy.pQualityCoef * comboQuality);
    return this.clamp(value, economy.superNeedlePMin, economy.superNeedlePCap);
  }

  /**
   * Clamp a value into [min, max].
   * @param value Input value
   * @param min Minimum
   * @param max Maximum
   * @returns Clamped value
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
