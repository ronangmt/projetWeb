export class AnimationManager {
  constructor(spriteElement, animationData, frameDuration = 100) {
    this.sprite = spriteElement;
    this.animations = animationData;
    this.frameDuration = frameDuration;
    this.currentAnimationName = null;
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.intervalId = null;
  }

  play(animationName) {
  if (this.currentAnimationName === animationName && ["WALK", "IDLE"].includes(animationName)) return;
  
  if (this.currentAnimationName === "DEATH" && !["WALK", "IDLE"].includes(animationName)) return;

  this.stopInterval();

  // Sécurité : vérifie si l'animation existe dans tes données
  if (!this.animations[animationName]) {
    console.warn(`L'animation ${animationName} n'existe pas.`);
    return;
  }

  this.currentAnimationName = animationName;
  this.currentAnimation = this.animations[animationName];
  this.currentFrameIndex = 0;
  this.updateFrame();

  const isLooping = ["WALK", "IDLE"].includes(animationName);
  const speed = this.currentAnimation.duration || this.frameDuration;

  this.intervalId = setInterval(() => {
    this.currentFrameIndex++;

    if (this.currentFrameIndex >= this.currentAnimation.frames.length) {
      if (isLooping) {
        this.currentFrameIndex = 0;
      } else if (animationName === "DEATH") {
        this.currentFrameIndex = this.currentAnimation.frames.length - 1;
        this.stopInterval();
        return; // On s'arrête ici
      } else {
        // Fin d'une animation unique (Attaque, Hurt...)
        this.play("IDLE"); // On peut revenir en IDLE ou WALK selon ton choix
        return;
      }
    }
    this.updateFrame();
  }, speed);
}

  updateFrame() {
    if (
      this.currentAnimation &&
      this.currentAnimation.frames[this.currentFrameIndex]
    ) {
      this.sprite.src = this.currentAnimation.frames[this.currentFrameIndex];
    }
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// --- CONFIGURATION ---
// J'ai ajouté "duration" aux attaques pour les ralentir

export const characterAnimations = {
  IDLE: {
    frames: [
      "assets/Personnage/Chevalier/idle_0.png",
      "assets/Personnage/Chevalier/idle_1.png",
      "assets/Personnage/Chevalier/idle_2.png",
      "assets/Personnage/Chevalier/idle_3.png",
      "assets/Personnage/Chevalier/idle_4.png",
      "assets/Personnage/Chevalier/idle_5.png",
    ],
    duration: 150,
  },
  WALK: {
    frames: [
      "assets/Personnage/Chevalier/walk_0.png",
      "assets/Personnage/Chevalier/walk_1.png",
      "assets/Personnage/Chevalier/walk_2.png",
      "assets/Personnage/Chevalier/walk_3.png",
      "assets/Personnage/Chevalier/walk_4.png",
      "assets/Personnage/Chevalier/walk_5.png",
      "assets/Personnage/Chevalier/walk_6.png",
      "assets/Personnage/Chevalier/walk_7.png",
    ],
    duration: 150, // Vitesse de marche (plus haut = plus lent)
  },
  ATTACK1: {
    frames: [
      "assets/Personnage/Chevalier/attack1_0.png",
      "assets/Personnage/Chevalier/attack1_1.png",
      "assets/Personnage/Chevalier/attack1_2.png",
      "assets/Personnage/Chevalier/attack1_3.png",
      "assets/Personnage/Chevalier/attack1_4.png",
      "assets/Personnage/Chevalier/attack1_5.png",
    ],
    duration: 120, // <-- AJOUTÉ : Ralentit l'attaque (120ms par image)
  },
  ATTACK2: {
    frames: [
      "assets/Personnage/Chevalier/attack2_0.png",
      "assets/Personnage/Chevalier/attack2_1.png",
      "assets/Personnage/Chevalier/attack2_2.png",
      "assets/Personnage/Chevalier/attack2_3.png",
      "assets/Personnage/Chevalier/attack2_4.png",
      "assets/Personnage/Chevalier/attack2_5.png",
    ],
    duration: 120, // <-- AJOUTÉ
  },
  ATTACK3: {
    frames: [
      "assets/Personnage/Chevalier/attack3_0.png",
      "assets/Personnage/Chevalier/attack3_1.png",
      "assets/Personnage/Chevalier/attack3_2.png",
      "assets/Personnage/Chevalier/attack3_3.png",
      "assets/Personnage/Chevalier/attack3_4.png",
      "assets/Personnage/Chevalier/attack3_5.png",
      "assets/Personnage/Chevalier/attack3_6.png",
      "assets/Personnage/Chevalier/attack3_7.png",
      "assets/Personnage/Chevalier/attack3_8.png",
    ],
    duration: 100, // <-- AJOUTÉ (Celle-ci a plus de frames, donc un peu plus rapide)
  },
  HURT: {
    frames: [
      "assets/Personnage/Chevalier/hurt_0.png",
      "assets/Personnage/Chevalier/hurt_1.png",
      "assets/Personnage/Chevalier/hurt_2.png",
      "assets/Personnage/Chevalier/hurt_3.png",
    ],
    duration: 150, // On voit bien qu'il a mal
  },
  DEATH: {
    frames: [
      "assets/Personnage/Chevalier/death_0.png",
      "assets/Personnage/Chevalier/death_1.png",
      "assets/Personnage/Chevalier/death_2.png",
      "assets/Personnage/Chevalier/death_3.png",
    ],
    duration: 300, // Ralenti pour bien voir la chute
  },
};
