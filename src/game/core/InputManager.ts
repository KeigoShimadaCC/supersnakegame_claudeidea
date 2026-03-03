import { Direction } from './types';

export type InputCallback = (direction: Direction) => void;
export type FlipCallback = (direction: 'left' | 'right' | 'up' | 'down') => void;
export type ActionCallback = () => void;

export class InputManager {
  private directionCallback: InputCallback | null = null;
  private flipCallback: FlipCallback | null = null;
  private pauseCallback: ActionCallback | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private touchCount = 0;
  private initialPinchAngle = 0;
  private isFlipGesture = false;
  private swipeThreshold = 30;
  private element: HTMLElement | null = null;

  init(element: HTMLElement) {
    this.element = element;
    window.addEventListener('keydown', this.handleKeyDown);
    element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.element) {
      this.element.removeEventListener('touchstart', this.handleTouchStart);
      this.element.removeEventListener('touchmove', this.handleTouchMove);
      this.element.removeEventListener('touchend', this.handleTouchEnd);
    }
  }

  onDirection(cb: InputCallback) { this.directionCallback = cb; }
  onFlip(cb: FlipCallback) { this.flipCallback = cb; }
  onPause(cb: ActionCallback) { this.pauseCallback = cb; }

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W':
        e.preventDefault();
        this.directionCallback?.(Direction.Up);
        break;
      case 'ArrowDown': case 's': case 'S':
        e.preventDefault();
        this.directionCallback?.(Direction.Down);
        break;
      case 'ArrowLeft': case 'a': case 'A':
        e.preventDefault();
        this.directionCallback?.(Direction.Left);
        break;
      case 'ArrowRight': case 'd': case 'D':
        e.preventDefault();
        this.directionCallback?.(Direction.Right);
        break;
      case 'q': case 'Q':
        this.flipCallback?.('left');
        break;
      case 'e': case 'E':
        this.flipCallback?.('right');
        break;
      case 'r': case 'R':
        this.flipCallback?.('up');
        break;
      case 'f': case 'F':
        this.flipCallback?.('down');
        break;
      case 'Escape': case 'p': case 'P':
        this.pauseCallback?.();
        break;
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this.touchCount = e.touches.length;

    if (e.touches.length === 2) {
      this.isFlipGesture = true;
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      this.initialPinchAngle = Math.atan2(dy, dx);
    } else if (e.touches.length === 1) {
      this.isFlipGesture = false;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2 && this.isFlipGesture) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const angle = Math.atan2(dy, dx);
      const diff = angle - this.initialPinchAngle;

      if (Math.abs(diff) > 0.4) {
        this.flipCallback?.(diff > 0 ? 'right' : 'left');
        this.initialPinchAngle = angle;
        this.isFlipGesture = false;
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();

    if (this.isFlipGesture || this.touchCount > 1) {
      this.isFlipGesture = false;
      return;
    }

    if (e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;
      const elapsed = Date.now() - this.touchStartTime;

      if (elapsed < 500 && (Math.abs(dx) > this.swipeThreshold || Math.abs(dy) > this.swipeThreshold)) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.directionCallback?.(dx > 0 ? Direction.Right : Direction.Left);
        } else {
          this.directionCallback?.(dy > 0 ? Direction.Down : Direction.Up);
        }
      }
    }
  };
}
