export class AnimationManager {
  constructor(spriteElement, animationData, frameDuration = 100) {
    this.sprite = spriteElement;
    this.animations = animationData;
    this.frameDuration = frameDuration;
    this.currentAnimationName = null; // Ajout pour savoir quelle anim joue
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.intervalId = null;
  }

  play(animationName) {
    // Évite de relancer la même animation si elle boucle déjà (ex: spammer le bouton WALK)
    if (
      this.currentAnimationName === animationName &&
      ["WALK", "IDLE"].includes(animationName)
    ) {
      return;
    }

    // Si on est mort, on ne fait plus rien (sauf si on veut ressusciter, mais ici on bloque)
    if (
      this.currentAnimationName === "DEATH" &&
      animationName !== "WALK" &&
      animationName !== "IDLE"
    ) {
      return;
    }

    // Arrête l'intervalle précédent
    this.stopInterval();

    this.currentAnimationName = animationName;
    this.currentAnimation = this.animations[animationName];
    this.currentFrameIndex = 0;

    // Affiche tout de suite la première frame
    this.updateFrame();

    // Définit si l'animation doit boucler (WALK/IDLE) ou se jouer une fois
    const isLooping = ["WALK", "IDLE"].includes(animationName);

    // Récupère la durée (spécifique ou par défaut)
    const speed = this.currentAnimation.duration || this.frameDuration;

    this.intervalId = setInterval(() => {
      this.currentFrameIndex++;

      // Vérifie si on est arrivé à la fin de l'animation
      if (this.currentFrameIndex >= this.currentAnimation.frames.length) {
        if (isLooping) {
          // CAS 1 : C'est une boucle (WALK), on repart à 0
          this.currentFrameIndex = 0;
          this.updateFrame();
        } else if (animationName === "DEATH") {
          // CAS 2 : C'est la mort, on arrête tout sur la dernière frame
          this.stopInterval();
          // On laisse currentAnimationName sur DEATH pour bloquer les futures actions
        } else {
          // CAS 3 : C'est une action (ATTACK/HURT), on retourne à la MARCHE
          this.play("WALK");
        }
      } else {
        // Si l'animation n'est pas finie, on met à jour l'image suivante
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

// --- Configuration et Initialisation ---

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
    duration: 80,
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
  },
  HURT: {
    frames: [
      "assets/Personnage/Chevalier/hurt_0.png",
      "assets/Personnage/Chevalier/hurt_1.png",
      "assets/Personnage/Chevalier/hurt_2.png",
      "assets/Personnage/Chevalier/hurt_3.png",
    ],
  },
  DEATH: {
    frames: [
      "assets/Personnage/Chevalier/death_0.png",
      "assets/Personnage/Chevalier/death_1.png",
      "assets/Personnage/Chevalier/death_2.png",
      "assets/Personnage/Chevalier/death_3.png",
    ],
    duration: 200,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const spriteElement = document.getElementById("player-img"); // Assurez-vous que l'ID correspond à votre HTML

  if (!spriteElement) {
    console.error("L'élément image est introuvable");
    return;
  }

  const manager = new AnimationManager(spriteElement, characterAnimations, 100);

  // --- CHANGEMENT ICI : On lance WALK immédiatement au démarrage ---
  manager.play("WALK");

  // Liaison des boutons
  const animationNames = Object.keys(characterAnimations);
  animationNames.forEach((name) => {
    // On ignore WALK/IDLE dans les boutons si on veut, ou on les laisse pour forcer l'état
    const button = document.getElementById(`btn-${name}`);
    if (button) {
      button.addEventListener("click", () => {
        // Petit fix : si on clique sur WALK alors qu'on marche déjà, play() gère ça au début de la fonction
        manager.play(name);
      });
    }
  });
});
