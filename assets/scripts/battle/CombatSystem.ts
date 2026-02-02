import { _decorator, Component, Node, Graphics, Color, Vec3, tween } from 'cc';
import { GameSession } from '../core/GameSession';
import { Shooter } from './Shooter';
import { DropSystem } from './DropSystem';
import { Virus } from '../entities/Virus';
import { AudioService } from '../core/AudioService';
import { EffectManager } from '../core/EffectManager';

const { ccclass } = _decorator;

@ccclass('CombatSystem')
export class CombatSystem extends Component {
  private session: GameSession | null = null;
  private shooter: Shooter | null = null;
  private viruses: Virus[] = [];
  private dropSystem: DropSystem | null = null;
  private bounds = { width: 0, height: 0 };

  /**
   * Bind combat dependencies.
   * @param session Active session
   * @param shooter Shooter instance
   * @param viruses Target viruses
   * @param dropSystem Drop handler
   * @param bounds World bounds
   * @returns void
   */
  bind(session: GameSession, shooter: Shooter, viruses: Virus[], dropSystem: DropSystem, bounds: { width: number; height: number }) {
    this.session = session;
    this.shooter = shooter;
    this.viruses = viruses;
    this.dropSystem = dropSystem;
    this.bounds = bounds;
  }

  /**
   * Resolve needle hits each frame.
   * @param dt Delta time seconds
   * @returns void
   */
  step(dt: number) {
    void dt;
    if (!this.session || !this.shooter) {
      return;
    }
    const needles = this.shooter.getNeedles();
    for (const needle of needles) {
      if (!needle || !needle.alive) {
        continue;
      }
      const pos = needle.node.worldPosition;

      let hit = false;
      // 1. Weak Point Hit Check
      for (const virus of this.viruses) {
        if (!virus || virus.isDead()) {
          continue;
        }
        const weak = virus.checkWeakPointHit(pos, needle.radius);
        if (weak) {
          if (weak.isDecoy) {
            this.session.onShieldHit();
            AudioService.instance.playSFX('hit_shield');
            EffectManager.instance.playHitEffect(pos, new Color(80, 160, 255, 200));
            EffectManager.instance.playTextEffect(pos, "BLOCK", new Color(80, 160, 255));
            EffectManager.instance.playScreenShake(3);
            this.session.requestHitStop(0.05);
          } else {
            this.session.onWeakPointHit();
            const drops = this.dropSystem?.onWeakPointHit();
            if (drops) {
                if (drops.coins > 0) EffectManager.instance.playResourceFly(pos, 'coin');
                if (drops.shards > 0) EffectManager.instance.playResourceFly(pos, 'shard');
            }
            virus.applyDamage(1);
            this.session.applyLevelDamage(1);
            if (virus.isDead()) {
                EffectManager.instance.playExplosion(pos);
                AudioService.instance.playSFX('win'); // Or death sound
                this.session.requestHitStop(0.3); // Long freeze for kill
            } else {
                AudioService.instance.playSFX('hit_weak');
                EffectManager.instance.playHitEffect(pos, new Color(255, 90, 90, 210));
                if (this.session.combo > 1) {
                     EffectManager.instance.playTextEffect(pos, `x${this.session.combo}`, new Color(255, 200, 0));
                }
                EffectManager.instance.playScreenShake(2);
                this.session.requestHitStop(0.08); // Standard freeze
            }
          }
          needle.kill();
          hit = true;
          break;
        }
      }
      if (hit) {
        continue;
      }

      // 2. Body Hit Check (Core)
      for (const virus of this.viruses) {
        if (!virus || virus.isDead()) {
          continue;
        }
        if (virus.checkBodyHit(pos, needle.radius)) {
            // Body hit is a failure to hit weak point
            this.session.onShieldHit(); // Penalize like a shield hit
            AudioService.instance.playSFX('bounce'); // Metallic sound
            EffectManager.instance.playHitEffect(pos, new Color(150, 150, 150, 200));
            EffectManager.instance.playTextEffect(pos, "FAIL", new Color(150, 150, 150));
            EffectManager.instance.playScreenShake(2);
            needle.kill();
            hit = true;
            break;
        }
      }
      if (hit) {
        continue;
      }

      // 3. Shield Hit Check
      for (const virus of this.viruses) {
        if (!virus || virus.isDead()) {
          continue;
        }
        if (needle.isSuper) {
          continue;
        }
        if (virus.checkShieldHit(pos, needle.radius)) {
          this.session.onShieldHit();
          virus.onShieldHit(pos, needle.radius);
          needle.kill();
          hit = true;
          AudioService.instance.playSFX('hit_shield');
          EffectManager.instance.playHitEffect(pos, new Color(80, 160, 255, 200));
          EffectManager.instance.playTextEffect(pos, "SHIELD", new Color(80, 160, 255));
          EffectManager.instance.playScreenShake(3);
          break;
        }
      }
      if (hit) {
        continue;
      }

      // 4. Reflect Object Check
      for (const virus of this.viruses) {
        if (!virus || virus.isDead()) {
          continue;
        }
        const reflect = virus.checkReflectHit(pos, needle.radius);
        if (reflect) {
          if (needle.bouncesRemaining > 0) {
            needle.bouncesRemaining -= 1;
            const normal = pos.clone().subtract(reflect.node.worldPosition).normalize();
            needle.bounce(normal);
            AudioService.instance.playSFX('bounce'); // Optional bounce sound
            EffectManager.instance.playHitEffect(pos, new Color(220, 220, 220, 180));
          } else {
            needle.kill();
          }
          hit = true;
          break;
        }
      }
      if (hit) {
        continue;
      }

      // 5. Bounds Check (Local Position)
      const localPos = needle.node.position;
      if (Math.abs(localPos.x) > this.bounds.width / 2 || Math.abs(localPos.y) > this.bounds.height / 2) {
        if (!needle.reportedMiss) {
          this.session.onMiss();
          needle.markMissed();
          AudioService.instance.playSFX('miss');
          EffectManager.instance.playHitEffect(pos, new Color(180, 180, 180, 160));
          EffectManager.instance.playTextEffect(pos, "MISS", new Color(150, 150, 150));
        }
        needle.kill();
      }
    }
  }
}
