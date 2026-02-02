import { _decorator, Component, Label, UITransform, Color, Vec3, Node, EventTouch, Widget, Graphics } from 'cc';
import { GameSession } from '../core/GameSession';

const { ccclass } = _decorator;

@ccclass('SuperNeedleToggle')
export class SuperNeedleToggle extends Component {
  private session: GameSession | null = null;
  private label: Label | null = null;
  private background: Graphics | null = null;
  private lastActive = false;
  private lastCount = -1;
  private readonly activeColor = new Color(255, 215, 0, 255);
  private readonly inactiveColor = new Color(210, 210, 210, 255);
  private readonly activeScale = new Vec3(1.08, 1.08, 1);
  private readonly inactiveScale = new Vec3(1, 1, 1);

  /**
   * Bind session for toggle control.
   * @param session Active session
   * @returns void
   */
  bind(session: GameSession) {
    this.session = session;
  }

  /**
   * Initialize toggle UI.
   * @returns void
   */
  start() {
    // 1. Setup Container
    const ui = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    ui.setAnchorPoint(1, 0);
    ui.setContentSize(220, 110);

    const widget = this.getComponent(Widget) ?? this.addComponent(Widget);
    widget.isAlignBottom = true;
    widget.bottom = 120;
    widget.isAlignRight = true;
    widget.right = 40;
    widget.updateAlignment();
    this.node.setPosition(new Vec3(0, 0, 0));

    // 2. Setup Background Child (Layer 0)
    this.ensureBackground();

    // 3. Setup Label Child (Layer 1)
    let lblNode = this.node.getChildByName('LabelNode');
    if (!lblNode) {
        lblNode = new Node('LabelNode');
        this.node.addChild(lblNode);
    }
    lblNode.setSiblingIndex(1); // Ensure on top
    
    const lblTransform = lblNode.addComponent(UITransform);
    lblTransform.setAnchorPoint(1, 0);
    lblTransform.setContentSize(220, 110);
    lblNode.setPosition(0, 0, 0);

    this.label = lblNode.getComponent(Label) ?? lblNode.addComponent(Label);
    this.label.color = this.inactiveColor;
    this.label.fontSize = 22;
    this.label.lineHeight = 26;
    this.label.horizontalAlign = Label.HorizontalAlign.CENTER;
    this.label.verticalAlign = Label.VerticalAlign.MIDDLE;
    this.label.overflow = Label.Overflow.SHRINK;

    this.node.on(Node.EventType.TOUCH_END, this.toggle, this);
  }

  /**
   * Update toggle text every frame.
   * @returns void
   */
  update() {
    if (!this.label || !this.session) {
      return;
    }
    const active = this.session.useSuper;
    const count = this.session.superNeedleCount;
    if (active === this.lastActive && count === this.lastCount) {
      return;
    }
    this.lastActive = active;
    this.lastCount = count;
    const status = active ? 'ON' : 'OFF';
    this.label.string = `SUPER\nSTATUS: ${status}\nQTY: ${count}`;
    this.label.color = active ? this.activeColor : this.inactiveColor;
    this.node.setScale(active ? this.activeScale : this.inactiveScale);
    this.drawBackground(active);
  }

  /**
   * Toggle super-needle usage.
   * @param _event Touch event
   * @returns void
   */
  private toggle(_event: EventTouch) {
    if (!this.session) {
      return;
    }
    this.session.useSuper = !this.session.useSuper;
  }

  private ensureBackground() {
    if (this.background) {
      return;
    }
    const backNode = new Node('ToggleBackground');
    const backTransform = backNode.addComponent(UITransform);
    backTransform.setAnchorPoint(1, 0);
    backTransform.setContentSize(220, 110);
    const gfx = backNode.addComponent(Graphics);
    this.node.addChild(backNode);
    backNode.setSiblingIndex(0);
    this.background = gfx;
    this.drawBackground(false);
  }

  private drawBackground(active: boolean) {
    if (!this.background) {
      return;
    }
    const gfx = this.background;
    gfx.clear();
    // High contrast background
    gfx.fillColor = active ? new Color(255, 200, 0, 200) : new Color(40, 60, 80, 200);
    gfx.rect(-220, 0, 220, 110);
    gfx.fill();
    
    // Border
    gfx.strokeColor = new Color(255, 255, 255, 100);
    gfx.lineWidth = 2;
    gfx.rect(-220, 0, 220, 110);
    gfx.stroke();

    // Progress bar
    gfx.fillColor = active ? new Color(255, 255, 255, 200) : new Color(100, 200, 220, 200);
    gfx.rect(-220, 106, 220, 4);
    gfx.fill();
  }
}
