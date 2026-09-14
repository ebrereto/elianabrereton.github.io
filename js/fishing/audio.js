export class FishingAudio {
  constructor() { this.context = null; this.muted = true; }
  async unlock() {
    if (this.muted) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      this.context ||= new Audio();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { /* Sound is optional; browser audio restrictions never block play. */ }
  }
  play(kind) {
    if (this.muted || !this.context || this.context.state !== 'running') return;
    const notes = { cast: [280, 190], splash: [180, 120], bite: [660, 880, 660], hook: [440, 560], caught: [523, 659, 784], rare: [523, 659, 784, 1047], escaped: [300, 240] }[kind] || [440];
    notes.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator(), gain = this.context.createGain();
      const start = this.context.currentTime + index * .09;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.045, start + .01); gain.gain.exponentialRampToValueAtTime(.001, start + .18);
      oscillator.connect(gain).connect(this.context.destination); oscillator.start(start); oscillator.stop(start + .2);
    });
  }
  suspend() { this.context?.suspend().catch(() => {}); }
}
