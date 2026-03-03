export class GameLoop {
  private lastTime = 0;
  private accumulator = 0;
  private fixedStep: number;
  private running = false;
  private animationId = 0;
  private updateFn: ((dt: number) => void) | null = null;
  private renderFn: ((alpha: number) => void) | null = null;

  constructor(tickRate: number = 10) {
    this.fixedStep = 1000 / tickRate;
  }

  setTickRate(tickRate: number) {
    this.fixedStep = 1000 / tickRate;
  }

  onUpdate(fn: (dt: number) => void) { this.updateFn = fn; }
  onRender(fn: (alpha: number) => void) { this.renderFn = fn; }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  isRunning() { return this.running; }

  private loop = (time: number) => {
    if (!this.running) return;

    const frameTime = Math.min(time - this.lastTime, 250);
    this.lastTime = time;
    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedStep) {
      this.updateFn?.(this.fixedStep / 1000);
      this.accumulator -= this.fixedStep;
    }

    const alpha = this.accumulator / this.fixedStep;
    this.renderFn?.(alpha);

    this.animationId = requestAnimationFrame(this.loop);
  };
}
