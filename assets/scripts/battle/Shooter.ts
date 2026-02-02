import { _decorator, Component, Node, Vec3, Graphics, Color, tween } from 'cc';
import { GameSession } from '../core/GameSession';
import { LevelConfig } from '../data/ConfigTypes';
import { Needle } from './Needle';
import { AudioService } from '../core/AudioService';

const { ccclass } = _decorator;

@ccclass('Shooter')
export class Shooter extends Component {
  private session: GameSession | null = null;
  private level: LevelConfig | null = null;
  private needles: Needle[] = [];
  private readonly normalSpeed = 1200;
  private readonly superSpeed = 1400;
  private readonly normalRadius = 6;
  private readonly superRadius = 10;
  private launcherGfx: Graphics | null = null;

  start() {
      this.drawLauncher();
  }

  /**
   * Bind session and level config.
   * @param session Active session
   * @param level Level config
   * @returns void
   */
  bind(session: GameSession, level: LevelConfig) {
    this.session = session;
    this.level = level;
  }

  private drawLauncher() {
      const gfx = this.getComponent(Graphics) ?? this.addComponent(Graphics);
            this.launcherGfx = gfx;
          gfx.clear();
      
          // 1. Base (Tech Trapazoid) - Lighter color for visibility
          gfx.fillColor = new Color(80, 100, 120, 255);
          gfx.moveTo(-24, -20);
          gfx.lineTo(24, -20);      gfx.lineTo(16, 10);
      gfx.lineTo(-16, 10);
      gfx.close();
      gfx.fill();

      // 2. Glowing Core
      gfx.fillColor = new Color(0, 200, 255, 200);
      gfx.circle(0, 0, 8);
      gfx.fill();

      // 3. Side Rails
      gfx.strokeColor = new Color(100, 200, 220, 200);
      gfx.lineWidth = 2;
      gfx.moveTo(-16, 10);
      gfx.lineTo(-16, -10);
      gfx.moveTo(16, 10);
      gfx.lineTo(16, -10);
      gfx.stroke();
  }

  /**
   * Fire a needle toward a local target position.
   * @param targetLocal Target position in local space
   * @returns void
   */
  fire(targetLocal: Vec3) {
    if (!this.session || !this.level) {
      return;
    }
    if (!this.session.canFire()) {
      return;
    }

    const dir = targetLocal.clone().subtract(this.node.position);
    if (dir.length() <= 0.01) {
      return;
    }

    const useSuper = this.session.useSuper && this.session.superNeedleCount > 0;
    if (useSuper) {
      this.session.superNeedleCount -= 1;
    }
    this.session.consumeNeedle();

    const bouncesRemaining = this.level.reflectEnabled ? (this.level.reflectMaxBounces ?? 0) : 0;

    const needleNode = new Node('Needle');
    const needle = needleNode.addComponent(Needle);
    const speed = useSuper ? this.superSpeed : this.normalSpeed;
    const radius = useSuper ? this.superRadius : this.normalRadius;
    needle.initialize(dir.normalize(), speed, radius, useSuper, bouncesRemaining);

    this.node.parent?.addChild(needleNode);
    needleNode.setPosition(this.node.position);
    this.needles.push(needle);

    AudioService.instance.playSFX(useSuper ? 'shoot_super' : 'shoot');
    this.spawnMuzzleFx(useSuper);
    
    // Recoil animation
    tween(this.node)
        .by(0.05, { position: new Vec3(0, -10, 0) })
        .by(0.1, { position: new Vec3(0, 10, 0) })
        .start();
  }

  private spawnMuzzleFx(isSuper: boolean) {
    const parent = this.node.parent;
    if (!parent) {
      return;
    }
    const fxNode = new Node('MuzzleFx');
    const gfx = fxNode.addComponent(Graphics);
    const radius = isSuper ? 26 : 18;
    const color = isSuper ? new Color(255, 200, 80, 255) : new Color(0, 255, 255, 255);
    
    // Core flash
    gfx.fillColor = color;
    gfx.circle(0, 0, radius);
    gfx.fill();

    // Side sparks (Neon style)
    gfx.strokeColor = isSuper ? new Color(255, 100, 0, 200) : new Color(0, 150, 255, 200);
    gfx.lineWidth = 3;
    const rays = 5;
    for (let i = 0; i < rays; i++) {
        const a = (i * Math.PI * 2) / rays; // Even spread? No, directional is better
        // Let's do a directional burst forward
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.0; // Upwards roughly
        const len = radius * 1.5 + Math.random() * radius;
        gfx.moveTo(0, 0);
        gfx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
    }
    gfx.stroke();

    parent.addChild(fxNode);
    fxNode.setPosition(this.node.position);
    fxNode.setScale(0.5, 0.5, 1);
    
    tween(fxNode)
      .to(0.08, { scale: new Vec3(1.2, 1.2, 1) })
      .to(0.08, { scale: new Vec3(0, 0, 1) })
      .call(() => fxNode.destroy())
      .start();
  }


  /**
   * Update active needles.
   * @param dt Delta time seconds
   * @returns void
   */
  stepNeedles(dt: number) {
    this.needles = this.needles.filter((needle) => needle && needle.alive);
    for (const needle of this.needles) {
      needle.step(dt);
    }
  }

  /**
   * Get active needle list.
   * @returns Needle array
   */
  getNeedles() {
    return this.needles;
  }
}
