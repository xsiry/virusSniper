import { _decorator, Node, Vec3, Color, Graphics, Label, tween, UIOpacity, UITransform } from 'cc';

const { ccclass } = _decorator;

@ccclass('EffectManager')
export class EffectManager {
  private static _instance: EffectManager;
  private root: Node | null = null;
  private camera: Node | null = null;
  private pool: Node[] = [];

  static get instance(): EffectManager {
    if (!this._instance) {
      this._instance = new EffectManager();
    }
    return this._instance;
  }

  bind(root: Node, camera?: Node) {
    this.root = root;
    this.camera = camera || null;
  }

  private getFromPool(name: string): Node {
    let node = this.pool.pop();
    if (!node) {
        node = new Node(name);
        node.addComponent(Graphics);
        node.addComponent(UIOpacity);
    } else {
        node.name = name;
        node.active = true;
        node.scale = new Vec3(1, 1, 1);
        node.position = new Vec3(0, 0, 0);
        node.angle = 0;
        node.getComponent(UIOpacity)!.opacity = 255;
        node.getComponent(Graphics)!.clear();
    }
    return node;
  }

  private returnToPool(node: Node) {
      node.active = false;
      node.removeFromParent();
      this.pool.push(node);
  }

  playHitEffect(position: Vec3, color: Color) {
    if (!this.root) return;

    // 1. Neon Ring
    const ringNode = this.getFromPool('EffectRing');
    const ringGfx = ringNode.getComponent(Graphics)!;
    ringGfx.lineWidth = 4;
    ringGfx.strokeColor = color;
    ringGfx.circle(0, 0, 15);
    ringGfx.stroke();
    ringNode.setPosition(position);
    this.root.addChild(ringNode);

    tween(ringNode)
      .to(0.2, { scale: new Vec3(2.5, 2.5, 1) })
      .call(() => this.returnToPool(ringNode))
      .start();
    
    tween(ringNode.getComponent(UIOpacity)!)
      .to(0.2, { opacity: 0 })
      .start();

    // 2. Solid Particles
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
        const p = this.getFromPool('Particle');
        const gfx = p.getComponent(Graphics)!;
        gfx.fillColor = color;
        gfx.circle(0, 0, 4);
        gfx.fill();
        p.setPosition(position);
        this.root.addChild(p);

        const angle = (Math.PI * 2 * i) / particleCount;
        const dist = 40;
        tween(p)
            .to(0.3, { position: new Vec3(position.x + Math.cos(angle) * dist, position.y + Math.sin(angle) * dist, 0), scale: new Vec3(0, 0, 1) }, { easing: 'cubicOut' })
            .call(() => this.returnToPool(p))
            .start();
    }
  }

  playTextEffect(position: Vec3, text: string, color: Color) {
    if (!this.root) return;

    const node = this.getFromPool('EffectText');
    node.setPosition(position.x, position.y + 40, position.z);
    
    // Ensure components
    let transform = node.getComponent(UITransform);
    if (!transform) transform = node.addComponent(UITransform);
    transform.setContentSize(200, 50);

    let lbl = node.getComponent(Label);
    if (!lbl) lbl = node.addComponent(Label);
    lbl.string = text;
    lbl.fontSize = 32;
    lbl.color = color;
    lbl.isBold = true;
    
    // Shadow child
    let shadow = node.getChildByName('Shadow');
    if (!shadow) {
        shadow = new Node('Shadow');
        node.addChild(shadow);
        shadow.addComponent(Label);
    }
    const sLbl = shadow.getComponent(Label)!;
    sLbl.string = text;
    sLbl.fontSize = 32;
    sLbl.color = new Color(0, 0, 0, 150);
    sLbl.isBold = true;
    shadow.setPosition(2, -2, 0);

    this.root.addChild(node);

    tween(node)
      .parallel(
        tween(node).by(0.6, { position: new Vec3(0, 80, 0) }, { easing: 'backOut' }),
        tween(node.getComponent(UIOpacity)!).to(0.6, { opacity: 0 }, { easing: 'quadIn' })
      )
      .call(() => this.returnToPool(node))
      .start();
  }

  playResourceFly(from: Vec3, type: 'coin' | 'shard') {
      if (!this.root) return;

      const node = this.getFromPool('ResourceFly');
      const gfx = node.getComponent(Graphics)!;
      gfx.clear();
      
      const color = type === 'coin' ? new Color(255, 200, 0, 255) : new Color(0, 200, 255, 255);
      
      // Draw icon
      if (type === 'coin') {
          gfx.fillColor = color;
          gfx.circle(0, 0, 12);
          gfx.fill();
          gfx.strokeColor = new Color(255, 255, 255, 200);
          gfx.lineWidth = 2;
          gfx.circle(0, 0, 8);
          gfx.stroke();
      } else {
          gfx.fillColor = color;
          gfx.moveTo(0, 12);
          gfx.lineTo(10, -8);
          gfx.lineTo(-10, -8);
          gfx.close();
          gfx.fill();
      }

      node.setPosition(from);
      this.root.addChild(node);

      // Bezier-like curve or direct move to top-right (approximate UI position)
      // Assuming UI is screen space overlay, we target roughly top-right world relative
      // A simple move up and right is fine for MVP
      const target = new Vec3(200, 500, 0); 
      
      tween(node)
        .to(0.8, { position: target, scale: new Vec3(0.5, 0.5, 1) }, { easing: 'cubicIn' })
        .call(() => this.returnToPool(node))
        .start();
  }

  playScreenShake(intensity: number = 5, duration: number = 0.2) {
    if (!this.camera) return;
    
    // Simple shake logic (same as before but maybe tweaked)
    const originalPos = this.camera.position.clone();
    const shake = tween(this.camera);
    
    const steps = 8; // More steps for smoother jitter
    const stepDuration = duration / steps;

    for (let i = 0; i < steps; i++) {
        shake.to(stepDuration, { 
            position: new Vec3(
                originalPos.x + (Math.random() - 0.5) * intensity * 2, 
                originalPos.y + (Math.random() - 0.5) * intensity * 2, 
                originalPos.z
            ) 
        });
    }

    shake.to(stepDuration, { position: originalPos }).start();
  }

  playExplosion(position: Vec3, color: Color = new Color(255, 100, 100)) {
    if (!this.root) return;

    // 1. Shockwave
    const wave = this.getFromPool('Shockwave');
    const wGfx = wave.getComponent(Graphics)!;
    wGfx.lineWidth = 10;
    wGfx.strokeColor = color;
    wGfx.circle(0, 0, 20);
    wGfx.stroke();
    wave.setPosition(position);
    this.root.addChild(wave);

    tween(wave)
        .to(0.4, { scale: new Vec3(6, 6, 1) })
        .call(() => this.returnToPool(wave))
        .start();
    
    tween(wave.getComponent(UIOpacity)!)
        .to(0.4, { opacity: 0 })
        .start();

    // 2. Debris (Many small squares)
    const debrisCount = 20;
    for (let i = 0; i < debrisCount; i++) {
        const debris = this.getFromPool('Debris');
        const dg = debris.getComponent(Graphics)!;
        dg.fillColor = color; // Maybe vary brightness?
        dg.rect(-6, -6, 12, 12);
        dg.fill();
        debris.setPosition(position);
        debris.angle = Math.random() * 360;
        this.root.addChild(debris);

        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 100;
        const dur = 0.4 + Math.random() * 0.3;

        tween(debris)
            .to(dur, { 
                position: new Vec3(position.x + Math.cos(angle) * dist, position.y + Math.sin(angle) * dist, 0), 
                scale: new Vec3(0.2, 0.2, 1),
                angle: Math.random() * 360
            }, { easing: 'cubicOut' })
            .call(() => this.returnToPool(debris))
            .start();
    }

     this.playScreenShake(12, 0.5);
  }
}
