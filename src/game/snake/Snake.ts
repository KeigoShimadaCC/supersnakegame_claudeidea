import {
  Direction, CubeFace,
  DIRECTION_VECTORS, OPPOSITE_DIRECTION, ADJACENT_FACES,
} from '../core/types';
import type { GridCell, SnakeSegment } from '../core/types';

export class Snake {
  segments: SnakeSegment[] = [];
  direction: Direction = Direction.Right;
  private nextDirection: Direction = Direction.Right;
  private gridSize: number;
  private growPending = 0;
  currentFace: CubeFace = CubeFace.Front;
  alive = true;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  init(startPos: GridCell, length: number, face: CubeFace = CubeFace.Front) {
    this.segments = [];
    this.currentFace = face;
    this.direction = Direction.Right;
    this.nextDirection = Direction.Right;
    this.alive = true;
    this.growPending = 0;

    for (let i = 0; i < length; i++) {
      this.segments.push({
        pos: { x: startPos.x - i, y: startPos.y },
        face,
      });
    }
  }

  setDirection(dir: Direction) {
    if (OPPOSITE_DIRECTION[dir] !== this.direction) {
      this.nextDirection = dir;
    }
  }

  grow(amount: number = 1) {
    this.growPending += amount;
  }

  getHead(): SnakeSegment {
    return this.segments[0];
  }

  update(): { crossedEdge: boolean; newFace?: CubeFace } {
    if (!this.alive) return { crossedEdge: false };

    this.direction = this.nextDirection;
    const vec = DIRECTION_VECTORS[this.direction];
    const head = this.segments[0];

    let newX = head.pos.x + vec.x;
    let newY = head.pos.y + vec.y;
    let newFace = head.face;
    let crossedEdge = false;

    if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
      if (this.currentFace !== CubeFace.Front || this.gridSize === 0) {
        const adjFace = ADJACENT_FACES[head.face]?.[this.direction];
        if (adjFace !== undefined) {
          const mapped = this.mapPositionToAdjacentFace(
            newX, newY, this.direction
          );
          newX = mapped.x;
          newY = mapped.y;
          newFace = adjFace;
          crossedEdge = true;
          this.currentFace = adjFace;
        } else {
          this.alive = false;
          return { crossedEdge: false };
        }
      } else {
        this.alive = false;
        return { crossedEdge: false };
      }
    }

    const newHead: SnakeSegment = { pos: { x: newX, y: newY }, face: newFace };
    this.segments.unshift(newHead);

    if (this.growPending > 0) {
      this.growPending--;
    } else {
      this.segments.pop();
    }

    return { crossedEdge, newFace: crossedEdge ? newFace : undefined };
  }

  checkSelfCollision(): boolean {
    const head = this.segments[0];
    for (let i = 1; i < this.segments.length; i++) {
      const seg = this.segments[i];
      if (seg.pos.x === head.pos.x && seg.pos.y === head.pos.y && seg.face === head.face) {
        return true;
      }
    }
    return false;
  }

  occupiesCell(x: number, y: number, face: CubeFace): boolean {
    return this.segments.some(s => s.pos.x === x && s.pos.y === y && s.face === face);
  }

  private mapPositionToAdjacentFace(
    _x: number, y: number,
    dir: Direction
  ): GridCell {
    const gs = this.gridSize;
    switch (dir) {
      case Direction.Right: return { x: 0, y };
      case Direction.Left: return { x: gs - 1, y };
      case Direction.Down: return { x: _x, y: 0 };
      case Direction.Up: return { x: _x, y: gs - 1 };
    }
  }
}
