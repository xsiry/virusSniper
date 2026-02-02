import { _decorator, Component, Label, UITransform, Color, Vec3 } from 'cc';
import { GameSession } from '../core/GameSession';

const { ccclass } = _decorator;

@ccclass('DebugPanel')
export class DebugPanel extends Component {
  private session: GameSession | null = null;
  private label: Label | null = null;

  /**
   * Bind a GameSession for live debug display.
   * @param session Active session
   * @returns void
   */
  bind(session: GameSession) {
    this.session = session;
  }

  /**
   * Initialize label and layout.
   * @returns void
   */
  start() {
    this.label = this.getComponent(Label) ?? this.addComponent(Label);
    const ui = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    ui.setContentSize(520, 360);
    this.node.setPosition(new Vec3(16, 320, 0));
    this.label.color = new Color(220, 220, 220, 255);
    this.label.fontSize = 18;
    this.label.lineHeight = 20;
    this.label.overflow = Label.Overflow.SHRINK;
    this.label.horizontalAlign = Label.HorizontalAlign.LEFT;
    this.label.verticalAlign = Label.VerticalAlign.TOP;
  }

  /**
   * Update debug text every frame.
   * @returns void
   */
  update() {
    if (!this.label || !this.session) {
      return;
    }
    this.session.refreshDerived();
    this.label.string = [
      `levelId: ${this.session.levelId}`,
      `hp: ${this.session.hpCurrent}/${this.session.hpMax}`,
      `rotateSpeedCurrent: ${this.session.rotateSpeedCurrent.toFixed(2)}`,
      `combo: ${this.session.combo}`,
      `comboMax: ${this.session.comboMax}`,
      `comboQuality: ${this.session.comboQuality}`,
      `comboWindowT: ${this.session.comboWindowT.toFixed(2)}`,
      `M(combo): ${this.session.M.toFixed(3)}`,
      `Q: ${this.session.Q.toFixed(3)}`,
      `p_superNeedle: ${this.session.pSuperNeedle.toFixed(4)}`,
      `gauge: ${this.session.gauge.toFixed(3)}`,
      `superNeedleCount: ${this.session.superNeedleCount}`,
      `useSuper: ${this.session.useSuper}`,
      `regenRateCurrent: ${this.session.regenRateCurrent.toFixed(3)}`,
      `lastHitType: ${this.session.lastHitType}`,
      `coins: ${this.session.coins} shards: ${this.session.shards} cards: ${this.session.cards}`
      ,`needlesRemaining: ${this.session.limitNeedlesEnabled ? this.session.needlesRemaining : -1}`
      ,`levelCleared: ${this.session.levelCleared} levelFailed: ${this.session.levelFailed}`
      ,`bossPhase: ${this.session.bossPhaseActive}/${this.session.bossPhaseTotal}`
    ].join('\n');
  }
}
