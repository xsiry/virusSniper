import { _decorator, Component, director, Node, AudioSource, UITransform, Widget } from 'cc';
import { ConfigLoader } from './core/ConfigLoader';
import { ConfigRepo } from './core/ConfigRepo';
import { GameSession } from './core/GameSession';
import { FormulaService } from './core/FormulaService';
import { EconomyService } from './core/EconomyService';
import { RngService } from './core/RngService';
import { AudioService } from './core/AudioService';
import { DebugPanel } from './debug/DebugPanel';
import { GameWorld } from './battle/GameWorld';
import { MainMenu } from './ui/MainMenu';
import { TutorialPanel } from './ui/TutorialPanel';
import { EffectManager } from './core/EffectManager';

const { ccclass, property } = _decorator;

@ccclass('AppRoot')
export class AppRoot extends Component {
  @property(AudioSource)
  audioSource: AudioSource | null = null;

  private session: GameSession | null = null;
  private currentView: Node | null = null;

  async start() {
    if (!this.audioSource) {
      this.audioSource = this.getComponent(AudioSource) ?? this.addComponent(AudioSource);
    }
    AudioService.instance.init(this.audioSource);

    const bundle = await ConfigLoader.loadAll();
    ConfigRepo.instance.initialize(bundle);
    const repo = ConfigRepo.instance;
    if (!repo.combatFormula || !repo.economy) {
      throw new Error('ConfigRepo not initialized');
    }

    this.ensureWorldRoots();
    this.spawnMainMenu();
  }

  private ensureWorldRoots() {
    const scene = director.getScene();
    if (!scene) {
      return;
    }
    const canvas = scene.getChildByName('Canvas');
    if (!canvas) {
      return;
    }
    if (!canvas.getChildByName('WorldRoot')) {
      const world = new Node('WorldRoot');
      const transform = world.addComponent(UITransform);
      const widget = world.addComponent(Widget);
      widget.isAlignTop = true;
      widget.isAlignBottom = true;
      widget.isAlignLeft = true;
      widget.isAlignRight = true;
      widget.top = 0;
      widget.bottom = 0;
      widget.left = 0;
      widget.right = 0;
      canvas.addChild(world);
    }
    if (!canvas.getChildByName('UIRoot')) {
      const ui = new Node('UIRoot');
      const transform = ui.addComponent(UITransform);
      const widget = ui.addComponent(Widget);
      widget.isAlignTop = true;
      widget.isAlignBottom = true;
      widget.isAlignLeft = true;
      widget.isAlignRight = true;
      widget.top = 0;
      widget.bottom = 0;
      widget.left = 0;
      widget.right = 0;
      canvas.addChild(ui);
    }

    const camera = canvas.getChildByName('Camera');
    const worldRoot = canvas.getChildByName('WorldRoot');
    if (worldRoot) {
      EffectManager.instance.bind(worldRoot, camera ?? undefined);
    }
  }

  private spawnMainMenu() {
    this.clearCurrentView();

    const scene = director.getScene();
    const canvas = scene?.getChildByName('Canvas');
    if (!canvas) {
      return;
    }

    const node = new Node('MainMenu');
    const menu = node.addComponent(MainMenu);
    menu.bind(() => this.startGame());

    canvas.addChild(node);
    this.currentView = node;
  }

  private startGame() {
    this.startSession(this.getFirstLevelId());
  }

  private clearCurrentView() {
    if (this.currentView) {
      this.currentView.destroy();
      this.currentView = null;
    }

    const scene = director.getScene();
    const worldRoot = scene?.getChildByName('Canvas')?.getChildByName('WorldRoot');
    if (worldRoot) {
      worldRoot.removeAllChildren();
    }

    const uiRoot = scene?.getChildByName('Canvas')?.getChildByName('UIRoot');
    if (uiRoot) {
      uiRoot.removeAllChildren();
    }
  }

  private startSession(levelId: number) {
    this.clearCurrentView();
    const repo = ConfigRepo.instance;
    const formula = new FormulaService(repo.combatFormula!);
    const economy = new EconomyService(repo.economy!);
    const rng = new RngService(Date.now());

    const resolvedLevelId = repo.getLevel(levelId) ? levelId : (repo.levels[0]?.levelId ?? 1);
    const session = new GameSession(resolvedLevelId, repo, formula, economy, rng);
    this.session = session;

    // this.spawnDebugPanel(); // Disabled for production polish
    this.spawnGameWorld(session);
    this.spawnTutorialPanel(session);
  }

  private getFirstLevelId(): number {
    const levels = [...ConfigRepo.instance.levels].sort((a, b) => a.levelId - b.levelId);
    return levels[0]?.levelId ?? 1;
  }

  private getNextLevelId(currentId: number): number | null {
    const levels = [...ConfigRepo.instance.levels].sort((a, b) => a.levelId - b.levelId);
    const index = levels.findIndex((level) => level.levelId === currentId);
    if (index < 0 || index >= levels.length - 1) {
      return null;
    }
    return levels[index + 1].levelId;
  }

  private handleNextLevel() {
    if (!this.session) {
      return;
    }
    const next = this.getNextLevelId(this.session.levelId);
    if (!next) {
      this.spawnMainMenu();
      return;
    }
    this.startSession(next);
  }

  private handleRetry() {
    if (!this.session) {
      return;
    }
    this.startSession(this.session.levelId);
  }

  private handleMenu() {
    this.spawnMainMenu();
  }

  private spawnDebugPanel() {
    if (!this.session) {
      return;
    }
    const node = new Node('DebugPanel');
    node.addComponent(DebugPanel).bind(this.session);
    this.node.addChild(node);
  }

  private spawnTutorialPanel(session: GameSession) {
    const scene = director.getScene();
    const uiRoot = scene?.getChildByName('Canvas')?.getChildByName('UIRoot');
    if (!uiRoot) {
      return;
    }

    const node = new Node('TutorialPanel');
    const panel = node.addComponent(TutorialPanel);
    panel.bind(session);
    uiRoot.addChild(node);
  }

  private spawnGameWorld(session: GameSession) {
    const scene = director.getScene();
    if (!scene) {
      return;
    }
    const canvas = scene.getChildByName('Canvas');
    const worldRoot = canvas?.getChildByName('WorldRoot');
    if (!worldRoot) {
      return;
    }
    const node = new Node('GameWorld');
    const world = node.addComponent(GameWorld);
    world.bind(session, () => this.handleNextLevel(), () => this.handleRetry(), () => this.handleMenu());
    worldRoot.addChild(node);
    this.currentView = node;
  }
}
