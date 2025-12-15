// js/main.js
// IMPORT IMPORTANT : On récupère la classe depuis le fichier
import { GameLoop } from "./core/GameLoop.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- UI LOGIC (Parchemin, Thème) ---
  // (Votre code existant, inchangé)
  const settingsBtn = document.getElementById("settings-btn");
  const closeSettingsBtn = document.getElementById("close-settings");
  const settingsModal = document.getElementById("settings-modal");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  if (settingsBtn) {
    // Petite sécurité si jamais le bouton n'existe pas
    settingsBtn.addEventListener("click", () =>
      settingsModal.classList.remove("hidden")
    );
    closeSettingsBtn.addEventListener("click", () =>
      settingsModal.classList.add("hidden")
    );
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) settingsModal.classList.add("hidden");
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      if (body.classList.contains("dark-mode")) {
        themeToggleBtn.textContent = "🌙 Nuit";
      } else {
        themeToggleBtn.textContent = "☀️ Jour";
      }
    });
  }

  // --- JEU (GAME LOOP) ---
  // Maintenant cela fonctionne car GameLoop est importé en haut
  const game = new GameLoop();

  const btnSolo = document.getElementById("btn-solo");
  const btnCampaign = document.getElementById("btn-campaign");

  if (btnSolo && btnCampaign) {
    btnSolo.addEventListener("click", (e) => {
      e.preventDefault();
      // Gestion visuelle de l'onglet actif
      btnSolo.classList.add("active");
      btnCampaign.classList.remove("active");

      // Changement de mode
      game.setMode("SOLO");
    });

    btnCampaign.addEventListener("click", (e) => {
      e.preventDefault();
      // Gestion visuelle de l'onglet actif
      btnCampaign.classList.add("active");
      btnSolo.classList.remove("active");

      // Changement de mode
      game.setMode("CAMPAIGN");
    });
  }

  // Initialisation par défaut
  game.setMode("SOLO");
});
