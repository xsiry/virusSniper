import { _decorator, Component, Label, Node, UITransform, Vec3, Color, Widget, Button, EventHandler, Graphics } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {
  private startCallback: (() => void) | null = null;

  /**
   * Set callback for start button.
   * @param cb Callback function
   */
  public bind(cb: () => void) {
    this.startCallback = cb;
  }

  start() {
    this.setupUI();
  }

  private setupUI() {
    // 1. Ensure MainMenu fills screen
    const uiTransform = this.getComponent(UITransform) ?? this.addComponent(UITransform);
    // Use Widget to fill parent (Canvas)
    const widget = this.getComponent(Widget) ?? this.addComponent(Widget);
    widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
    widget.top = widget.bottom = widget.left = widget.right = 0;
    widget.updateAlignment();

    const visibleSize = uiTransform.contentSize;
    const width = visibleSize.width;
    const height = visibleSize.height;

    const bgNode = new Node('Background');
    const bgTransform = bgNode.addComponent(UITransform);
    // ... Background can stay as is or use Widget too, but rect drawing is sufficient if MainMenu is sized
    bgTransform.setAnchorPoint(0.5, 0.5);
    bgTransform.setContentSize(width, height);
    const bg = bgNode.addComponent(Graphics);
    bg.fillColor = new Color(12, 12, 16, 255);
    bg.rect(-width / 2, -height / 2, width, height);
    bg.fill();
    // ... rest of background drawing ...
    bg.lineWidth = 2;
    bg.strokeColor = new Color(120, 120, 120, 80);
    bg.circle(0, 0, Math.min(width, height) * 0.25);
    bg.circle(0, 0, Math.min(width, height) * 0.14);
    bg.moveTo(-Math.min(width, height) * 0.3, 0);
    bg.lineTo(Math.min(width, height) * 0.3, 0);
    bg.moveTo(0, -Math.min(width, height) * 0.3);
    bg.lineTo(0, Math.min(width, height) * 0.3);
    bg.stroke();
    this.node.addChild(bgNode);
    bgNode.setSiblingIndex(0);

    // 2. Buttons with Widget
    const btnNode = new Node('StartButton');
    const btnTransform = btnNode.addComponent(UITransform);
    btnTransform.setContentSize(240, 72);
    
    const btnWidget = btnNode.addComponent(Widget);
    btnWidget.isAlignBottom = true;
    btnWidget.isAlignHorizontalCenter = true;
    btnWidget.bottom = 120; // Move up a bit
    
    // ... Graphics ...
    const btnGfx = btnNode.addComponent(Graphics);
    btnGfx.fillColor = new Color(40, 90, 40, 220);
    btnGfx.rect(-120, -36, 240, 72);
    btnGfx.fill();

    const btnLabelNode = new Node('Label');
    const btnLabel = btnLabelNode.addComponent(Label);
    btnLabel.string = 'START';
    btnLabel.fontSize = 32;
    btnLabel.lineHeight = 36;
    btnLabel.color = new Color(255, 255, 255, 255);
    btnLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
    btnLabelNode.setPosition(0, 0, 0);
    btnNode.addChild(btnLabelNode);

    const btn = btnNode.addComponent(Button);
    btn.transition = Button.Transition.SCALE;
    btn.zoomScale = 1.08;
    btn.duration = 0.1;

    const clickEventHandler = new EventHandler();
    clickEventHandler.target = this.node;
    clickEventHandler.component = 'MainMenu';
    clickEventHandler.handler = 'onStartClicked';
    btn.clickEvents.push(clickEventHandler);

    this.node.addChild(btnNode);

    // Title Layout (Top Center)
    const titleNode = new Node('Title');
    const titleLabel = titleNode.addComponent(Label);
    titleLabel.string = 'VIRUS SNIPER';
    titleLabel.fontSize = 78;
    titleLabel.lineHeight = 86;
    titleLabel.color = new Color(255, 70, 70, 255);
    const titleWidget = titleNode.addComponent(Widget);
    titleWidget.isAlignTop = true;
    titleWidget.isAlignHorizontalCenter = true;
    titleWidget.top = 180;
    this.node.addChild(titleNode);

    // Subtitle
    const subtitleNode = new Node('Subtitle');
    const subtitleLabel = subtitleNode.addComponent(Label);
    subtitleLabel.string = 'HARDCORE EDITION';
    subtitleLabel.fontSize = 24;
    subtitleLabel.color = new Color(200, 200, 200, 255);
    const subWidget = subtitleNode.addComponent(Widget);
    subWidget.isAlignTop = true;
    subWidget.isAlignHorizontalCenter = true;
    subWidget.top = 280;
    this.node.addChild(subtitleNode);

    // Hint (Below Subtitle)
    const hintNode = new Node('Hint');
    const hintLabel = hintNode.addComponent(Label);
    hintLabel.string = 'TACTICAL MODE: HARDCORE';
    hintLabel.fontSize = 18;
    hintLabel.color = new Color(200, 200, 200, 200);
    const hintWidget = hintNode.addComponent(Widget);
    hintWidget.isAlignTop = true;
    hintWidget.isAlignHorizontalCenter = true;
    hintWidget.top = 330;
    this.node.addChild(hintNode);

    // Footer (Version)
    const footerNode = new Node('Footer');
    const footerLabel = footerNode.addComponent(Label);
    footerLabel.string = 'v1.0.0 HARDCORE';
    footerLabel.fontSize = 16;
    footerLabel.color = new Color(100, 100, 100, 255);
    const footerWidget = footerNode.addComponent(Widget);
    footerWidget.isAlignBottom = true;
    footerWidget.isAlignHorizontalCenter = true;
    footerWidget.bottom = 20;
    this.node.addChild(footerNode);

    // Feature Buttons Row (Store, Rank, Setting)
    const rowNode = new Node('FeatureRow');
    const rowWidget = rowNode.addComponent(Widget);
    rowWidget.isAlignBottom = true;
    rowWidget.isAlignHorizontalCenter = true;
    rowWidget.bottom = 220; // Between Start and Footer
    this.node.addChild(rowNode);

    const features = [
        { name: 'STORE', color: new Color(255, 200, 0, 200) },
        { name: 'RANK', color: new Color(0, 200, 255, 200) },
        { name: 'SETTING', color: new Color(180, 180, 180, 200) }
    ];

    const spacing = 140;
    features.forEach((feat, index) => {
        const btn = this.createFeatureButton(feat.name, feat.color);
        btn.setPosition(new Vec3((index - 1) * spacing, 0, 0));
        rowNode.addChild(btn);
    });
    
    // Status
    const statusNode = new Node('Status');
    const statusLabel = statusNode.addComponent(Label);
    statusLabel.string = 'SYSTEM ONLINE';
    statusLabel.fontSize = 18;
    statusLabel.color = new Color(120, 220, 240, 200);
    const statusWidget = statusNode.addComponent(Widget);
    statusWidget.isAlignTop = true;
    statusWidget.isAlignLeft = true;
    statusWidget.top = 60;
    statusWidget.left = 40;
    this.node.addChild(statusNode);
  }

  /**
   * Handler for Start Button.
   */
  public onStartClicked() {
    if (this.startCallback) {
      this.startCallback();
    }
  }

  private createFeatureButton(text: string, color: Color): Node {
      const node = new Node(text);
      // Background (Circle/Icon style)
      const gfx = node.addComponent(Graphics);
      gfx.fillColor = new Color(20, 30, 40, 200);
      gfx.circle(0, 0, 40);
      gfx.fill();
      gfx.strokeColor = color;
      gfx.lineWidth = 2;
      gfx.circle(0, 0, 40);
      gfx.stroke();

      // Label
      const lblNode = new Node('Label');
      const lbl = lblNode.addComponent(Label);
      lbl.string = text;
      lbl.fontSize = 18;
      lbl.lineHeight = 20;
      lbl.color = color;
      lblNode.setPosition(0, -60, 0); // Below icon
      node.addChild(lblNode);

      // Button component (placeholder)
      const btn = node.addComponent(Button);
      btn.transition = Button.Transition.SCALE;
      btn.zoomScale = 1.1;
      
      return node;
  }
}
