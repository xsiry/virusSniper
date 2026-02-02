import { _decorator, Component, Graphics, Color, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('ReflectObject')
export class ReflectObject extends Component {
  radius = 14;
  orbitRadius = 180;
  angleOffset = 0;
  orbitSpeed = 1.2;
  mode: 'fixed' | 'move' | 'rotate' = 'rotate';
  moveAmplitude = 80;

  /**
   * Initialize reflector movement.
   * @param angleOffset Angular offset in radians
   * @param orbitRadius Orbit radius
   * @param orbitSpeed Orbit speed
   * @param mode Reflect movement mode
   * @returns void
   */
  initialize(angleOffset: number, orbitRadius: number, orbitSpeed: number, mode: 'fixed' | 'move' | 'rotate') {
    this.angleOffset = angleOffset;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.mode = mode;
    this.draw();
  }

  /**
   * Advance reflector movement.
   * @param dt Delta time seconds
   * @returns void
   */
  step(dt: number) {
    if (this.mode === 'rotate') {
      this.angleOffset += this.orbitSpeed * dt;
      const x = Math.cos(this.angleOffset) * this.orbitRadius;
      const y = Math.sin(this.angleOffset) * this.orbitRadius;
      this.node.setPosition(new Vec3(x, y, 0));
      return;
    }
    if (this.mode === 'move') {
      this.angleOffset += this.orbitSpeed * dt;
      const x = Math.sin(this.angleOffset) * this.moveAmplitude;
      const y = Math.cos(this.angleOffset) * this.moveAmplitude * 0.4;
      this.node.setPosition(new Vec3(x, y, 0));
      return;
    }
    const x = Math.cos(this.angleOffset) * this.orbitRadius;
    const y = Math.sin(this.angleOffset) * this.orbitRadius;
    this.node.setPosition(new Vec3(x, y, 0));
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
   * Draw placeholder reflector.
   * @returns void
   */
  private draw() {
    const gfx = this.getComponent(Graphics) ?? this.addComponent(Graphics);
    gfx.clear();
    const core = new Color(255, 200, 120, 230);
    const glow = new Color(255, 200, 120, 120);
    const length = this.radius * 2.6;
    const thickness = this.radius * 0.7;

    gfx.fillColor = glow;
    gfx.rect(-length * 0.5, -thickness, length, thickness * 2);
    gfx.fill();

    gfx.fillColor = core;
    gfx.rect(-length * 0.45, -thickness * 0.6, length * 0.9, thickness * 1.2);
    gfx.fill();
  }
}
