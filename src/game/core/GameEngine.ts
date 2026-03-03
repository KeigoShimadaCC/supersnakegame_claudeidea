import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import {
  GameState, Direction, CubeFace, FoodType,
  DIRECTION_VECTORS,
} from './types';
import type { FoodItem, Wall, StageConfig, GridCell } from './types';
import { Snake } from '../snake/Snake';
import { STAGE_CONFIGS } from '../stages/stageConfigs';

export interface GameStatus {
  state: GameState;
  score: number;
  stageId: number;
  world: number;
  snakeLength: number;
  activeFace: CubeFace;
  bossHealth?: number;
  bossMaxHealth?: number;
  frameContractionLevel?: number;
  targetScore: number;
  highScore: number;
}

export type GameEventListener = (event: string, data?: unknown) => void;

export class GameEngine {
  private loop: GameLoop;
  private input: InputManager;
  snake: Snake;
  private state: GameState = GameState.Menu;
  private stageConfig: StageConfig | null = null;
  private score = 0;
  private highScore = 0;
  food: FoodItem[] = [];
  walls: Wall[] = [];
  private activeFace: CubeFace = CubeFace.Front;
  private movingWallTimer = 0;
  private speedRampTimer = 0;
  private currentSpeed: number = 6;
  private listeners: GameEventListener[] = [];
  private stageIntroTimer = 0;
  private deathTimer = 0;
  private stageCompleteTimer = 0;
  dimensionEnabled = false;
  cubeRotationQueue: Array<{ direction: 'left' | 'right' | 'up' | 'down' }> = [];

  // Boss state
  bossHealth = 0;
  bossMaxHealth = 0;
  frameWalls: Wall[] = [];
  frameContractionLevel = 0;
  private frameContractionTimer = 0;
  private hingeSegments: Array<{ pos: GridCell; face: CubeFace }> = [];
  private hingeDirection: Direction = Direction.Right;
  private hingeMoveTimer = 0;

  constructor() {
    this.loop = new GameLoop(6);
    this.input = new InputManager();
    this.snake = new Snake(20);

    this.loop.onUpdate(this.update.bind(this));
    this.loop.onRender(this.render.bind(this));
  }

  addEventListener(listener: GameEventListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: GameEventListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private emit(event: string, data?: unknown) {
    this.listeners.forEach(l => l(event, data));
  }

  init(element: HTMLElement) {
    this.input.init(element);
    this.input.onDirection(this.handleDirection.bind(this));
    this.input.onFlip(this.handleFlip.bind(this));
    this.input.onPause(this.handlePause.bind(this));
    this.loadHighScore();
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
  }

  startStage(stageId: number) {
    const config = STAGE_CONFIGS.find(s => s.id === stageId);
    if (!config) return;

    this.stageConfig = config;
    this.score = 0;
    this.currentSpeed = config.initialSpeed;
    this.activeFace = CubeFace.Front;
    this.dimensionEnabled = config.world >= 2;
    this.movingWallTimer = 0;
    this.speedRampTimer = 0;
    this.frameContractionLevel = 0;
    this.frameContractionTimer = 0;
    this.cubeRotationQueue = [];
    this.food = [];
    this.frameWalls = [];
    this.hingeSegments = [];

    this.snake = new Snake(config.gridSize);
    const startX = Math.floor(config.gridSize / 4);
    const startY = Math.floor(config.gridSize / 2);
    this.snake.init({ x: startX, y: startY }, 3, CubeFace.Front);

    this.walls = [...config.walls];

    if (config.isBoss) {
      this.initBoss(config);
    }

    this.loop.setTickRate(this.currentSpeed);
    this.state = GameState.StageIntro;
    this.stageIntroTimer = 2;
    this.emit('stateChange', this.state);
    this.emit('stageStart', config);

    if (!this.loop.isRunning()) {
      this.loop.start();
    }
  }

  private initBoss(config: StageConfig) {
    if (config.bossType === 'frame') {
      this.bossHealth = 30;
      this.bossMaxHealth = 30;
      this.frameContractionLevel = 0;
      this.frameContractionTimer = 0;
      this.updateFrameWalls(config.gridSize);
    } else if (config.bossType === 'hinge') {
      this.bossHealth = 25;
      this.bossMaxHealth = 25;
      this.hingeMoveTimer = 0;
      this.initHingeSnake(config.gridSize);
    }
  }

  private updateFrameWalls(gridSize: number) {
    this.frameWalls = [];
    const level = this.frameContractionLevel;
    for (let i = level; i < gridSize - level; i++) {
      this.frameWalls.push({ pos: { x: i, y: level }, face: CubeFace.Front });
      this.frameWalls.push({ pos: { x: i, y: gridSize - 1 - level }, face: CubeFace.Front });
      if (i > level && i < gridSize - 1 - level) {
        this.frameWalls.push({ pos: { x: level, y: i }, face: CubeFace.Front });
        this.frameWalls.push({ pos: { x: gridSize - 1 - level, y: i }, face: CubeFace.Front });
      }
    }
  }

  private initHingeSnake(gridSize: number) {
    this.hingeSegments = [];
    for (let i = 0; i < 8; i++) {
      this.hingeSegments.push({
        pos: { x: i, y: 0 },
        face: CubeFace.Front,
      });
    }
    this.hingeDirection = Direction.Right;
    this.hingeMoveTimer = 0;
    void gridSize;
  }

  private handleDirection(dir: Direction) {
    if (this.state === GameState.Playing || this.state === GameState.Boss) {
      this.snake.setDirection(dir);
    }
  }

  private handleFlip(direction: 'left' | 'right' | 'up' | 'down') {
    if (!this.dimensionEnabled) return;
    if (this.state !== GameState.Playing && this.state !== GameState.Boss) return;
    this.cubeRotationQueue.push({ direction });
    this.emit('dimensionFlip', direction);
  }

  private handlePause() {
    if (this.state === GameState.Playing || this.state === GameState.Boss) {
      this.state = GameState.Paused;
      this.emit('stateChange', this.state);
    } else if (this.state === GameState.Paused) {
      this.state = this.stageConfig?.isBoss ? GameState.Boss : GameState.Playing;
      this.emit('stateChange', this.state);
    }
  }

  private update(dt: number) {
    switch (this.state) {
      case GameState.StageIntro:
        this.stageIntroTimer -= dt;
        if (this.stageIntroTimer <= 0) {
          this.state = this.stageConfig?.isBoss ? GameState.Boss : GameState.Playing;
          this.spawnFood();
          this.emit('stateChange', this.state);
        }
        break;

      case GameState.Playing:
        this.updatePlaying(dt);
        break;

      case GameState.Boss:
        this.updateBoss(dt);
        break;

      case GameState.Death:
        this.deathTimer -= dt;
        if (this.deathTimer <= 0) {
          this.emit('deathComplete');
        }
        break;

      case GameState.StageComplete:
        this.stageCompleteTimer -= dt;
        if (this.stageCompleteTimer <= 0) {
          this.emit('stageCompleteFinished');
          const nextStageId = (this.stageConfig?.id ?? 0) + 1;
          const nextConfig = STAGE_CONFIGS.find(s => s.id === nextStageId);
          if (nextConfig && nextConfig.world !== this.stageConfig?.world) {
            this.state = GameState.WorldComplete;
            this.emit('stateChange', this.state);
          }
        }
        break;
    }
  }

  private updatePlaying(_dt: number) {
    if (!this.stageConfig) return;

    if (this.stageConfig.movingWalls) {
      this.updateMovingWalls();
    }

    if (this.stageConfig.speedRamps) {
      this.speedRampTimer += _dt;
      if (this.speedRampTimer > 5) {
        this.speedRampTimer = 0;
        this.currentSpeed = Math.min(this.currentSpeed + 0.5, 15);
        this.loop.setTickRate(this.currentSpeed);
      }
    }

    this.updateFoodTimers();

    const result = this.snake.update();
    if (!this.snake.alive) {
      this.die();
      return;
    }

    if (result.crossedEdge && result.newFace !== undefined) {
      this.activeFace = result.newFace;
      this.emit('faceChange', this.activeFace);
    }

    if (this.snake.checkSelfCollision()) {
      this.die();
      return;
    }

    this.checkWallCollision();
    if (!this.snake.alive) {
      this.die();
      return;
    }

    this.checkFoodCollision();

    if (this.score >= this.stageConfig.targetScore) {
      this.completeStage();
    }

    if (this.food.length === 0) {
      this.spawnFood();
    }
  }

  private updateBoss(_dt: number) {
    if (!this.stageConfig) return;

    if (this.stageConfig.bossType === 'frame') {
      this.updateFrameBoss(_dt);
    } else if (this.stageConfig.bossType === 'hinge') {
      this.updateHingeBoss(_dt);
    }

    const result = this.snake.update();
    if (!this.snake.alive) {
      this.die();
      return;
    }

    if (result.crossedEdge && result.newFace !== undefined) {
      this.activeFace = result.newFace;
    }

    if (this.snake.checkSelfCollision()) {
      this.die();
      return;
    }

    this.checkFrameWallCollision();
    this.checkWallCollision();
    if (!this.snake.alive) {
      this.die();
      return;
    }

    this.checkFoodCollision();
    this.checkHingeCollision();

    if (this.bossHealth <= 0) {
      this.completeStage();
    }

    if (this.food.length === 0) {
      this.spawnFood();
    }
  }

  private updateFrameBoss(dt: number) {
    if (!this.stageConfig) return;

    this.frameContractionTimer += dt;
    if (this.frameContractionTimer > 4) {
      this.frameContractionTimer = 0;
      const maxLevel = Math.floor(this.stageConfig.gridSize / 2) - 3;
      if (this.frameContractionLevel < maxLevel) {
        this.frameContractionLevel++;
        this.updateFrameWalls(this.stageConfig.gridSize);
        this.emit('frameContract', this.frameContractionLevel);
        this.emit('screenShake', 0.3);
      }
    }
  }

  private updateHingeBoss(dt: number) {
    if (!this.stageConfig) return;

    this.hingeMoveTimer += dt;
    if (this.hingeMoveTimer > 0.3) {
      this.hingeMoveTimer = 0;
      this.moveHingeSnake();
    }
  }

  private moveHingeSnake() {
    if (this.hingeSegments.length === 0 || !this.stageConfig) return;
    const gs = this.stageConfig.gridSize;
    const head = this.hingeSegments[0];
    const vec = DIRECTION_VECTORS[this.hingeDirection];
    let nx = head.pos.x + vec.x;
    let ny = head.pos.y + vec.y;

    if (nx < 0 || nx >= gs || ny < 0 || ny >= gs) {
      const dirs = [Direction.Right, Direction.Down, Direction.Left, Direction.Up];
      const currentIdx = dirs.indexOf(this.hingeDirection);
      this.hingeDirection = dirs[(currentIdx + 1) % 4];
      const newVec = DIRECTION_VECTORS[this.hingeDirection];
      nx = head.pos.x + newVec.x;
      ny = head.pos.y + newVec.y;
    }

    this.hingeSegments.unshift({ pos: { x: nx, y: ny }, face: head.face });
    this.hingeSegments.pop();
  }

  private checkHingeCollision() {
    if (this.hingeSegments.length === 0) return;
    const head = this.snake.getHead();

    const tail = this.hingeSegments[this.hingeSegments.length - 1];
    if (tail && head.pos.x === tail.pos.x && head.pos.y === tail.pos.y && head.face === tail.face) {
      this.bossHealth -= 5;
      this.emit('bossDamage', this.bossHealth);
      this.emit('screenShake', 0.5);
      this.hingeSegments.pop();
    }

    for (let i = 0; i < this.hingeSegments.length - 1; i++) {
      const seg = this.hingeSegments[i];
      if (head.pos.x === seg.pos.x && head.pos.y === seg.pos.y && head.face === seg.face) {
        this.die();
        return;
      }
    }
  }

  private updateMovingWalls() {
    if (!this.stageConfig) return;
    this.movingWallTimer++;
    if (this.movingWallTimer % 3 !== 0) return;

    const gs = this.stageConfig.gridSize;
    for (const wall of this.walls) {
      if (!wall.isMoving || !wall.moveDir) continue;
      const vec = DIRECTION_VECTORS[wall.moveDir];
      wall.pos.x += vec.x;
      wall.pos.y += vec.y;

      if (wall.pos.x <= 0 || wall.pos.x >= gs - 1 || wall.pos.y <= 0 || wall.pos.y >= gs - 1) {
        if (wall.moveDir === Direction.Up) wall.moveDir = Direction.Down;
        else if (wall.moveDir === Direction.Down) wall.moveDir = Direction.Up;
        else if (wall.moveDir === Direction.Left) wall.moveDir = Direction.Right;
        else if (wall.moveDir === Direction.Right) wall.moveDir = Direction.Left;
      }
    }
  }

  private updateFoodTimers() {
    const now = performance.now();
    this.food = this.food.filter(f => {
      if (f.type === FoodType.TimeLimited && f.spawnTime && f.timeLimit) {
        return (now - f.spawnTime) < f.timeLimit;
      }
      return true;
    });
  }

  private checkWallCollision() {
    const head = this.snake.getHead();
    const allWalls = [...this.walls];

    for (const wall of allWalls) {
      if (wall.pos.x === head.pos.x && wall.pos.y === head.pos.y && wall.face === head.face) {
        this.snake.alive = false;
        return;
      }
    }
  }

  private checkFrameWallCollision() {
    const head = this.snake.getHead();
    for (const wall of this.frameWalls) {
      if (wall.pos.x === head.pos.x && wall.pos.y === head.pos.y && wall.face === head.face) {
        this.snake.alive = false;
        return;
      }
    }
  }

  private checkFoodCollision() {
    const head = this.snake.getHead();
    const eatenIndex = this.food.findIndex(
      f => f.pos.x === head.pos.x && f.pos.y === head.pos.y && f.face === head.face
    );

    if (eatenIndex >= 0) {
      const eaten = this.food[eatenIndex];
      this.food.splice(eatenIndex, 1);
      this.snake.grow(1);
      this.score++;

      if (eaten.type === FoodType.Speed) {
        this.currentSpeed = Math.min(this.currentSpeed + 1, 15);
        this.loop.setTickRate(this.currentSpeed);
      }

      if (this.stageConfig?.isBoss && this.stageConfig.bossType === 'frame') {
        this.bossHealth--;
      }

      this.emit('eat', eaten);
      this.emit('scoreChange', this.score);

      if (this.currentSpeed < 12 && this.score % 5 === 0) {
        this.currentSpeed += 0.3;
        this.loop.setTickRate(this.currentSpeed);
      }
    }
  }

  spawnFood() {
    if (!this.stageConfig) return;
    const gs = this.stageConfig.gridSize;
    let attempts = 0;
    const maxAttempts = 100;

    while (this.food.length < 3 && attempts < maxAttempts) {
      attempts++;
      const face = this.dimensionEnabled && Math.random() > 0.5
        ? [CubeFace.Front, CubeFace.Right, CubeFace.Left, CubeFace.Top][Math.floor(Math.random() * 4)]
        : this.activeFace;

      const x = Math.floor(Math.random() * (gs - 2)) + 1;
      const y = Math.floor(Math.random() * (gs - 2)) + 1;

      if (this.snake.occupiesCell(x, y, face)) continue;
      if (this.walls.some(w => w.pos.x === x && w.pos.y === y && w.face === face)) continue;
      if (this.frameWalls.some(w => w.pos.x === x && w.pos.y === y && w.face === face)) continue;

      let foodType: FoodType = FoodType.Normal;
      if (this.stageConfig.timeLimitedFood && Math.random() > 0.5) {
        foodType = FoodType.TimeLimited;
      } else if (this.stageConfig.dimensionalFood && Math.random() > 0.5) {
        foodType = FoodType.Dimensional;
      }

      const item: FoodItem = {
        pos: { x, y },
        face,
        type: foodType,
        spawnTime: performance.now(),
        timeLimit: foodType === FoodType.TimeLimited ? 8000 : undefined,
        dimensionalFaces: foodType === FoodType.Dimensional
          ? [face]
          : undefined,
      };

      this.food.push(item);
    }
  }

  private die() {
    this.snake.alive = false;
    this.state = GameState.Death;
    this.deathTimer = 1.5;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    this.emit('death');
    this.emit('stateChange', this.state);
    this.emit('screenShake', 0.6);
  }

  private completeStage() {
    this.state = GameState.StageComplete;
    this.stageCompleteTimer = 2;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    this.emit('stageComplete');
    this.emit('stateChange', this.state);
  }

  private render(_alpha: number) {
    this.emit('render', { alpha: _alpha, state: this.getStatus() });
  }

  getStatus(): GameStatus {
    return {
      state: this.state,
      score: this.score,
      stageId: this.stageConfig?.id ?? 0,
      world: this.stageConfig?.world ?? 0,
      snakeLength: this.snake.segments.length,
      activeFace: this.activeFace,
      bossHealth: this.bossHealth,
      bossMaxHealth: this.bossMaxHealth,
      frameContractionLevel: this.frameContractionLevel,
      targetScore: this.stageConfig?.targetScore ?? 0,
      highScore: this.highScore,
    };
  }

  getStageConfig() { return this.stageConfig; }
  getState() { return this.state; }

  setState(state: GameState) {
    this.state = state;
    this.emit('stateChange', this.state);
  }

  getActiveFace() { return this.activeFace; }

  setActiveFace(face: CubeFace) {
    this.activeFace = face;
    this.snake.currentFace = face;
  }

  getAllWalls(): Wall[] {
    return [...this.walls, ...this.frameWalls];
  }

  getHingeSegments() {
    return this.hingeSegments;
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('supersnake_highscore');
      if (saved) this.highScore = parseInt(saved, 10);
    } catch { /* ignore */ }
  }

  private saveHighScore() {
    try {
      localStorage.setItem('supersnake_highscore', this.highScore.toString());
    } catch { /* ignore */ }
  }

  retryStage() {
    if (this.stageConfig) {
      this.startStage(this.stageConfig.id);
    }
  }

  isLoopRunning() {
    return this.loop.isRunning();
  }
}
