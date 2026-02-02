import { _decorator, Component, Graphics, Color, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('Shield')
export class Shield extends Component {
  radius = 18;
  orbitRadius = 150;
  angleOffset = 0;
  orbitSpeed = 1;
  breakable = false;
  mode: 'orbital' | 'energy' | 'breakable' = 'orbital';
  private flashTimer = 0;

  /**
   * Initialize shield orbit parameters.
   * @param angleOffset Angular offset in radians
   * @param orbitRadius Orbit radius
   * @param orbitSpeed Orbit speed
   * @param mode Shield mode
   * @returns void
   */
  initialize(angleOffset: number, orbitRadius: number, orbitSpeed: number, mode: 'orbital' | 'energy' | 'breakable') {
    this.angleOffset = angleOffset;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.mode = mode;
    this.breakable = mode === 'breakable';
    this.draw();
  }

  /**
   * Advance shield movement.
   * @param dt Delta time seconds
   * @returns void
   */
  step(dt: number) {
    if (this.mode === 'orbital' || this.mode === 'breakable') {
      this.angleOffset += this.orbitSpeed * dt;
    }
    const x = Math.cos(this.angleOffset) * this.orbitRadius;
    const y = Math.sin(this.angleOffset) * this.orbitRadius;
    this.node.setPosition(new Vec3(x, y, 0));
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.flashTimer = 0;
        this.draw();
      }
    }
  }

  /**
   * Check hit against world position.
   * @param worldPos Needle world position
   * @param radius Needle radius
   * @returns True if hit
   */
  isHit(worldPos: Vec3, radius: number): boolean {
    const pos = this.node.worldPosition;
    const dist = pos.subtract(worldPos).length();
    return dist <= this.radius + radius;
  }

  /**
   * Draw placeholder shield.
   * @returns void
   */
  private draw() {
    const gfx = this.getComponent(Graphics) ?? this.addComponent(Graphics);
    gfx.clear();
    const flash = this.flashTimer > 0;
    const color = flash ? new Color(255, 255, 255, 220) : new Color(80, 160, 255, 220);
    const glow = flash ? new Color(160, 200, 255, 120) : new Color(60, 120, 200, 120);
    const r = this.radius * 1.1;
    const arcSpan = 0.7;

    gfx.strokeColor = color;
    gfx.lineWidth = 6;
    gfx.arc(0, 0, r, -arcSpan, arcSpan, false);
    gfx.stroke();

    gfx.strokeColor = glow;
    gfx.lineWidth = 2;
    gfx.arc(0, 0, r + 8, -arcSpan * 1.1, arcSpan * 1.1, false);
    gfx.stroke();
  }

  flash() {
    this.flashTimer = 0.12;
    this.draw();
  }
}
