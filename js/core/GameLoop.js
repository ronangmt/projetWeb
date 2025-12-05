class GameLoop {
    constructor() {
        // 1. Initialisation des moteurs
        this.hero = new Hero(100);
        this.mathEngine = new MathEngine();
        
        // 2. État du jeu
        this.currentProblem = null;
        this.isGameActive = false;
        this.mode = 'SOLO'; // Par défaut

        // 3. Variables du Timer (Campagne uniquement)
        this.timerInterval = null;
        this.maxTime = 10;
        this.currentTime = 10;

        // 4. Connexion au HTML (DOM)
        this.ui = {
            problemText: document.getElementById('math-problem'),
            input: document.getElementById('answer-input'),
            form: document.getElementById('game-form'),
            
            // Barres de stats
            hpBar: document.querySelector('.hp-bar'),
            timerBar: document.getElementById('timer-bar'),
            streakDisplay: document.getElementById('streak-count'),
            
            // Sprites (Images)
            heroSprite: document.querySelector('.hero-sprite'), // Pour l'anim dégâts
            enemySprite: document.querySelector('.enemy-sprite'),
            
            // Conteneur global (pour secouer l'écran)
            arena: document.getElementById('game-arena')
        };

        // 5. Configuration initiale
        this.ui.input.style.display = 'none'; // On cache l'input au début
        this.updateMessage("Choisis un mode<br>dans le menu haut");
        
        // Lancement des écouteurs d'événements
        this.bindEvents();
    }

    // =========================================================
    // GESTION DES MODES & MESSAGES
    // =========================================================

    setMode(newMode) {
        this.mode = newMode;
        console.log("Mode changé pour : " + this.mode);
        
        // Nettoyage visuel du timer
        this.stopTimer();
        this.ui.timerBar.style.width = '100%';
        this.ui.timerBar.style.backgroundColor = '#3498db'; // Bleu par défaut
        
        let message = "";
        if (this.mode === 'SOLO') {
            message = "MODE SOLO<br><span style='font-size:0.8rem; opacity:0.8'>Pas de soin, Validation manuelle<br>Appuie sur Entrée</span>";
            // On grise la barre de temps en Solo car inutile
            this.ui.timerBar.parentElement.style.opacity = '0.3';
        } else {
            message = "MODE CAMPAGNE<br><span style='font-size:0.8rem; opacity:0.8'>Battez le Bot (Chrono)<br>Auto-validation & Soin actif</span>";
            this.ui.timerBar.parentElement.style.opacity = '1';
        }
        
        this.updateMessage(message);
        
        // On s'assure que le jeu est bien arrêté
        this.isGameActive = false;
        this.ui.input.style.display = 'none';
    }

    updateMessage(htmlContent) {
        // Affiche du texte à la place des maths (Intro, Game Over...)
        this.ui.problemText.innerHTML = htmlContent;
        this.ui.problemText.style.fontSize = "1.2rem";
        this.ui.problemText.style.color = ""; // Reset couleur
    }

    // =========================================================
    // ÉVÉNEMENTS (CLAVIER & SOURIS)
    // =========================================================

    bindEvents() {
        // A. Touche Entrée pour DÉMARRER le jeu
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive && e.key === 'Enter') {
                e.preventDefault();
                this.start();
            }
        });

        // B. Saisie dans l'input (Auto-validation pour CAMPAGNE)
        this.ui.input.addEventListener('input', (e) => {
            if (this.isGameActive && this.mode === 'CAMPAIGN') {
                const value = parseInt(this.ui.input.value);
                // Si la valeur tapée est EXACTEMENT la réponse -> Validation immédiate
                if (value === this.currentProblem.answer) {
                    this.checkAnswer(value);
                }
            }
        });

        // C. Soumission du formulaire (Validation manuelle pour SOLO)
        this.ui.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.isGameActive) {
                const value = parseInt(this.ui.input.value);
                // On vérifie que ce n'est pas vide
                if (!isNaN(value) && this.ui.input.value !== '') {
                    this.checkAnswer(value);
                }
            }
        });
    }

    // =========================================================
    // BOUCLE DE JEU (CORE)
    // =========================================================

    start() {
        this.isGameActive = true;
        this.hero.reset(); // Remet PV et Streak à zéro
        
        // Affichage Interface Jeu
        this.ui.input.style.display = 'block';
        this.ui.problemText.style.fontSize = "2rem"; // Gros texte pour les calculs
        this.ui.problemText.style.color = ''; 
        
        this.updateStatsUI();
        this.nextTurn();
        
        // Focus dans l'input pour taper direct
        setTimeout(() => this.ui.input.focus(), 10);
    }

    nextTurn() {
        // 1. Vérification : Le héros est-il mort ?
        if (this.hero.isDead()) {
            this.gameOver();
            return;
        }

        // 2. Nettoyage du tour précédent
        this.stopTimer();

        // 3. Génération du nouveau problème
        this.currentProblem = this.mathEngine.generateProblem(this.hero.streak);
        this.ui.problemText.textContent = `${this.currentProblem.text} = ?`;
        
        // 4. Reset de l'input
        this.ui.input.value = '';
        this.ui.input.focus();

        // 5. Lancement du Timer (Seulement en Campagne)
        if (this.mode === 'CAMPAIGN') {
            this.startTimer();
        }
    }

    checkAnswer(playerAnswer) {
        // On arrête le timer dès qu'une réponse est donnée
        this.stopTimer();

        this.hero.totalAttempts++;

        if (playerAnswer === this.currentProblem.answer) {
            this.handleSuccess();
        } else {
            this.handleFailure("wrong");
        }
        
        // Mise à jour visuelle et tour suivant
        this.updateStatsUI();
        this.nextTurn();
    }

    // =========================================================
    // LOGIQUE DU TIMER (BOT)
    // =========================================================

    startTimer() {
        // Difficulté progressive : 
        // Niveau 1 (0 streak) = 10 sec
        // Niveau "Expert" = minimum 3 sec
        this.currentTime = Math.max(3, 10 - Math.floor(this.hero.streak / 10)); 
        this.maxTime = this.currentTime; 

        this.updateTimerUI();

        // Démarre le décompte
        this.timerInterval = setInterval(() => {
            this.currentTime -= 0.1; // On enlève 0.1s toutes les 100ms
            this.updateTimerUI();

            if (this.currentTime <= 0) {
                // Temps écoulé !
                this.handleTimeout();
            }
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleTimeout() {
        this.stopTimer();
        // C'est considéré comme une défaite
        this.handleFailure("timeout");
        // On passe à la question suivante
        this.updateStatsUI();
        this.nextTurn();
    }

    updateTimerUI() {
        const percent = (this.currentTime / this.maxTime) * 100;
        this.ui.timerBar.style.width = `${percent}%`;
        
        // Change de couleur : Bleu -> Rouge quand il reste peu de temps
        if (percent < 30) this.ui.timerBar.style.backgroundColor = '#e74c3c';
        else this.ui.timerBar.style.backgroundColor = '#3498db';
    }

    // =========================================================
    // RÉSULTATS (SUCCÈS / ÉCHEC)
    // =========================================================

    handleSuccess() {
        this.hero.streak++;
        this.hero.totalCorrect++;
        
        // Règle du Soin : Seulement en Campagne, tous les 10 kills
        if (this.mode === 'CAMPAIGN' && this.hero.streak % 10 === 0) {
            this.hero.heal(20); // Soigne 20 PV
            this.flashUI('heal');
        } else {
            this.flashUI('success');
        }
    }

    handleFailure(reason) {
        const damage = 15;
        this.hero.takeDamage(damage);
        
        // Punition : Streak retombe à 0
        this.hero.streak = 0; 
        
        this.triggerDamageAnimation();
        this.flashUI('error');
    }

    gameOver() {
        this.stopTimer();
        this.isGameActive = false;
        
        // Masquer l'input
        this.ui.input.style.display = 'none';
        this.ui.input.value = '';
        
        // Message de fin
        this.ui.problemText.innerHTML = `
            GAME OVER<br>
            <span style="font-size: 0.8rem; color: var(--text-color);">
                Score (${this.mode}) : ${this.hero.totalCorrect}<br>
                Appuie sur Entrée
            </span>
        `;
        this.ui.problemText.style.color = '#c0392b'; 
        this.ui.problemText.style.fontSize = "2rem";
    }

    // =========================================================
    // GESTION UI & EFFETS VISUELS
    // =========================================================

    updateStatsUI() {
        // Barre de vie du héros
        const hpPercent = (this.hero.currentHp / this.hero.maxHp) * 100;
        this.ui.hpBar.style.width = `${hpPercent}%`;
        
        // Couleur PV (Rouge foncé si critique)
        if (hpPercent < 30) this.ui.hpBar.style.backgroundColor = '#c0392b';
        else this.ui.hpBar.style.backgroundColor = '#e74c3c';

        // Mise à jour du texte Streak
        this.ui.streakDisplay.textContent = this.hero.streak;
    }

    triggerDamageAnimation() {
        // 1. Secousse de l'écran
        this.ui.arena.classList.remove('damage-effect');
        void this.ui.arena.offsetWidth; // Force le reflow CSS
        this.ui.arena.classList.add('damage-effect');
        
        // 2. Flash rouge sur le héros
        this.ui.heroSprite.classList.add('hero-hit');
        setTimeout(() => this.ui.heroSprite.classList.remove('hero-hit'), 500);
    }

    flashUI(type) {
        let color;
        if (type === 'success') color = 'rgba(46, 204, 113, 0.2)'; // Vert
        else if (type === 'heal') color = 'rgba(46, 255, 113, 0.4)'; // Vert brillant
        else color = 'rgba(231, 76, 60, 0.2)'; // Rouge
        
        document.body.style.boxShadow = `inset 0 0 50px ${color}`;
        setTimeout(() => { document.body.style.boxShadow = 'none'; }, 200);
    }
}