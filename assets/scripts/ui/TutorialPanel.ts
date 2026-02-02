import { _decorator, Component, Node, Label, Color, Button, EventHandler, UITransform, Widget, Graphics, Vec3 } from 'cc';
import { GameSession } from '../core/GameSession';

const { ccclass, property } = _decorator;

@ccclass('TutorialPanel')
export class TutorialPanel extends Component {
  private session: GameSession | null = null;
  private overlay: Node | null = null;
  private messageLabel: Label | null = null;

  bind(session: GameSession) {
    this.session = session;
  }

  start() {
    this.setupUI();
    this.checkTutorial();
  }

  private setupUI() {
    // Ensure the container itself fills the screen
    const selfWidget = this.node.getComponent(Widget) ?? this.node.addComponent(Widget);
    selfWidget.isAlignTop = selfWidget.isAlignBottom = selfWidget.isAlignLeft = selfWidget.isAlignRight = true;
    selfWidget.top = selfWidget.bottom = selfWidget.left = selfWidget.right = 0;
    selfWidget.updateAlignment();

    const canvasTransform = this.node.parent?.getComponent(UITransform);
    const width = canvasTransform?.contentSize.width ?? 720;
    const height = canvasTransform?.contentSize.height ?? 1280;

    const overlay = new Node('Overlay');
    const transform = overlay.addComponent(UITransform);
    transform.setAnchorPoint(0.5, 0.5);
    transform.setContentSize(width, height);

    const gfx = overlay.addComponent(Graphics);
    gfx.fillColor = new Color(8, 8, 12, 120); // Reduced opacity
    // Draw huge rect to ensure full coverage regardless of resolution
    gfx.rect(-5000, -5000, 10000, 10000);
    gfx.fill();

    const widget = overlay.addComponent(Widget);
    widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
    widget.top = widget.bottom = widget.left = widget.right = 0;
    widget.updateAlignment();

    const btn = overlay.addComponent(Button);
    btn.transition = Button.Transition.NONE;

    const clickHandler = new EventHandler();
    clickHandler.target = this.node;
    clickHandler.component = 'TutorialPanel';
    clickHandler.handler = 'onOverlayClicked';
    btn.clickEvents.push(clickHandler);

    this.node.addChild(overlay);
    this.overlay = overlay;

    const panelNode = new Node('Panel');
    const panelTransform = panelNode.addComponent(UITransform);
    panelTransform.setContentSize(620, 240);
    
    // Center Panel using Widget
    const panelWidget = panelNode.addComponent(Widget);
    panelWidget.isAlignHorizontalCenter = true;
    panelWidget.isAlignVerticalCenter = true;
    panelWidget.verticalCenter = 0; // Strictly center
    panelWidget.horizontalCenter = 0;
    
    const panelGfx = panelNode.addComponent(Graphics);
    panelGfx.fillColor = new Color(18, 18, 24, 220);
    panelGfx.rect(-310, -120, 620, 240);
    panelGfx.fill();
    panelGfx.fillColor = new Color(255, 215, 0, 180);
    panelGfx.rect(-310, 104, 620, 4);
    panelGfx.fill();
    // Position handled by Widget
    overlay.addChild(panelNode);

    const headerNode = new Node('Header');
    const header = headerNode.addComponent(Label);
    header.string = 'TUTORIAL';
    header.fontSize = 22;
    header.lineHeight = 28;
    header.color = new Color(255, 215, 0, 255);
    headerNode.setPosition(new Vec3(0, 80, 0));
    panelNode.addChild(headerNode);

    const msgNode = new Node('Message');
    const lbl = msgNode.addComponent(Label);
    lbl.fontSize = 32;
    lbl.lineHeight = 40;
    lbl.color = new Color(255, 255, 255, 255);
    lbl.horizontalAlign = Label.HorizontalAlign.CENTER; // Center text
    lbl.verticalAlign = Label.VerticalAlign.TOP;
    lbl.overflow = Label.Overflow.RESIZE_HEIGHT;
    const msgTransform = msgNode.addComponent(UITransform);
    msgTransform.setContentSize(560, 200);
    msgNode.setPosition(new Vec3(0, 20, 0));
    panelNode.addChild(msgNode);
    this.messageLabel = lbl;

    const hintNode = new Node('Hint');
    const hint = hintNode.addComponent(Label);
    hint.string = 'TAP TO START';
    hint.fontSize = 22;
    hint.color = new Color(255, 215, 0, 255);
    hintNode.setPosition(new Vec3(0, -90, 0));
    panelNode.addChild(hintNode);

    this.node.active = false;
  }

  public checkTutorial() {
    if (!this.session) return;
    
    const levelId = this.session.levelId;
    let message = "";

    if (levelId === 1) {
      message = "WELCOME, SNIPER.\n\nTAP TO SHOOT.\nHIT THE RED WEAK POINTS.\nAVOID MISSING.";
    } else if (levelId === 6) {
      message = "WARNING: SHIELDS DETECTED.\n\nDO NOT HIT THE SHIELDS.\nTIMING IS KEY.";
    } else {
      // No tutorial for other levels
      this.node.active = false;
      return;
    }

    if (this.messageLabel) {
      this.messageLabel.string = message;
    }
    
    this.node.active = true;
    this.session.paused = true;
  }

  public onOverlayClicked() {
    this.node.active = false;
    if (this.session) {
      this.session.paused = false;
    }
  }
}
