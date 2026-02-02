import { Vec3 } from 'cc';

export class MathUtil {
  /**
   * Clamp a value into [min, max].
   * @param value Input value
   * @param min Minimum
   * @param max Maximum
   * @returns Clamped value
   */
  static clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * Ping-pong oscillation in [0, length].
   * @param t Time value
   * @param length Range length
   * @returns Ping-pong value
   */
  static pingPong(t: number, length: number) {
    const l = length * 2;
    const mod = t % l;
    return length - Math.abs(mod - length);
  }

  /**
   * Reflect a direction vector against a normal.
   * @param direction Incoming direction
   * @param normal Surface normal
   * @returns Reflected direction
   */
  static reflect(direction: Vec3, normal: Vec3) {
    const dot = direction.dot(normal);
    return direction.clone().subtract(normal.clone().multiplyScalar(2 * dot)).normalize();
  }
}
