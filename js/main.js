document.addEventListener('DOMContentLoaded', () => {
    // --- UI LOGIC (Parchemin, Thème) ---
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsModal = document.getElementById('settings-modal');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeToggleBtn.textContent = '🌙 Nuit';
        } else {
            themeToggleBtn.textContent = '☀️ Jour';
        }
    });

    // --- JEU (GAME LOOP) ---
    const game = new GameLoop();
    game.start(); // Lance le jeu dès le chargement pour l'instant
});