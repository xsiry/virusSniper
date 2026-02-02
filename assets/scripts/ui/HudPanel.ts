import { _decorator, Component, Label, UITransform, Color, Vec3, Widget, Node, Graphics, tween, view } from 'cc';
import { GameSession } from '../core/GameSession';
import { MathUtil } from '../utils/MathUtil';

const { ccclass } = _decorator;

@ccclass('HudPanel')
export class HudPanel extends Component {
  private session: GameSession | null = null;
  private primaryLabel: Label | null = null;
  private secondaryLabel: Label | null = null;
  private tertiaryLabel: Label | null = null;
  private background: Graphics | null = null;
  private hpBar: Graphics | null = null;
  private comboBar: Graphics | null = null;
  private gaugeBar: Graphics | null = null;
  private hudWidth = 520;

  // State tracking for animations
  private lastCombo = 0;
  private lastHp = 0;
  private lastGauge = 0;

  bind(session: GameSession) {
    this.session = session;
    this.lastHp = session.hpCurrent;
  }

  start() {
    const visibleSize = view.getVisibleSize();
    this.hudWidth = Math.min(520, visibleSize.width * 0.92); // Max 520, or 92% of screen

    const ui = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    ui.setAnchorPoint(0.5, 1); // Center anchor
    ui.setContentSize(this.hudWidth, 190);

    const widget = this.getComponent(Widget) ?? this.addComponent(Widget);
    widget.isAlignTop = true;
    widget.top = 40; // More margin from notch
    widget.isAlignHorizontalCenter = true;
    widget.horizontalCenter = 0;
    widget.updateAlignment();

    this.node.setPosition(new Vec3(0, 0, 0));

    this.ensureBackground();
    this.primaryLabel = this.createLabelNode('HudPrimary', 10, 24, new Color(255, 255, 255, 255));
    this.secondaryLabel = this.createLabelNode('HudSecondary', 46, 20, new Color(210, 210, 210, 255));
    this.tertiaryLabel = this.createLabelNode('HudTertiary', 74, 18, new Color(190, 190, 190, 255));
    this.createBars();
  }

  update() {
    if (!this.primaryLabel || !this.secondaryLabel || !this.tertiaryLabel || !this.session) {
      return;
    }
    const needles = this.session.limitNeedlesEnabled ? `${this.session.needlesRemaining}` : '∞';
    this.primaryLabel.string = `HP ${Math.ceil(this.session.hpCurrent)}/${this.session.hpMax}  ND ${needles}`;
    this.secondaryLabel.string = `LV ${this.session.levelId}  COMBO ${this.session.combo} (Q${this.session.comboQuality.toFixed(1)})`;
    this.tertiaryLabel.string = `DROP C${this.session.coins} S${this.session.shards} K${this.session.cards}`;
    
    // Animations
    if (this.session.combo !== this.lastCombo) {
        if (this.session.combo > this.lastCombo) {
            this.punchLabel(this.secondaryLabel.node, 1.2);
        } else {
             this.shakeNode(this.node, 5);
        }
        this.lastCombo = this.session.combo;
    }

    if (this.session.hpCurrent < this.lastHp) {
        this.shakeNode(this.hpBar!.node, 3);
    }
    this.lastHp = this.session.hpCurrent;

    this.updateBars();
  }

  private punchLabel(node: Node, scale: number) {
      tween(node)
        .to(0.1, { scale: new Vec3(scale, scale, 1) })
        .to(0.1, { scale: new Vec3(1, 1, 1) })
        .start();
  }

  private shakeNode(node: Node, intensity: number) {
      const originalPos = node.position.clone();
      tween(node)
        .by(0.05, { position: new Vec3(intensity, 0, 0) })
        .by(0.05, { position: new Vec3(-intensity * 2, 0, 0) })
        .by(0.05, { position: new Vec3(intensity, 0, 0) })
        .to(0.01, { position: originalPos })
        .start();
  }

  private createLabelNode(name: string, yOffset: number, fontSize: number, color: Color): Label {
    const node = new Node(name);
    const transform = node.addComponent(UITransform);
    transform.setAnchorPoint(0, 1);
    transform.setContentSize(this.hudWidth - 32, fontSize + 10);
    // Position relative to center anchor (0.5, 1)
    // Left edge is at -hudWidth/2. Padding 16.
    node.setPosition(new Vec3(-this.hudWidth / 2 + 16, -yOffset, 0));

    const label = node.addComponent(Label);
    label.color = color;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 6;
    label.horizontalAlign = Label.HorizontalAlign.LEFT;
    label.verticalAlign = Label.VerticalAlign.TOP;
    label.overflow = Label.Overflow.SHRINK;

    this.node.addChild(node);
    return label;
  }

  private ensureBackground() {
    if (this.background) {
      return;
    }
    const backNode = new Node('HudBackground');
    const backTransform = backNode.addComponent(UITransform);
    backTransform.setAnchorPoint(0.5, 1);
    backTransform.setContentSize(this.hudWidth, 190);
    const gfx = backNode.addComponent(Graphics);
    gfx.clear();
    // Centered drawing
    const w = this.hudWidth;
    const h = 190;
    
    gfx.fillColor = new Color(0, 10, 20, 200);
    gfx.roundRect(-w/2, -h, w, h, 12);
    gfx.fill();
    
    gfx.fillColor = new Color(0, 200, 255, 255);
    gfx.roundRect(-w/2, 0, w, 4, 2);
    gfx.fill();

    gfx.fillColor = new Color(255, 255, 255, 30);
    gfx.roundRect(-w/2 + 10, -10, w - 20, 1, 0.5);
    gfx.roundRect(-w/2 + 10, -180, w - 20, 1, 0.5);
    gfx.fill();

    this.node.addChild(backNode);
    backNode.setSiblingIndex(0);
    this.background = gfx;
  }

  private createBars() {
    if (this.hpBar || this.comboBar || this.gaugeBar) {
      return;
    }
    const barW = this.hudWidth - 40;
    // Align left relative to center: -hudWidth/2 + 20
    const leftX = -this.hudWidth / 2 + 20;

    const hpNode = new Node('HpBar');
    const hpTransform = hpNode.addComponent(UITransform);
    hpTransform.setAnchorPoint(0, 1);
    hpTransform.setContentSize(barW, 14);
    hpNode.setPosition(new Vec3(leftX, -100, 0));
    this.hpBar = hpNode.addComponent(Graphics);
    this.node.addChild(hpNode);

    const comboNode = new Node('ComboBar');
    const comboTransform = comboNode.addComponent(UITransform);
    comboTransform.setAnchorPoint(0, 1);
    comboTransform.setContentSize(barW, 8);
    comboNode.setPosition(new Vec3(leftX, -130, 0));
    this.comboBar = comboNode.addComponent(Graphics);
    this.node.addChild(comboNode);

    const gaugeNode = new Node('GaugeBar');
    const gaugeTransform = gaugeNode.addComponent(UITransform);
    gaugeTransform.setAnchorPoint(0, 1);
    gaugeTransform.setContentSize(barW, 6);
    gaugeNode.setPosition(new Vec3(leftX, -150, 0));
    this.gaugeBar = gaugeNode.addComponent(Graphics);
    this.node.addChild(gaugeNode);
  }

  private updateBars() {
    if (!this.session || !this.hpBar || !this.comboBar || !this.gaugeBar) {
      return;
    }
    const barW = this.hudWidth - 40;
    const hpPct = this.session.hpMax > 0 ? this.session.hpCurrent / this.session.hpMax : 0;
    const comboPct = Math.min(1, this.session.combo / 20);
    const gaugePct = Math.max(0, Math.min(1, this.session.gauge));

    this.drawBar(this.hpBar, barW, 14, hpPct, new Color(255, 60, 60, 255), new Color(60, 20, 20, 200), true);
    this.drawBar(this.comboBar, barW, 8, comboPct, new Color(255, 180, 0, 255), new Color(40, 30, 10, 200));

    let gaugeColor = new Color(0, 200, 255, 255);
    if (this.session.gauge >= 1) {
        const t = Date.now() / 200;
        const bright = 200 + 55 * Math.sin(t);
        gaugeColor = new Color(bright * 0.5, bright, 255, 255);
    }
    this.drawBar(this.gaugeBar, barW, 6, gaugePct, gaugeColor, new Color(10, 30, 40, 200));
  }

  private drawBar(gfx: Graphics, width: number, height: number, pct: number, fill: Color, background: Color, segmented = false) {
    const w = Math.max(0, Math.min(1, pct)) * width;
    gfx.clear();
    const r = height / 2;
    
    // Background (Capsule)
    gfx.fillColor = background;
    gfx.roundRect(0, -height, width, height, r);
    gfx.fill();
    
    // Fill (Capsule)
    if (w > 0) {
        gfx.fillColor = fill;
        // Ensure radius doesn't exceed width for small values
        const effR = Math.min(r, w / 2);
        gfx.roundRect(0, -height, w, height, effR);
        gfx.fill();
        
        // Shine effect (simple top highlight)
        gfx.fillColor = new Color(255, 255, 255, 50);
        gfx.roundRect(0, -height / 2, w, height / 2, effR);
        gfx.fill();
    }

    if (segmented) {
        gfx.fillColor = new Color(0, 0, 0, 100);
        const segments = 10;
        const segW = width / segments;
        for (let i = 1; i < segments; i++) {
            gfx.rect(i * segW, -height, 2, height);
        }
        gfx.fill();
    }
  }
}
