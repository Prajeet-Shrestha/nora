import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface levelStat {
  level: number;
  xp: number;
  baseXp: number;
  emotion: 'sad' | 'happy' | 'normal';
}

@Injectable({
  providedIn: 'root',
})
export class LevelingService {
  initial_ai: levelStat = {
    level: 1,
    xp: 0,
    baseXp: 50,
    emotion: 'normal',
  };
  private ai = new BehaviorSubject<object>({
    level: 1,
    xp: 0,
    baseXp: 50,
    emotion: 'normal',
  });
  current_ai: levelStat;
  publicCurrentAI = this.ai.asObservable();
  constructor() {
    this.___init___();
  }

  ___init___() {
    let ai_local = JSON.parse(localStorage.getItem('ai'));
    if (ai_local !== null) {
      this.current_ai = ai_local;
    } else {
      localStorage.setItem('ai', JSON.stringify(this.initial_ai));
      this.current_ai = this.initial_ai;
    }
    console.log(this.current_ai);

    this.updateAIStats(this.current_ai);
  }

  updateAIStats(stats: levelStat) {
    stats.baseXp = this.nextLevelXp(stats.level);
    this.ai.next(stats);
    localStorage.removeItem('ai');
    localStorage.setItem('ai', JSON.stringify(stats));
  }

  private nextLevelXp(level) {
    let exponent = 1.5;
    let baseXP = 100;
    return Math.floor(baseXP * (level ^ exponent));
  }

  addXp(xp) {
    let ai_local: levelStat = JSON.parse(localStorage.getItem('ai'));
    ai_local.xp += xp;
    if (ai_local.xp >= ai_local.baseXp) {
      ai_local.level += 1;
    }
    ai_local.emotion = 'happy';
    this.updateAIStats(ai_local);
  }
}
