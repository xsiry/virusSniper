import { _decorator, Component, Vec3, Graphics, Color } from 'cc';

const { ccclass } = _decorator;

@ccclass('Needle')
export class Needle extends Component {
  radius = 6;
  speed = 1200;
  isSuper = false;
  alive = true;
  reportedMiss = false;
  bouncesRemaining = 0;
  private direction = new Vec3(0, 1, 0);

  /**
   * Initialize needle parameters.
   * @param direction Travel direction
   * @param speed Movement speed
   * @param radius Collision radius
   * @param isSuper Whether this is a super needle
   * @param bouncesRemaining Bounce count remaining
   * @returns void
   */
  initialize(direction: Vec3, speed: number, radius: number, isSuper: boolean, bouncesRemaining: number) {
    this.direction = direction.clone().normalize();
    this.speed = speed;
    this.radius = radius;
    this.isSuper = isSuper;
    this.bouncesRemaining = bouncesRemaining;
    this.updateRotation();
    this.draw();
  }

  /**
   * Move needle forward.
   * @param dt Delta time seconds
   * @returns void
   */
  step(dt: number) {
    if (!this.alive) {
      return;
    }
    const move = this.direction.clone().multiplyScalar(this.speed * dt);
    this.node.setPosition(this.node.position.clone().add(move));
  }

  /**
   * Reflect direction using a surface normal.
   * @param normal Surface normal
   * @returns void
   */
  bounce(normal: Vec3) {
    const dir = this.direction;
    const dot = dir.dot(normal);
    this.direction = dir.clone().subtract(normal.clone().multiplyScalar(2 * dot)).normalize();
    this.updateRotation();
  }

  /**
   * Mark this needle as already counted for miss.
   * @returns void
   */
  markMissed() {
    this.reportedMiss = true;
  }

  /**
   * Destroy this needle.
   * @returns void
   */
  kill() {
    this.alive = false;
    this.node.destroy();
  }

  /**
   * Draw needle with Neon Trail style.
   * @returns void
   */
  private draw() {
    const gfx = this.getComponent(Graphics) ?? this.addComponent(Graphics);
    gfx.clear();
    
    // Colors
    const coreColor = this.isSuper ? new Color(255, 240, 50, 255) : new Color(255, 255, 255, 255);
    const glowColor = this.isSuper ? new Color(255, 180, 0, 150) : new Color(0, 255, 255, 150); // Gold or Cyan glow
    const trailColor = this.isSuper ? new Color(255, 100, 0, 80) : new Color(0, 150, 255, 80);

    const length = this.isSuper ? 50 : 40;
    const width = this.radius * 2;

    // 1. Trail (Tapered)
    gfx.fillColor = trailColor;
    gfx.moveTo(-width * 0.5, 0); // Left Base
    gfx.lineTo(width * 0.5, 0);  // Right Base
    gfx.lineTo(0, -length * 1.5); // Tail Tip
    gfx.close();
    gfx.fill();

    // 2. Glow Aura
    gfx.fillColor = glowColor;
    gfx.circle(0, length * 0.2, width * 1.2);
    gfx.fill();

    // 3. Solid Core
    gfx.fillColor = coreColor;
    gfx.circle(0, length * 0.2, width * 0.6);
    gfx.fill();
    
    // 4. Front Spike
    gfx.fillColor = coreColor;
    gfx.moveTo(-width * 0.4, length * 0.2);
    gfx.lineTo(width * 0.4, length * 0.2);
    gfx.lineTo(0, length * 1.0);
    gfx.fill();
  }

  private updateRotation() {
    const angle = Math.atan2(this.direction.y, this.direction.x) * 180 / Math.PI - 90;
    this.node.angle = angle;
  }
}
