import { GameEngine } from "./core/GameEngine.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- UI LOGIC ---
  const settingsBtn = document.getElementById("settings-btn");
  const closeSettingsBtn = document.getElementById("close-settings");
  const settingsModal = document.getElementById("settings-modal");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  if (settingsBtn) {
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

  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    themeToggleBtn.textContent = "🌙 Nuit";
  }

  themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    themeToggleBtn.textContent = isDark ? "🌙 Nuit" : "☀️ Jour";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // --- JEU ---
  const game = new GameEngine();

  const btnSolo = document.getElementById("btn-solo");
  const btnCampaign = document.getElementById("btn-campaign");
  const btnStats = document.getElementById("btn-stats"); // NOUVEAU
  const btnMulti = document.getElementById("btn-multi");

  const navButtons = [btnSolo, btnCampaign, btnStats, btnMulti];

  function setActiveButton(activeBtn) {
    navButtons.forEach((btn) => (btn ? btn.classList.remove("active") : null));
    if (activeBtn) activeBtn.classList.add("active");
  }

  if (btnSolo) {
    btnSolo.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveButton(btnSolo);
      game.setMode("SOLO");
    });
  }

  if (btnCampaign) {
    btnCampaign.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveButton(btnCampaign);
      game.setMode("CAMPAGNE");
    });
  }

  // Écouteur pour le bouton stats
  if (btnStats) {
    btnStats.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveButton(btnStats);
      game.setMode("STATS");
    });
  }

  if (btnMulti) {
    btnMulti.addEventListener("click", (e) => {
      e.preventDefault();
      if (!game.authManager.isLoggedIn()) {
        alert("Tu dois être connecté pour jouer en Multi !");
        return;
      }
      setActiveButton(btnMulti);
      game.setMode("MULTI");
    });
  }

  // Init
  game.setMode("SOLO");
});
