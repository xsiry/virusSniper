import { GameSession } from '../core/GameSession';

export class DropSystem {
  constructor(private readonly session: GameSession) {}

  /**
   * Roll drops on weak point hit.
   * @returns Drop result
   */
  onWeakPointHit() {
    return this.session.applyDrops();
  }
}
