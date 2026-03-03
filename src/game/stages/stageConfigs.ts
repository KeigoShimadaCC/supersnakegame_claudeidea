import type { StageConfig, Wall } from '../core/types';
import { CubeFace, Direction } from '../core/types';

function createBorderWalls(gridSize: number, inset: number = 0): Wall[] {
  const walls: Wall[] = [];
  for (let i = inset; i < gridSize - inset; i++) {
    if (i > inset && i < gridSize - inset - 1) continue;
    for (let j = inset; j < gridSize - inset; j++) {
      // Don't actually add border walls for classic mode
    }
  }
  return walls;
}

function createStaticWalls(gridSize: number): Wall[] {
  const walls: Wall[] = [];
  const mid = Math.floor(gridSize / 2);

  for (let i = mid - 3; i <= mid + 3; i++) {
    walls.push({ pos: { x: i, y: mid - 4 }, face: CubeFace.Front });
    walls.push({ pos: { x: i, y: mid + 4 }, face: CubeFace.Front });
  }
  for (let i = mid - 2; i <= mid + 2; i++) {
    walls.push({ pos: { x: mid - 4, y: i }, face: CubeFace.Front });
    walls.push({ pos: { x: mid + 4, y: i }, face: CubeFace.Front });
  }
  return walls;
}

function createMovingWalls(gridSize: number): Wall[] {
  const walls: Wall[] = [];
  const mid = Math.floor(gridSize / 2);

  walls.push({ pos: { x: 3, y: mid }, face: CubeFace.Front, isMoving: true, moveDir: Direction.Down, moveSpeed: 1 });
  walls.push({ pos: { x: gridSize - 4, y: mid }, face: CubeFace.Front, isMoving: true, moveDir: Direction.Up, moveSpeed: 1 });
  walls.push({ pos: { x: mid, y: 3 }, face: CubeFace.Front, isMoving: true, moveDir: Direction.Right, moveSpeed: 1 });
  walls.push({ pos: { x: mid, y: gridSize - 4 }, face: CubeFace.Front, isMoving: true, moveDir: Direction.Left, moveSpeed: 1 });

  for (let i = mid - 2; i <= mid + 2; i++) {
    walls.push({ pos: { x: i, y: mid }, face: CubeFace.Front });
  }

  return walls;
}

export const STAGE_CONFIGS: StageConfig[] = [
  // World 1: FLATLAND
  {
    id: 1,
    world: 1,
    name: 'Genesis',
    gridSize: 20,
    initialSpeed: 6,
    targetScore: 10,
    walls: createBorderWalls(20),
    description: 'The beginning. Learn to move, learn to eat.',
  },
  {
    id: 2,
    world: 1,
    name: 'Corridors',
    gridSize: 20,
    initialSpeed: 7,
    targetScore: 15,
    walls: createStaticWalls(20),
    description: 'Walls appear. Navigate the corridors.',
  },
  {
    id: 3,
    world: 1,
    name: 'Shifting Maze',
    gridSize: 20,
    initialSpeed: 7,
    targetScore: 15,
    walls: createMovingWalls(20),
    movingWalls: true,
    description: 'The walls are alive. They move.',
  },
  {
    id: 4,
    world: 1,
    name: 'Fever',
    gridSize: 20,
    initialSpeed: 8,
    targetScore: 20,
    walls: [],
    speedRamps: true,
    timeLimitedFood: true,
    description: 'Faster. The food won\'t wait.',
  },
  {
    id: 5,
    world: 1,
    name: 'THE FRAME',
    gridSize: 24,
    initialSpeed: 7,
    targetScore: 30,
    walls: [],
    isBoss: true,
    bossType: 'frame',
    description: 'The border comes alive. Eat or be crushed.',
  },
  // World 2: THE UNFOLD
  {
    id: 6,
    world: 2,
    name: 'First Light',
    gridSize: 16,
    initialSpeed: 6,
    targetScore: 8,
    walls: [],
    description: 'You see the cube for the first time. Flip to find food.',
  },
  {
    id: 7,
    world: 2,
    name: 'Dual Paths',
    gridSize: 16,
    initialSpeed: 7,
    targetScore: 12,
    walls: [],
    description: 'Two faces. One solution. Think in 3D.',
  },
  {
    id: 8,
    world: 2,
    name: 'Fading Light',
    gridSize: 16,
    initialSpeed: 7,
    targetScore: 15,
    walls: [],
    timeLimitedFood: true,
    description: 'The food fades fast across dimensions.',
  },
  {
    id: 9,
    world: 2,
    name: 'Hidden Feast',
    gridSize: 16,
    initialSpeed: 8,
    targetScore: 15,
    walls: [],
    dimensionalFood: true,
    description: 'Some food only exists when viewed from the right face.',
  },
  {
    id: 10,
    world: 2,
    name: 'THE HINGE',
    gridSize: 18,
    initialSpeed: 7,
    targetScore: 25,
    walls: [],
    isBoss: true,
    bossType: 'hinge',
    description: 'A serpent rides the edges. Chase it across dimensions.',
  },
];
