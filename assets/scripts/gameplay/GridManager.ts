// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import EventManager from "../core/EventManager";
import GridRepository from "./GridRepository";
import TileFactory from "./TileFactory";
import TileMatchManager from "./TileMatchManager";
import TileGravityManager from "./TileGravityManager";
import ReshuffleManager from "./ReshuffleManager";
import PositionService from "../core/PositionService";
import GridAppearAnimator from "../animations/GridAppearAnimator";
import TileActionExecutor from "./TileActionExecutor";
import BoosterManager from "./BoosterManager";
import TileTurnController from "./TileTurnController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GridManager extends cc.Component {
  @property(cc.Prefab) tilePrefab: cc.Prefab = null;
  @property(cc.Integer) gridWidth = 0;
  @property(cc.Integer) gridHeight = 0;
  @property(cc.Integer) tileSize = 0;
  @property(cc.Integer) tileTypesCount = 0;

  private grid: GridRepository | null = null;
  private positionService: PositionService | null = null;
  private factory: TileFactory | null = null;
  private matcher: TileMatchManager | null = null;
  private gravity: TileGravityManager | null = null;
  private reshuffler: ReshuffleManager | null = null;
  private appearAnimator: GridAppearAnimator | null = null;
  private tileActions: TileActionExecutor | null = null;
  private boosterManager: BoosterManager | null = null;
  private interactionService: TileTurnController | null = null;

  protected async start(): Promise<void> {
    this.initServices();
    this.setupListeners();

    await this.createInitialGrid();
    await this.reshuffler.checkAndReshuffle();
  }

  protected onDestroy(): void {
    this.destroyListeners();
  }

  private initServices(): void {
    this.grid = new GridRepository(
      this.gridWidth,
      this.gridHeight,
      this.tileSize,
      this.tileTypesCount
    );
    this.positionService = new PositionService(this.grid);
    this.factory = new TileFactory(
      this.tilePrefab,
      this.node,
      this.positionService,
      this.grid
    );
    this.matcher = new TileMatchManager(this.grid);
    this.gravity = new TileGravityManager();
    this.gravity.init(this.grid, this.factory, this.positionService);
    this.reshuffler = new ReshuffleManager();
    this.reshuffler.init(this.grid, this.factory, this.matcher);
    this.appearAnimator = new GridAppearAnimator();
    this.tileActions = new TileActionExecutor(this.grid, this.positionService);
    this.boosterManager = this.node.addComponent(BoosterManager);
    this.boosterManager.init(this.grid, this.tileActions);

    this.interactionService = new TileTurnController(
      this.grid,
      this.matcher,
      this.tileActions,
      this.gravity,
      this.reshuffler,
      this.boosterManager,
      this.node
    );
  }

  private setupListeners(): void {
    const e = EventManager.getInstance();
    e.on(
      "tile-clicked",
      this.interactionService.onTileClicked,
      this.interactionService
    );
    e.on("game-restart", this.onGameRestart, this);
  }

  private destroyListeners(): void {
    const e = EventManager.getInstance();
    e.off(
      "tile-clicked",
      this.interactionService!.onTileClicked,
      this.interactionService
    );
    e.off("game-restart", this.onGameRestart, this);
  }

  private async createInitialGrid(): Promise<void> {
    this.factory!.populateField(this.grid!);
    await this.appearAnimator!.animateGridAppearance(this.grid!);
  }

  private async onGameRestart(): Promise<void> {
    this.clearGrid();

    this.reshuffler!.reset();
    await this.createInitialGrid();
  }

  private clearGrid(): void {
    if (!this.grid) return;

    this.grid.forEachTile((x, y) => {
      const node = this.grid!.getTileAt(x, y);
      node?.destroy();
      this.grid!.setTileAt(x, y, null);
    });
  }
}
