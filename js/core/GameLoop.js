class GameLoop {
    constructor() {
        this.hero = new Hero(100); // 100 PV max
        this.mathEngine = new MathEngine();
        this.currentProblem = null;
        this.isGameActive = false;

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

        this.bindEvents();
    }

    bindEvents() {
        // On écoute la soumission du formulaire (Touche Entrée ou bouton Go sur mobile)
        this.ui.form.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche le rechargement de la page

            if (this.isGameActive) {
                const value = parseInt(this.ui.input.value);
                if (!isNaN(value)) {
                    this.checkAnswer(value);
                }
            }
        });
    }

    start() {
        console.log("Game Loop Started");
        this.isGameActive = true;
        this.hero.reset();
        this.updateStatsUI();
        this.nextTurn();
        this.ui.input.focus();
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
        this.nextTurn(); // On passe tout de suite à la suite (pas de temps mort)
    }

    handleSuccess() {
        this.hero.streak++;
        this.hero.totalCorrect++;
        
        // Animation simple (log pour l'instant)
        console.log("Correct! Streak:", this.hero.streak);
        
        // Petite soin tous les 10 coups ? (Optionnel)
        if (this.hero.streak % 10 === 0) this.hero.heal(10);
        
        this.flashUI('success');
    }

    handleFailure() {
        // Le héros prend des dégâts
        const damage = 15; // Valeur fixe ou évolutive
        this.hero.takeDamage(damage);
        
        // Reset partiel ou total du streak ? 
        // Le prompt dit : "Au bout d'un certain nombre de bonnes réponses..."
        // Si on se trompe, on peut réduire le streak pour baisser la difficulté légèrement
        this.hero.streak = Math.max(0, this.hero.streak - 2); 
        
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
        this.ui.problemText.textContent = "GAME OVER";
        this.ui.problemText.style.color = 'red';
        // Ici on pourra ajouter un écran de récapitulatif
        alert(`Partie terminée !\nScore: ${this.hero.totalCorrect}/${this.hero.totalAttempts}`);
        // Restart rapide
        this.start(); 
    }
}