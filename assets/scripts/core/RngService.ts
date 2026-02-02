export class RngService {
  private seed: number;

  /**
   * Create deterministic RNG with a seed.
   * @param seed Initial seed
   */
  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  /**
   * Get next random value in [0,1).
   * @returns Random number
   */
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0xffffffff;
  }
}
