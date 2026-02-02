import { _decorator, Component, Label, UITransform, Color, Vec3, Widget, Graphics, Node, Button, EventHandler } from 'cc';
import { GameSession } from '../core/GameSession';

const { ccclass } = _decorator;

@ccclass('ResultBanner')
export class ResultBanner extends Component {
  private session: GameSession | null = null;
  private label: Label | null = null;
  private nextNode: Node | null = null;
  private retryNode: Node | null = null;
  private menuNode: Node | null = null;
  private onNext: (() => void) | null = null;
  private onRetry: (() => void) | null = null;
  private onMenu: (() => void) | null = null;

  /**
   * Bind session for result display.
   * @param session Active session
   * @returns void
   */
  bind(session: GameSession, onNext?: () => void, onRetry?: () => void, onMenu?: () => void) {
    this.session = session;
    this.onNext = onNext ?? null;
    this.onRetry = onRetry ?? null;
    this.onMenu = onMenu ?? null;
  }

  /**
   * Initialize banner label.
   * @returns void
   */
  start() {
    this.label = this.getComponent(Label) ?? this.addComponent(Label);
    const ui = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    ui.setContentSize(600, 220);

    const widget = this.getComponent(Widget) ?? this.addComponent(Widget);
    widget.isAlignHorizontalCenter = true;
    widget.isAlignVerticalCenter = true;
    widget.updateAlignment();

    this.node.setPosition(new Vec3(0, 0, 0));
    this.label.color = new Color(255, 255, 255, 255);
    this.label.fontSize = 44;
    this.label.lineHeight = 52;
    this.label.horizontalAlign = Label.HorizontalAlign.CENTER;
    this.label.verticalAlign = Label.VerticalAlign.MIDDLE;
    this.label.overflow = Label.Overflow.SHRINK;

    this.ensureBackdrop();
    this.createButtons();
    this.refreshButtons();
    this.node.active = false;
  }

  /**
   * Update banner status.
   * @returns void
   */
  update() {
    if (!this.label || !this.session) {
      return;
    }
    if (this.session.levelCleared) {
      this.node.active = true;
      this.label.string = [
        'LEVEL CLEAR',
        `C:${this.session.coins}  S:${this.session.shards}  K:${this.session.cards}`
      ].join('\n');
      this.refreshButtons();
      return;
    }
    if (this.session.levelFailed) {
      this.node.active = true;
      this.label.string = [
        'LEVEL FAILED',
        `C:${this.session.coins}  S:${this.session.shards}  K:${this.session.cards}`
      ].join('\n');
      this.refreshButtons();
      return;
    }
    this.label.string = '';
    this.refreshButtons();
    this.node.active = false;
  }

  public onNextClicked() {
    if (!this.session || !this.session.levelCleared) {
      return;
    }
    const handler = this.onNext;
    this.onNext = null;
    if (handler) {
      handler();
    }
  }

  public onRetryClicked() {
    if (!this.session) {
      return;
    }
    const handler = this.onRetry;
    if (handler) {
      handler();
    }
  }

  public onMenuClicked() {
    if (!this.session) {
      return;
    }
    const handler = this.onMenu;
    if (handler) {
      handler();
    }
  }

  private createButtons() {
    if (this.nextNode || this.retryNode || this.menuNode) {
      return;
    }
    // Layout: Menu (Left), Retry (Center), Next (Right)
    // Spacing: 140
    this.menuNode = this.createButton('MenuButton', 'MENU', new Vec3(-160, -90, 0), 'onMenuClicked', new Color(60, 60, 80, 220), 140);
    this.retryNode = this.createButton('RetryButton', 'RETRY', new Vec3(0, -90, 0), 'onRetryClicked', new Color(80, 60, 20, 220), 140);
    this.nextNode = this.createButton('NextButton', 'NEXT', new Vec3(160, -90, 0), 'onNextClicked', new Color(40, 80, 40, 220), 140);
  }

  private createButton(name: string, text: string, position: Vec3, handler: string, bgColor: Color, width: number = 180): Node {
    const node = new Node(name);
    const ui = node.addComponent(UITransform);
    ui.setContentSize(width, 60);

    const gfx = node.addComponent(Graphics);
    gfx.clear();
    gfx.fillColor = bgColor;
    gfx.rect(-width/2, -30, width, 60); // Centered rect
    gfx.fill();

    const button = node.addComponent(Button);
    button.transition = Button.Transition.SCALE;
    button.zoomScale = 1.05;
    button.duration = 0.08;
    const eventHandler = new EventHandler();
    eventHandler.target = this.node;
    eventHandler.component = 'ResultBanner';
    eventHandler.handler = handler;
    button.clickEvents.push(eventHandler);

    const labelNode = new Node('Label');
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 24; // Smaller font for smaller buttons
    label.lineHeight = 28;
    label.color = new Color(255, 255, 255, 255);
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.MIDDLE;
    labelNode.setPosition(new Vec3(0, 0, 0));
    node.addChild(labelNode);

    node.setPosition(position);
    this.node.addChild(node);
    return node;
  }

  private refreshButtons() {
    const cleared = !!this.session?.levelCleared;
    
    if (this.menuNode) {
        this.menuNode.active = true;
    }
    if (this.retryNode) {
        this.retryNode.active = true; // Always allow retry
        // Adjust position if Next is hidden
        if (!cleared) {
            this.retryNode.setPosition(new Vec3(80, -90, 0));
            if (this.menuNode) this.menuNode.setPosition(new Vec3(-80, -90, 0));
        } else {
            this.retryNode.setPosition(new Vec3(0, -90, 0));
            if (this.menuNode) this.menuNode.setPosition(new Vec3(-160, -90, 0));
        }
    }
    if (this.nextNode) {
      this.nextNode.active = cleared;
    }
  }

  /**
   * Create a semi-transparent backdrop for readability.
   * @returns void
   */
  private ensureBackdrop() {
    const existing = this.node.getChildByName('Backdrop');
    if (existing) {
      return;
    }
    const backNode = new Node('Backdrop');
    const backTransform = backNode.addComponent(UITransform);
    backTransform.setContentSize(620, 230);
    const gfx = backNode.addComponent(Graphics);
    gfx.clear();
    gfx.fillColor = new Color(12, 12, 16, 200);
    gfx.rect(-310, -115, 620, 230);
    gfx.fill();
    gfx.strokeColor = new Color(255, 255, 255, 25);
    gfx.lineWidth = 1;
    for (let y = -100; y <= 100; y += 12) {
      gfx.moveTo(-300, y);
      gfx.lineTo(300, y);
    }
    gfx.stroke();
    gfx.fillColor = new Color(255, 90, 90, 200);
    gfx.rect(-310, 111, 620, 4);
    gfx.fill();
    this.node.addChild(backNode);
    backNode.setPosition(new Vec3(0, 0, 0));
    backNode.setSiblingIndex(0);
  }
}
