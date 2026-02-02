import { ConfigRepo } from './ConfigRepo';
import { EconomyService } from './EconomyService';
import { FormulaService } from './FormulaService';
import { RngService } from './RngService';

export type HitType = 'WeakPoint' | 'Shield' | 'Miss' | 'Timeout';

export class GameSession {
  levelId: number;
  hpCurrent = 0;
  hpMax = 0;
  levelCleared = false;
  levelFailed = false;
  rotateSpeedCurrent = 0;
  combo = 0;
  comboMax = 0;
  comboQuality = 0;
  comboWindowT = 0;
  comboElapsed = 0;
  gauge = 0;
  pSuperNeedle = 0;
  regenRateCurrent = 0;
  M = 1;
  Q = 1;
  superNeedleCount = 0;
  useSuper = false;
  coins = 0;
  shards = 0;
  cards = 0;
  bossPhaseActive = 0;
  bossPhaseTotal = 0;
  limitNeedlesEnabled = false;
  needlesRemaining = 0;
  lastHitType: HitType = 'Miss';
  paused = false;
  
  // Time control
  public timeScale = 1.0;
  private hitStopTimer = 0;

  /**
   * Create a new gameplay session.
   * @param levelId Level id
   * @param repo Config repository
   * @param formula Formula service
   * @param economy Economy service
   * @param rng Deterministic RNG
   */
  constructor(
    levelId: number,
    private readonly repo: ConfigRepo,
    private readonly formula: FormulaService,
    private readonly economy: EconomyService,
    private readonly rng: RngService
  ) {
    this.levelId = levelId;
    const level = repo.getLevel(levelId);
    if (level) {
      this.resetForLevel(levelId, level.hp, level.rotateSpeed);
    }
  }

  /**
   * Advance timers for combo window tracking and hit stop.
   * @param dt Delta time seconds
   * @returns void
   */
  advanceTime(dt: number) {
    // Hit stop logic
    if (this.hitStopTimer > 0) {
        this.hitStopTimer -= dt;
        if (this.hitStopTimer <= 0) {
            this.timeScale = 1.0;
            this.hitStopTimer = 0;
        } else {
            this.timeScale = 0.05; // Almost frozen
        }
    }

    if (this.combo > 0) {
      this.comboElapsed += dt; // Note: This should ideally use unscaled time if we want fair windows, but scaled feels 'epic'
    }
  }

  /**
   * Trigger a short time freeze.
   * @param duration Duration in real-time seconds (approx)
   */
  requestHitStop(duration: number) {
      this.hitStopTimer = duration;
      this.timeScale = 0.05;
  }

  /**
   * Apply weak point hit effects.
   * @returns void
   */
  onWeakPointHit() {
    const timedOut = this.combo > 0 && this.comboElapsed > this.comboWindowT;
    if (timedOut) {
      this.lastHitType = 'Timeout';
      this.combo = 1;
      this.comboQuality -= 1;
    } else {
      this.lastHitType = 'WeakPoint';
      this.combo = this.combo > 0 ? this.combo + 1 : 1;
    }
    this.comboMax = Math.max(this.comboMax, this.combo);
    this.comboElapsed = 0;

    this.refreshDerived();

    const delta = this.economy.computeGaugeDelta(this.M, this.comboQuality);
    this.gauge += delta;

    const roll = this.rng.next();
    if (this.gauge >= 1 || roll <= this.pSuperNeedle) {
      this.superNeedleCount += 1;
      this.gauge = 0;
    }
  }

  /**
   * Apply drop rolls using current Q.
   * @returns Object containing dropped counts
   */
  applyDrops(): { coins: number; shards: number; cards: number } {
    const dropped = { coins: 0, shards: 0, cards: 0 };
    const probs = this.economy.computeDropProbs(this.Q);
    if (this.rng.next() <= probs.coin) {
      this.coins += 1;
      dropped.coins = 1;
    }
    if (this.rng.next() <= probs.shard) {
      this.shards += 1;
      dropped.shards = 1;
    }
    if (this.rng.next() <= probs.card) {
      this.cards += 1;
      dropped.cards = 1;
    }
    return dropped;
  }

  /**
   * Apply shield hit penalty.
   * @returns void
   */
  onShieldHit() {
    this.applyMistake('Shield');
  }

  /**
   * Apply miss penalty.
   * @returns void
   */
  onMiss() {
    this.applyMistake('Miss');
  }

  /**
   * Recompute derived values (M, Q, regen, pSuper).
   * @returns void
   */
  refreshDerived() {
    const M = this.formula.computeM(this.combo);
    const Q = this.formula.computeQ(this.comboMax, this.comboQuality);
    this.M = M;
    this.Q = Q;
    if (this.repo.economy && this.repo.combatFormula) {
      this.pSuperNeedle = this.formula.computeSuperNeedleP(this.repo.economy, M, this.comboQuality);
      if (this.repo.getLevel(this.levelId)?.regenEnabled && this.repo.getLevel(this.levelId)?.regenBase) {
        this.regenRateCurrent = this.formula.computeRegenRate(this.repo.getLevel(this.levelId)!.regenBase!, M, this.comboQuality);
      }
    }
  }

  /**
   * Reset session state for a new level.
   * @param levelId Level id
   * @param hp Max HP
   * @param rotateSpeed Base rotate speed
   * @returns void
   */
  resetForLevel(levelId: number, hp: number, rotateSpeed: number) {
    this.levelId = levelId;
    this.hpMax = hp;
    this.hpCurrent = hp;
    this.levelCleared = false;
    this.levelFailed = false;
    this.rotateSpeedCurrent = rotateSpeed;
    this.combo = 0;
    this.comboMax = 0;
    this.comboQuality = 0;
    this.comboElapsed = 0;
    this.comboWindowT = this.formula.comboWindow(levelId);
    this.gauge = 0;
    this.pSuperNeedle = 0;
    this.regenRateCurrent = 0;
    this.M = 1;
    this.Q = 1;
    this.lastHitType = 'Miss';
    this.superNeedleCount = 0;
    this.useSuper = false;
    this.bossPhaseActive = 0;
    this.bossPhaseTotal = 0;
    this.limitNeedlesEnabled = false;
    this.needlesRemaining = 0;
    this.paused = false;
    this.refreshDerived();
  }

  /**
   * Update boss phase progress for UI/debug display.
   * @param active Active phase count
   * @param total Total phase count
   * @returns void
   */
  updateBossPhase(active: number, total: number) {
    this.bossPhaseActive = active;
    this.bossPhaseTotal = total;
  }

  /**
   * Configure needle limit for the level.
   * @param enabled Whether needle limit is enabled
   * @param limit Total needle count
   * @returns void
   */
  configureNeedleLimit(enabled: boolean, limit: number) {
    this.limitNeedlesEnabled = enabled;
    this.needlesRemaining = enabled ? Math.max(0, limit) : 0;
  }

  /**
   * Check if a needle can be fired.
   * @returns True if firing is allowed
   */
  canFire(): boolean {
    if (!this.limitNeedlesEnabled) {
      return true;
    }
    return this.needlesRemaining > 0;
  }

  /**
   * Consume one needle if limit is enabled.
   * @returns void
   */
  consumeNeedle() {
    if (!this.limitNeedlesEnabled) {
      return;
    }
    this.needlesRemaining = Math.max(0, this.needlesRemaining - 1);
  }

  /**
   * Set total HP for multi-target levels.
   * @param hpMax Total HP
   * @returns void
   */
  setTotalHp(hpMax: number) {
    this.hpMax = hpMax;
    this.hpCurrent = Math.min(this.hpCurrent, hpMax);
  }

  /**
   * Apply damage to level total HP.
   * @param amount Damage amount
   * @returns void
   */
  applyLevelDamage(amount: number) {
    this.hpCurrent = Math.max(0, this.hpCurrent - amount);
  }

  /**
   * Apply failure penalty (gauge carry on fail).
   * @returns void
   */
  applyFailure() {
    this.gauge = this.economy.carryGaugeOnFail(this.gauge);
  }

  /**
   * Apply heal to level total HP.
   * @param amount Heal amount
   * @returns void
   */
  applyLevelHeal(amount: number) {
    this.hpCurrent = Math.min(this.hpMax, this.hpCurrent + amount);
  }

  /**
   * Apply mistake to combo and quality.
   * @param type Hit type
   * @returns void
   */
  private applyMistake(type: HitType) {
    this.lastHitType = type;
    this.combo = this.formula.applyMistakeCombo(this.combo);
    this.comboQuality -= 1;
    this.comboElapsed = 0;
    this.refreshDerived();
  }
}
