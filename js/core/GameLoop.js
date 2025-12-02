class GameLoop {
    constructor() {
        this.hero = new Hero(100);
        this.mathEngine = new MathEngine();
        this.currentProblem = null;
        this.isGameActive = false;

        this.mode = 'SOLO';

        // Références DOM
        this.ui = {
            problemText: document.getElementById('math-problem'),
            input: document.getElementById('answer-input'),
            form: document.getElementById('game-form'),
            hpBar: document.querySelector('.hp-bar'),
            streakDisplay: document.getElementById('streak-count'),
            heroSprite: document.querySelector('.hero-sprite'),
            shadowSprite: document.querySelector('.shadow-sprite')
        };

        this.ui.input.style.display = 'none';
        //this.ui.problemText.textContent = "Appuie sur Entrée";

        this.updateMessage("Choisis un mode<br>dans le menu haut");

        this.bindEvents();
    }

    updateMessage(htmlContent) {
        // Cette fonction sert à afficher du texte (intro, game over) 
        // à la place des maths sans casser le style
        this.ui.problemText.innerHTML = htmlContent;
        this.ui.problemText.style.fontSize = "1.2rem"; // Texte plus petit pour que ça rentre
        this.ui.problemText.style.color = ""; // On enlève le rouge (si game over avant)
    }

    setMode(newMode) {
        this.mode = newMode;
        console.log("Mode changé pour : " + this.mode);
        
        let message = "";
        if (this.mode === 'SOLO') {
            message = "MODE SOLO<br><span style='font-size:0.8rem'>Pas de soin, Validation manuelle<br>Appuie sur Entrée</span>";
        } else {
            message = "MODE CAMPAGNE<br><span style='font-size:0.8rem'>Soin actif, Auto-validation<br>Appuie sur Entrée</span>";
        }
        
        this.updateMessage(message);
        
        this.isGameActive = false;
        this.ui.input.style.display = 'none';
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive && e.key === 'Enter') {
                this.start();
            }
        });

        this.ui.input.addEventListener('input', (e) => {
            if (this.isGameActive && this.mode === 'CAMPAIGN') {
                const value = parseInt(this.ui.input.value);
                if (value === this.currentProblem.answer) {
                    this.checkAnswer(value);
                }
            }
        });

        this.ui.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.isGameActive) {
                const value = parseInt(this.ui.input.value);
                if (!isNaN(value) && this.ui.input.value !== '') {
                    this.checkAnswer(value);
                }
            }
        });
    }

    start() {
        console.log("Game Loop Started");
        this.isGameActive = true;
        this.hero.reset();
        this.ui.input.style.display = 'block';
        this.ui.problemText.style.fontSize = "2rem";
        this.ui.problemText.style.color = '';
        this.updateStatsUI();
        this.nextTurn();
        setTimeout(() => this.ui.input.focus(), 10);
    }

    nextTurn() {
        if (this.hero.isDead()) {
            this.gameOver();
            return;
        }

        // Génère un nouveau problème basé sur la série actuelle (streak)
        this.currentProblem = this.mathEngine.generateProblem(this.hero.streak);
        
        // Mise à jour affichage
        this.ui.problemText.textContent = `${this.currentProblem.text} = ?`;
        this.ui.input.value = '';
        this.ui.input.focus();
    }

    checkAnswer(playerAnswer) {
        this.hero.totalAttempts++;

        if (playerAnswer === this.currentProblem.answer) {
            // BONNE RÉPONSE
            this.handleSuccess();
        } else {
            // MAUVAISE RÉPONSE
            this.handleFailure();
        }
        
        this.updateStatsUI();
        this.nextTurn();
    }

    handleSuccess() {
        this.hero.streak++;
        this.hero.totalCorrect++;
        
        // SOIN : UNIQUEMENT EN MODE CAMPAGNE
        if (this.mode === 'CAMPAIGN' && this.hero.streak % 10 === 0) {
            this.hero.heal(10);
            this.flashUI('heal'); // Petit bonus visuel vert
        } else {
            this.flashUI('success');
        }
    }

    handleFailure() {
        const damage = 15; // Valeur fixe ou évolutive
        this.hero.takeDamage(damage);
        
        this.hero.streak = 0;
        
        console.log("Faux! PV restants:", this.hero.currentHp);
        this.flashUI('error');
    }

    updateStatsUI() {
        // Mise à jour barre de vie
        const hpPercent = (this.hero.currentHp / this.hero.maxHp) * 100;
        this.ui.hpBar.style.width = `${hpPercent}%`;
        
        // Changement de couleur selon PV
        if (hpPercent < 30) this.ui.hpBar.style.backgroundColor = '#c0392b';
        else this.ui.hpBar.style.backgroundColor = '#e74c3c';

        this.ui.streakDisplay.textContent = this.hero.streak;
        
        // Bonus visuel : Change la couleur si la série est haute
        if (this.hero.streak > 10) {
            this.ui.streakDisplay.style.color = '#e74c3c'; // Rouge feu intense
        } else {
            this.ui.streakDisplay.style.color = '#f39c12'; // Orange normal
        }
    }

    triggerDamageAnimation() {
        const arena = document.getElementById('game-arena');
        arena.classList.remove('damage-effect');
        void arena.offsetWidth; 
        arena.classList.add('damage-effect');
        this.ui.heroSprite.classList.add('hero-hit');
        setTimeout(() => this.ui.heroSprite.classList.remove('hero-hit'), 500);
    }

    flashUI(type) {
        // Ajoute une classe temporaire au corps du site pour un flash visuel
        const color = type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)';
        const originalBg = document.body.style.backgroundColor;
        
        // Note: C'est un effet très basique, on fera mieux avec le CSS plus tard
        document.body.style.boxShadow = `inset 0 0 50px ${color}`;
        setTimeout(() => {
            document.body.style.boxShadow = 'none';
        }, 200);
    }

    gameOver() {
        this.isGameActive = false;
        this.ui.input.style.display = 'none';
        this.ui.input.value = '';
        this.ui.problemText.innerHTML = `
            GAME OVER<br>
            <span style="font-size: 0.8rem; color: var(--text-color);">
                Score final : ${this.hero.totalCorrect}<br>
                Appuie sur Entrée
            </span>
        `;
        
        this.ui.problemText.style.color = '#c0392b'; 
        this.ui.problemText.style.fontSize = "2rem";
    }
}