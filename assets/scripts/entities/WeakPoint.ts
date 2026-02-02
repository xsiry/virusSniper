import { _decorator, Component, Graphics, Color, Vec3 } from 'cc';
import { MathUtil } from '../utils/MathUtil';

const { ccclass } = _decorator;

@ccclass('WeakPoint')
export class WeakPoint extends Component {
  radius = 16;
  baseRadius = 120;
  angleOffset = 0;
  moveAmplitude = 22;
  isDecoy = false;

  /**
   * Initialize weak point position parameters.
   * @param angleOffset Angular offset in radians
   * @param baseRadius Orbit radius
   * @returns void
   */
  /**
   * Initialize weak point position parameters.
   * @param angleOffset Angular offset in radians
   * @param baseRadius Orbit radius
   * @param isDecoy Whether this weak point is a decoy
   * @returns void
   */
  initialize(angleOffset: number, baseRadius: number, isDecoy: boolean) {
    this.angleOffset = angleOffset;
    this.baseRadius = baseRadius;
    this.isDecoy = isDecoy;
    this.draw();
  }

  /**
   * Update local position based on virus rotation.
   * @param rotationRad Current rotation in radians
   * @param move Whether weak points wobble
   * @param t Time value
   * @returns void
   */
  updatePosition(rotationRad: number, move: boolean, t: number) {
    const wobble = move ? MathUtil.pingPong(t + this.angleOffset, this.moveAmplitude) - this.moveAmplitude / 2 : 0;
    const r = this.baseRadius + wobble;
    // Use only local offset, parent Virus rotation handles the rest
    const angle = this.angleOffset; 
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    this.node.setPosition(new Vec3(x, y, 0));
    // Keep local rotation aligned with radial direction
    this.node.angle = angle * 180 / Math.PI; 
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
   * Draw placeholder weak point.
   * @returns void
   */
  /**
   * Draw placeholder weak point.
   * @returns void
   */
  private draw() {
    const gfx = this.getComponent(Graphics) ?? this.addComponent(Graphics);
    gfx.clear();
    const main = this.isDecoy ? new Color(140, 140, 140, 220) : new Color(255, 90, 90, 240);
    const ring = this.isDecoy ? new Color(160, 160, 160, 180) : new Color(255, 200, 200, 180);
    const r = this.radius;

    gfx.fillColor = main;
    gfx.moveTo(r, 0);
    for (let i = 1; i <= 6; i += 1) {
      const a = (i * Math.PI * 2) / 6;
      gfx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    gfx.close();
    gfx.fill();

    gfx.strokeColor = ring;
    gfx.lineWidth = 2;
    gfx.moveTo(r * 0.7, 0);
    for (let i = 1; i <= 6; i += 1) {
      const a = (i * Math.PI * 2) / 6;
      gfx.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
    }
    gfx.close();
    gfx.stroke();
  }
}
