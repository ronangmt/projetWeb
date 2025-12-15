export class Hero {
  constructor(maxHp = 100) {
    this.maxHp = maxHp;
    this.currentHp = maxHp;
    this.level = 1;
    this.streak = 0; // Nombre de bonnes réponses d'affilée
    this.totalCorrect = 0;
    this.totalAttempts = 0;
  }

  takeDamage(amount) {
    this.currentHp -= amount;
    if (this.currentHp < 0) this.currentHp = 0;
  }

  heal(amount) {
    this.currentHp += amount;
    if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
  }

  isDead() {
    return this.currentHp <= 0;
  }

  reset() {
    this.currentHp = this.maxHp;
    this.streak = 0;
    this.totalCorrect = 0;
    this.totalAttempts = 0;
  }
}
