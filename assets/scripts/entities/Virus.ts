import { _decorator, Component, Graphics, Color, Vec3, Node } from 'cc';
import { LevelConfig, VariantConfig, EnemyArchetypeConfig } from '../data/ConfigTypes';
import { WeakPoint } from './WeakPoint';
import { Shield } from './Shield';
import { ReflectObject } from './ReflectObject';
import { MathUtil } from '../utils/MathUtil';
import { GameSession } from '../core/GameSession';

const { ccclass } = _decorator;

interface PhaseState {
  hpPct: number;
  speedMul: number;
  regenMul: number;
  addShield: boolean;
  weakPointMove: boolean | null;
  triggered: boolean;
}

@ccclass('Virus')
export class Virus extends Component {
  private session: GameSession | null = null;
  private level: LevelConfig | null = null;
  private hp = 0;
  private hpMax = 0;
  private rotateSpeedBase = 0;
  private activeSpeedMul = 1;
  private activeRegenMul = 1;
  private weakPointMoveActive = false;
  private time = 0;
  private timeSinceHit = 0;
  private phases: PhaseState[] = [];
  private weakPoints: WeakPoint[] = [];
  private shields: Shield[] = [];
  private reflectObjects: ReflectObject[] = [];
  private dead = false;
  private bodyRadius = 100;

  /**
   * Bind configs and spawn sub-entities.
   * @param session Active session
   * @param level Level config
   * @param variant Variant config
   * @param archetype Archetype config
   * @returns void
   */
  bind(session: GameSession, level: LevelConfig, variant?: VariantConfig, archetype?: EnemyArchetypeConfig) {
    this.session = session;
    this.level = level;
    this.hpMax = level.hp;
    this.hp = level.hp;
    this.rotateSpeedBase = level.rotateSpeed;
    this.activeSpeedMul = 1;
    this.activeRegenMul = 1;
    this.weakPointMoveActive = level.weakPointMove;
    this.phases = (level.bossPhases ?? []).map((phase) => ({
      hpPct: phase.hpPct,
      speedMul: phase.speedMul ?? 1,
      regenMul: phase.regenMul ?? 1,
      addShield: phase.addShield ?? false,
      weakPointMove: phase.weakPointMove ?? null,
      triggered: false
    })).sort((a, b) => b.hpPct - a.hpPct);

    this.bodyRadius = 100 * (archetype?.baseScale ?? 1);
    this.drawBody(archetype);
    this.spawnWeakPoints(level.weakPointCount, variant?.decoyRatio ?? 0);
    if (level.shieldEnabled && level.shieldType && level.shieldCount && level.shieldSpeed) {
      this.spawnShields(level.shieldCount, level.shieldSpeed, level.shieldType, variant);
    }
    if (level.reflectEnabled && level.reflectObjectCount && level.reflectObjectType) {
      this.spawnReflectObjects(level.reflectObjectCount, level.reflectObjectType);
    }
  }

  /**
   * Advance rotation, orbiting objects, regen, and phases.
   * @param dt Delta time seconds
   * @returns void
   */
  step(dt: number) {
    if (this.dead || !this.level) {
      return;
    }
    this.time += dt;
    this.timeSinceHit += dt;

    const speed = this.getRotateSpeed();
    this.node.angle += (speed * 180 / Math.PI) * dt;

    const rotationRad = this.node.angle * Math.PI / 180;
    for (const weak of this.weakPoints) {
      weak.updatePosition(rotationRad, this.weakPointMoveActive, this.time);
    }
    for (const shield of this.shields) {
      shield.step(dt);
    }
    for (const reflect of this.reflectObjects) {
      reflect.step(dt);
    }

    this.handleRegen(dt);
    this.checkBossPhases();
    
    // Breathing animation
    const breathe = 1.0 + 0.03 * Math.sin(this.time * 4);
    this.node.setScale(new Vec3(breathe, breathe, 1));
  }

  /**
   * Check if virus is dead.
   * @returns True if dead
   */
  isDead(): boolean {
    return this.dead;
  }

  /**
   * Get boss phase progress for UI/debug.
   * @returns Active/total phases
   */
  getPhaseProgress(): { active: number; total: number } {
    const total = this.phases.length;
    const active = this.phases.filter((phase) => phase.triggered).length;
    return { active, total };
  }

  /**
   * Apply damage to virus HP.
   * @param amount Damage amount
   * @returns void
   */
  applyDamage(amount: number) {
    this.hp -= amount;
    this.timeSinceHit = 0;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }

  /**
   * Check weak point hit.
   * @param worldPos Needle world position
   * @param radius Needle radius
   * @returns WeakPoint if hit
   */
  checkWeakPointHit(worldPos: Vec3, radius: number): WeakPoint | null {
    for (const weak of this.weakPoints) {
      if (weak.isHit(worldPos, radius)) {
        return weak;
      }
    }
    return null;
  }

  /**
   * Check shield hit.
   * @param worldPos Needle world position
   * @param radius Needle radius
   * @returns True if hit
   */
  checkShieldHit(worldPos: Vec3, radius: number): boolean {
    for (const shield of this.shields) {
      if (shield.isHit(worldPos, radius)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check body hit (core).
   * @param worldPos Needle world position
   * @param radius Needle radius
   * @returns True if hit
   */
  checkBodyHit(worldPos: Vec3, radius: number): boolean {
    const dist = this.node.worldPosition.clone().subtract(worldPos).length();
    return dist <= this.bodyRadius + radius;
  }

  /**
   * Apply shield hit effects.
   * @param worldPos Needle world position
   * @param radius Needle radius
   * @returns void
   */
  onShieldHit(worldPos: Vec3, radius: number) {
    for (const shield of this.shields) {
      if (shield.isHit(worldPos, radius)) {
        shield.flash();
        if (shield.breakable) {
          shield.node.destroy();
          this.shields = this.shields.filter((item) => item !== shield);
        }
        return;
      }
    }
  }

  /**
   * Check reflector hit.
   * @param worldPos Needle world position
   * @param radius Needle radius
   * @returns ReflectObject or null
   */
  checkReflectHit(worldPos: Vec3, radius: number): ReflectObject | null {
    for (const reflect of this.reflectObjects) {
      if (reflect.isHit(worldPos, radius)) {
        return reflect;
      }
    }
    return null;
  }

  /**
   * Spawn weak points with optional decoys.
   * @param count Weak point count
   * @param decoyRatio Ratio of decoy points
   * @returns void
   */
  private spawnWeakPoints(count: number, decoyRatio: number) {
    const baseRadius = 120;
    const decoyCount = Math.round(count * decoyRatio);
    for (let i = 0; i < count; i++) {
      const node = new Node();
      node.name = `WeakPoint_${i + 1}`;
      const weak = node.addComponent(WeakPoint);
      const isDecoy = i < decoyCount;
      weak.initialize((Math.PI * 2 * i) / count, baseRadius, isDecoy);
      this.node.addChild(node);
      this.weakPoints.push(weak);
    }
  }

  /**
   * Spawn shield objects.
   * @param count Shield count
   * @param speed Orbit speed
   * @param mode Shield type
   * @param variant Variant config
   * @returns void
   */
  private spawnShields(count: number, speed: number, mode: 'orbital' | 'energy' | 'breakable', variant?: VariantConfig) {
    const orbitRadius = variant?.shieldOrbitRadius ?? 150;
    for (let i = 0; i < count; i++) {
      const node = new Node();
      node.name = `Shield_${i + 1}`;
      const shield = node.addComponent(Shield);
      shield.initialize((Math.PI * 2 * i) / count, orbitRadius, speed, mode);
      this.node.addChild(node);
      this.shields.push(shield);
    }
  }

  /**
   * Spawn reflect objects.
   * @param count Reflector count
   * @param mode Reflector type
   * @returns void
   */
  private spawnReflectObjects(count: number, mode: 'fixed' | 'move' | 'rotate') {
    const orbitRadius = 190;
    const speed = mode === 'fixed' ? 0 : 1.6;
    for (let i = 0; i < count; i++) {
      const node = new Node();
      node.name = `Reflect_${i + 1}`;
      const reflect = node.addComponent(ReflectObject);
      reflect.initialize((Math.PI * 2 * i) / count, orbitRadius, speed, mode);
      this.node.addChild(node);
      this.reflectObjects.push(reflect);
    }
  }

  /**
   * Compute current rotate speed.
   * @returns Rotate speed
   */
  private getRotateSpeed() {
    if (!this.level) {
      return 0;
    }
    const base = this.rotateSpeedBase * this.activeSpeedMul;
    if (this.level.speedMode === 'variable' && this.level.speedMin !== undefined && this.level.speedMax !== undefined) {
      const mid = (this.level.speedMin + this.level.speedMax) / 2;
      const amp = (this.level.speedMax - this.level.speedMin) / 2;
      const t = this.time * 0.6;
      return (mid + amp * Math.sin(t)) * this.activeSpeedMul;
    }
    return base;
  }

  /**
   * Apply regen over time.
   * @param dt Delta time seconds
   * @returns void
   */
  private handleRegen(dt: number) {
    if (!this.level || !this.level.regenEnabled || this.level.regenBase === undefined) {
      return;
    }
    if (this.timeSinceHit < (this.level.regenDelay ?? 0)) {
      return;
    }
    const regen = this.session?.regenRateCurrent ?? 0;
    const regenMul = this.getRegenMul();
    const before = this.hp;
    this.hp = MathUtil.clamp(this.hp + regen * regenMul * dt, 0, this.hpMax);
    const delta = this.hp - before;
    if (delta > 0) {
      this.session?.applyLevelHeal(delta);
    }
  }

  /**
   * Get regen multiplier from boss phases.
   * @returns Regen multiplier
   */
  private getRegenMul(): number {
    return this.activeRegenMul;
  }

  /**
   * Trigger boss phases based on HP percentage.
   * @returns void
   */
  private checkBossPhases() {
    const hpPct = this.hpMax > 0 ? this.hp / this.hpMax : 0;
    for (const phase of this.phases) {
      if (!phase.triggered && hpPct <= phase.hpPct) {
        phase.triggered = true;
        if (phase.speedMul !== 1) {
          this.activeSpeedMul = phase.speedMul;
        }
        if (phase.regenMul !== 1) {
          this.activeRegenMul = phase.regenMul;
        }
        if (phase.addShield && this.level?.shieldCount && this.level?.shieldSpeed && this.level?.shieldType) {
          this.spawnShields(1, this.level.shieldSpeed, this.level.shieldType);
        }
        if (phase.weakPointMove !== null) {
          this.weakPointMoveActive = phase.weakPointMove;
        }
        // Visual cue for phase change
        this.onPhaseChange();
      }
    }
  }

  private onPhaseChange() {
      // 1. Flash effect
      const gfx = this.getComponent(Graphics);
      if (gfx) {
          gfx.fillColor = new Color(255, 255, 255, 255);
          gfx.circle(0, 0, 110);
          gfx.fill();
          this.scheduleOnce(() => this.drawBody(undefined), 0.1); // Redraw normal after flash
      }
      // 2. Scale punch
      this.node.setScale(new Vec3(1.3, 1.3, 1));
  }

  /**
   * Draw placeholder virus body with Neon Flat style.
   * @param archetype Archetype config
   * @returns void
   */
  private drawBody(archetype?: EnemyArchetypeConfig) {
    const gfx = this.getComponent(Graphics) ?? this.addComponent(Graphics);
    gfx.clear();
    const scale = archetype?.baseScale ?? 1;
    
    // Neon Palette
    const coreColor = new Color(255, 0, 85, 255); // Neon Red/Pink
    const shellColor = new Color(0, 255, 200, 255); // Neon Cyan
    const glowColor = new Color(0, 255, 200, 100); // Transparent Cyan
    const darkCore = new Color(20, 0, 10, 255); // Dark BG for contrast

    const baseR = 100 * scale;

    // 1. Outer Glow (Simulated)
    gfx.fillColor = glowColor;
    gfx.circle(0, 0, baseR * 1.1);
    gfx.fill();

    // 2. Main Shell (Flat)
    gfx.fillColor = shellColor;
    gfx.circle(0, 0, baseR);
    gfx.fill();

    // 3. Inner Dark Void (Contrast)
    gfx.fillColor = darkCore;
    gfx.circle(0, 0, baseR * 0.85);
    gfx.fill();

    // 4. Core (Pulsing visuals could be added in update, but static for now)
    gfx.fillColor = coreColor;
    gfx.circle(0, 0, baseR * 0.4);
    gfx.fill();

    // 5. Tech Rings (Thicker, Flat)
    gfx.strokeColor = new Color(255, 255, 255, 150);
    gfx.lineWidth = 6;
    gfx.circle(0, 0, baseR * 0.6);
    gfx.stroke();

    // 6. Segments
    gfx.strokeColor = darkCore;
    gfx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        gfx.moveTo(0, 0);
        gfx.lineTo(Math.cos(a) * baseR, Math.sin(a) * baseR);
    }
    gfx.stroke();
  }
}
