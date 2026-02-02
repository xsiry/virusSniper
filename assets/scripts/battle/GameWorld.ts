import { _decorator, Component, Node, UITransform, Vec3, EventTouch, Graphics, Color, tween, view } from 'cc';
import { ConfigRepo } from '../core/ConfigRepo';
import { GameSession } from '../core/GameSession';
import { LevelConfig } from '../data/ConfigTypes';
import { Shooter } from './Shooter';
import { CombatSystem } from './CombatSystem';
import { DropSystem } from './DropSystem';
import { Virus } from '../entities/Virus';
import { HudPanel } from '../ui/HudPanel';
import { SuperNeedleToggle } from '../ui/SuperNeedleToggle';
import { ResultBanner } from '../ui/ResultBanner';

const { ccclass } = _decorator;

@ccclass('GameWorld')
export class GameWorld extends Component {
  private session: GameSession | null = null;
  private level: LevelConfig | null = null;
  private shooter: Shooter | null = null;
  private combat: CombatSystem | null = null;
  private dropSystem: DropSystem | null = null;
  private viruses: Virus[] = [];
  private bounds = { width: 0, height: 0 };
  private onNext: (() => void) | null = null;
  private onRetry: (() => void) | null = null;
  private onMenu: (() => void) | null = null;
  private resultBanner: ResultBanner | null = null;

  private canvasTransform: UITransform | null = null;

  /**
   * Bind session for world setup.
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
   * Initialize level content and UI.
   * @returns void
   */
  start() {
    if (!this.session) {
      return;
    }

    const repo = ConfigRepo.instance;
    const level = repo.getLevel(this.session.levelId);
    if (!level) {
      return;
    }
    this.level = level;

    const canvas = this.node.parent?.parent;
    this.canvasTransform = canvas?.getComponent(UITransform) ?? null;
    if (!canvas || !this.canvasTransform) {
      return;
    }
    this.bounds.width = this.canvasTransform.contentSize.width;
    this.bounds.height = this.canvasTransform.contentSize.height;

    this.spawnBackground();
    this.spawnShooter();
    this.spawnViruses(level, repo);
    this.initializeTotalHp(level);

    this.dropSystem = new DropSystem(this.session);
    this.combat = this.node.addComponent(CombatSystem);
    this.combat.bind(this.session, this.shooter!, this.viruses, this.dropSystem, this.bounds);

    this.bindInput(canvas);
    this.spawnUI(canvas);
  }

  /**
   * Step session, shooter, viruses, and combat system.
   * @param dt Delta time seconds
   * @returns void
   */
  update(dt: number) {
    if (!this.session || !this.shooter || !this.combat) {
      return;
    }
    if (this.session.paused) {
      return;
    }
    if (this.session.levelCleared || this.session.levelFailed) {
      return;
    }
    
    // Update bounds for dynamic resizing
    if (this.canvasTransform) {
        this.bounds.width = this.canvasTransform.contentSize.width;
        this.bounds.height = this.canvasTransform.contentSize.height;
    }

    this.session.advanceTime(dt);
    const gameDt = dt * this.session.timeScale;

    this.shooter.stepNeedles(gameDt);
    for (const virus of this.viruses) {
      virus.step(gameDt);
    }
    this.combat.step(gameDt);
    this.updateBossPhase();
    this.checkLevelClear();
  }

  /**
   * Create shooter node.
   * @returns void
   */
  private spawnShooter() {
    if (!this.level || !this.session) {
      return;
    }
    const node = new Node('Shooter');
    // Align near bottom with safe margin
    const bottomMargin = Math.max(120, this.bounds.height * 0.15);
    node.setPosition(new Vec3(0, -this.bounds.height / 2 + bottomMargin, 0));
    const shooter = node.addComponent(Shooter);
    shooter.bind(this.session, this.level);
    this.node.addChild(node);
    this.shooter = shooter;
  }

  private spawnBackground() {
    const node = new Node('WorldBackground');
    const gfx = node.addComponent(Graphics);
    const width = this.bounds.width;
    const height = this.bounds.height;

    gfx.clear();
    gfx.fillColor = new Color(8, 8, 12, 255);
    gfx.rect(-width / 2, -height / 2, width, height);
    gfx.fill();

    // Grid centered
    gfx.strokeColor = new Color(40, 60, 70, 120);
    gfx.lineWidth = 1;
    const spacing = 80;
    const cols = Math.ceil(width / spacing);
    const rows = Math.ceil(height / spacing);
    
    for (let i = -cols / 2; i <= cols / 2; i++) {
        gfx.moveTo(i * spacing, -height / 2);
        gfx.lineTo(i * spacing, height / 2);
    }
    for (let i = -rows / 2; i <= rows / 2; i++) {
        gfx.moveTo(-width / 2, i * spacing);
        gfx.lineTo(width / 2, i * spacing);
    }
    gfx.stroke();

    // Safe Area Outline
    const safeW = width * 0.95;
    const safeH = height * 0.95;
    gfx.strokeColor = new Color(255, 90, 90, 40);
    gfx.lineWidth = 2;
    gfx.rect(-safeW / 2, -safeH / 2, safeW, safeH);
    gfx.stroke();

    this.node.addChild(node);
    node.setSiblingIndex(0);

    const scan = new Node('Scanline');
    const scanGfx = scan.addComponent(Graphics);
    scanGfx.strokeColor = new Color(80, 200, 255, 90);
    scanGfx.lineWidth = 2;
    scanGfx.moveTo(-width / 2, 0);
    scanGfx.lineTo(width / 2, 0);
    scanGfx.stroke();
    node.addChild(scan);
    scan.setPosition(new Vec3(0, height / 2, 0));
    tween(scan)
      .to(4.0, { position: new Vec3(0, -height / 2, 0) })
      .call(() => scan.setPosition(new Vec3(0, height / 2, 0)))
      .union()
      .repeatForever()
      .start();
      
    // Ambient dots
    for (let i = 0; i < 16; i += 1) {
      const dot = new Node('AmbientDot');
      const dotGfx = dot.addComponent(Graphics);
      const dx = (Math.random() - 0.5) * (width - 120);
      const dy = (Math.random() - 0.5) * (height - 120);
      const r = 2 + Math.random() * 2.5;
      dotGfx.fillColor = new Color(120, 220, 240, 120);
      dotGfx.circle(0, 0, r);
      dotGfx.fill();
      node.addChild(dot);
      dot.setPosition(new Vec3(dx, dy, 0));
      dot.setScale(0.6, 0.6, 1);
      tween(dot)
        .to(1.6 + Math.random() * 1.6, { scale: new Vec3(1.2, 1.2, 1) })
        .to(1.6 + Math.random() * 1.6, { scale: new Vec3(0.6, 0.6, 1) })
        .union()
        .repeatForever()
        .start();
    }
  }

  /**
   * Create virus targets based on level config.
   * @param level Level config
   * @param repo Config repository
   * @returns void
   */
  private spawnViruses(level: LevelConfig, repo: ConfigRepo) {
    const count = level.multiTargetEnabled ? (level.targetCount ?? 1) : 1;
    
    // Calculate Playable Center Y
    const virusY = this.bounds.height * 0.15;

    const availableWidth = this.bounds.width * 0.8; // Keep margins
    const spacing = count > 1 ? availableWidth / (count - 1) : 0;
    const startX = count > 1 ? -availableWidth / 2 : 0;

    for (let i = 0; i < count; i++) {
      const node = new Node(`Virus_${i + 1}`);
      const virus = node.addComponent(Virus);
      const variant = repo.getVariant(level.variantId);
      const archetype = repo.getArchetype(level.enemyArchetype);
      virus.bind(this.session!, level, variant ?? undefined, archetype ?? undefined);
      
      const x = count > 1 ? startX + i * spacing : 0;
      node.setPosition(new Vec3(x, virusY, 0));
      this.node.addChild(node);
      this.viruses.push(virus);
    }
  }

  /**
   * Initialize total HP for multi-target levels.
   * @param level Level config
   * @returns void
   */
  private initializeTotalHp(level: LevelConfig) {
    if (!this.session) {
      return;
    }
    if (level.multiTargetEnabled && level.targetCount) {
      this.session.setTotalHp(level.hp * level.targetCount);
      this.session.configureNeedleLimit(level.limitNeedlesEnabled, level.limitNeedles ?? 0);
      return;
    }
    this.session.setTotalHp(level.hp);
    this.session.configureNeedleLimit(level.limitNeedlesEnabled, level.limitNeedles ?? 0);
  }

  /**
   * Bind touch input for firing needles.
   * @param canvas Canvas node
   * @returns void
   */
  private bindInput(canvas: Node) {
    canvas.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
      if (!this.shooter) {
        return;
      }
      if (this.session?.paused) {
        return;
      }
      if (this.session?.levelCleared || this.session?.levelFailed) {
        return;
      }
      const uiTransform = canvas.getComponent(UITransform);
      if (!uiTransform) {
        return;
      }
      const location = event.getUILocation();
      const local = uiTransform.convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
      this.shooter.fire(local);
    });
  }

  /**
   * Spawn HUD and super-needle toggle UI.
   * @param canvas Canvas node
   * @returns void
   */
  private spawnUI(canvas: Node) {
    const uiRoot = canvas.getChildByName('UIRoot');
    if (!uiRoot || !this.session) {
      return;
    }
    const hudNode = new Node('HudPanel');
    const hud = hudNode.addComponent(HudPanel);
    hud.bind(this.session);
    uiRoot.addChild(hudNode);

    const toggleNode = new Node('SuperNeedleToggle');
    const toggle = toggleNode.addComponent(SuperNeedleToggle);
    toggle.bind(this.session);
    uiRoot.addChild(toggleNode);

    const resultNode = new Node('ResultBanner');
    const result = resultNode.addComponent(ResultBanner);
    result.bind(this.session, this.onNext ?? undefined, this.onRetry ?? undefined, this.onMenu ?? undefined);
    uiRoot.addChild(resultNode);
    this.resultBanner = result;
  }

  /**
   * Mark level clear when all targets are defeated.
   * @returns void
   */
  private checkLevelClear() {
    if (!this.session) {
      return;
    }
    if (this.session.hpCurrent <= 0) {
      this.session.levelCleared = true;
      if (this.resultBanner) this.resultBanner.node.active = true;
      return;
    }
    const alive = this.viruses.some((virus) => !virus.isDead());
    if (!alive) {
      this.session.levelCleared = true;
      if (this.resultBanner) this.resultBanner.node.active = true;
    }
    if (this.session.levelCleared) {
      return;
    }
    if (this.session.limitNeedlesEnabled && this.session.needlesRemaining <= 0) {
      const activeNeedles = this.shooter?.getNeedles().length ?? 0;
      if (activeNeedles <= 0) {
        if (!this.session.levelFailed) {
          this.session.levelFailed = true;
          this.session.applyFailure();
          if (this.resultBanner) this.resultBanner.node.active = true;
        }
      }
    }
  }

  /**
   * Update boss phase progress for UI/debug.
   * @returns void
   */
  private updateBossPhase() {
    if (!this.session) {
      return;
    }
    let active = 0;
    let total = 0;
    for (const virus of this.viruses) {
      const progress = virus.getPhaseProgress();
      total = Math.max(total, progress.total);
      active = Math.max(active, progress.active);
    }
    this.session.updateBossPhase(active, total);
  }
}