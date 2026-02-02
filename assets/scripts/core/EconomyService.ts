import { EconomyConfig } from '../data/ConfigTypes';

export class EconomyService {
  constructor(private readonly config: EconomyConfig) {}

  /**
   * Compute drop probabilities based on Q.
   * @param Q Quality factor
   * @returns Object with coin/shard/card probabilities
   */
  computeDropProbs(Q: number) {
    return {
      coin: this.clamp(this.config.dropCoinP0 * Q, 0, this.config.dropCoinPMax),
      shard: this.clamp(this.config.dropShardP0 * Q, 0, this.config.dropShardPMax),
      card: this.clamp(this.config.dropCardP0 * Q, 0, this.config.dropCardPMax)
    };
  }

  /**
   * Compute gauge delta for super needle.
   * @param M Combo multiplier
   * @param comboQuality Quality value
   * @returns Gauge delta
   */
  computeGaugeDelta(M: number, comboQuality: number): number {
    return this.config.gaugeA + this.config.gaugeB * (M - 1) + this.config.gaugeC * Math.max(0, comboQuality);
  }

  /**
   * Apply gauge carry on fail.
   * @param value Current gauge
   * @returns Carried gauge
   */
  carryGaugeOnFail(value: number): number {
    return value * this.config.gaugeCarryFail;
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
