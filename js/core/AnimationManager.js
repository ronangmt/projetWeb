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
    // 1. Empêche de relancer la même boucle (évite le bégaiement de la marche)
    if (
      this.currentAnimationName === animationName &&
      ["WALK", "IDLE"].includes(animationName)
    ) {
      return;
    }

    // 2. Si on est MORT, on refuse de jouer une autre animation
    // (Sauf si on demande explicitement WALK ou IDLE pour réinitialiser le jeu)
    if (
      this.currentAnimationName === "DEATH" &&
      animationName !== "WALK" &&
      animationName !== "IDLE"
    ) {
      return;
    }

    this.stopInterval();

    this.currentAnimationName = animationName;
    this.currentAnimation = this.animations[animationName];
    this.currentFrameIndex = 0;

    // Affiche la première image tout de suite
    this.updateFrame();

    const isLooping = ["WALK", "IDLE"].includes(animationName);
    const speed = this.currentAnimation.duration || this.frameDuration;

    this.intervalId = setInterval(() => {
      this.currentFrameIndex++;

      // Vérifie si on a dépassé la dernière frame
      if (this.currentFrameIndex >= this.currentAnimation.frames.length) {
        if (isLooping) {
          // BOUCLE (Marche) : On repart à 0
          this.currentFrameIndex = 0;
          this.updateFrame();
        } else if (animationName === "DEATH") {
          // MORT : On reste sur la dernière frame et on arrête le temps
          this.currentFrameIndex--; // On recule d'un cran pour rester sur la dernière image valide
          this.stopInterval();
        } else {
          // ACTION (Attaque/Hurt) : Une fois fini, on retourne marcher
          this.play("WALK");
        }
      } else {
        // Animation normale en cours
        this.updateFrame();
      }
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
