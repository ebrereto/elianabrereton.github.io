import { chooseCatch, rods } from './catches.js';

export class FishingGame {
  constructor(getSave, onChange, random = Math.random) {
    this.getSave = getSave; this.onChange = onChange; this.random = random;
    this.state = 'idle'; this.elapsed = 0; this.marker = 0; this.paused = false;
  }
  transition(state) { this.state = state; this.elapsed = 0; this.onChange(state, this); }
  reset() { this.item = null; this.transition('idle'); }
  action() {
    if (this.paused) return;
    const save = this.getSave();
    if (['idle', 'caught', 'escaped'].includes(this.state)) {
      this.item = chooseCatch(save, this.random);
      this.wait = 2 + this.random() * 3;
      this.transition('casting');
    } else if (this.state === 'bite') {
      const rod = rods.find(rod => rod.id === save.rod) || rods[0];
      this.width = ({ common: .38, uncommon: .31, rare: .24, secret: .20 }[this.item.rarity]) + rod.width;
      this.target = .13 + this.random() * (1 - this.width - .26);
      this.speed = ({ common: .48, uncommon: .55, rare: .63, secret: .68 }[this.item.rarity]) * rod.speed;
      this.marker = 0;
      this.transition('timing');
    } else if (this.state === 'timing') {
      this.success = this.marker >= this.target && this.marker <= this.target + this.width;
      this.transition('reeling');
    }
  }
  update(dt) {
    if (this.paused) return;
    this.elapsed += dt;
    switch (this.state) {
      case 'casting': if (this.elapsed >= .8) this.transition('waiting'); break;
      case 'waiting': if (this.elapsed >= this.wait) this.transition('bite'); break;
      case 'bite': if (this.elapsed >= 3.5) { this.reason = 'bite'; this.transition('escaped'); } break;
      case 'timing': {
        const cycle = (this.elapsed * this.speed) % 2;
        this.marker = cycle <= 1 ? cycle : 2 - cycle;
        break;
      }
      case 'reeling': if (this.elapsed >= .65) { this.reason = 'timing'; this.transition(this.success ? 'caught' : 'escaped'); } break;
    }
  }
}
