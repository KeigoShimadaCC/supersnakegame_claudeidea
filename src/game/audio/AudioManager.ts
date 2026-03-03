export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;

  init() {
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
    } catch {
      console.warn('Audio not available');
    }
  }

  resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.3;
    }
    return this.muted;
  }

  isMuted() { return this.muted; }

  playEat() {
    this.playTone(880, 0.05, 'sine', 0.15);
    this.playTone(1100, 0.05, 'sine', 0.1, 0.05);
  }

  playDeath() {
    this.playTone(300, 0.3, 'sawtooth', 0.2);
    this.playTone(200, 0.3, 'sawtooth', 0.15, 0.15);
    this.playTone(100, 0.5, 'sawtooth', 0.1, 0.3);
  }

  playDimensionFlip() {
    this.playTone(440, 0.1, 'sine', 0.1);
    this.playTone(660, 0.1, 'sine', 0.1, 0.05);
    this.playTone(880, 0.1, 'sine', 0.1, 0.1);
    this.playTone(1320, 0.15, 'sine', 0.08, 0.15);
  }

  playBossDamage() {
    this.playTone(200, 0.1, 'square', 0.2);
    this.playTone(400, 0.1, 'square', 0.15, 0.05);
    this.playTone(600, 0.05, 'sine', 0.1, 0.1);
  }

  playStageComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.15, 'sine', 0.12, i * 0.1);
    });
  }

  playMenuSelect() {
    this.playTone(600, 0.05, 'sine', 0.1);
  }

  playFrameContract() {
    this.playTone(80, 0.3, 'sawtooth', 0.15);
    this.playTone(60, 0.3, 'sawtooth', 0.1, 0.1);
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay: number = 0,
  ) {
    if (!this.audioContext || !this.masterGain || this.muted) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.audioContext.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  dispose() {
    this.audioContext?.close();
  }
}
