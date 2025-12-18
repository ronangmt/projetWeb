import { AnimationManager, characterAnimations } from "./AnimationManager.js";
import { Hero } from "../entities/Hero.js";
import { MathEngine } from "./MathEngine.js";

export class GameEngine {
    constructor() {
        this.hero = new Hero(100);
        this.mathEngine = new MathEngine();
        this.isGameActive = false;
        this.mode = "SOLO";
        
        // Variables Timer
        this.timerInterval = null;
        this.currentTime = 10;
        this.maxTime = 10;

        // Récupération du record depuis le stockage local
        this.highScore = localStorage.getItem("matharena_highscore") || 0;

        this.ui = {
            problemText: document.getElementById("math-problem"),
            input: document.getElementById("answer-input"),
            form: document.getElementById("game-form"),
            hpBar: document.querySelector(".hp-bar"),
            timerBar: document.getElementById("timer-bar"),
            streakDisplay: document.getElementById("streak-count"),
            heroSprite: document.getElementById("player-img"),
            arena: document.getElementById('game-arena'),
            highScoreDisplay: document.getElementById("high-score") // Assure-toi d'avoir cet ID dans ton HTML
        };

        this.animManager = new AnimationManager(this.ui.heroSprite, characterAnimations);
        this.animManager.play("IDLE");
        
        this.updateHighScoreUI();
        this.bindEvents();
    }

    setMode(newMode) {
        this.mode = newMode;
        this.stopTimer();
        this.isGameActive = false;
        this.ui.input.style.display = "none";
        
        const isCampaign = this.mode === "CAMPAGNE";
        this.ui.timerBar.parentElement.style.opacity = isCampaign ? "1" : "0.3";
        
        let subMsg = isCampaign 
            ? "Soin actif, Auto-validation & Chrono" 
            : "Pas de soin, Validation manuelle";
            
        let msg = `MODE ${this.mode}<br><small>${subMsg}</small><br><br><strong>Appuyez sur entrée pour commencer</strong>`;
        this.updateMessage(msg);
    }

    start() {
        this.isGameActive = true;
        this.hero.reset();
        this.animManager.play("WALK");
        this.ui.input.style.display = "block";
        this.updateStatsUI();
        this.nextTurn();
    }

    nextTurn() {
        if (this.hero.isDead()) {
            this.gameOver();
            return;
        }
        this.stopTimer();
        this.currentProblem = this.mathEngine.generateProblem(this.hero.streak);
        this.ui.problemText.textContent = `${this.currentProblem.text} = ?`;
        this.ui.input.value = "";
        this.ui.input.focus();

        if (this.mode === "CAMPAGNE") this.startTimer();
    }

    checkAnswer(val) {
        if (isNaN(val)) return; // Sécurité si l'input est vide

        this.stopTimer();
        if (val === this.currentProblem.answer) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
        this.updateStatsUI();
        this.nextTurn();
    }

    handleSuccess() {
        this.hero.streak++;
        this.hero.totalCorrect++;
        
        // Animation d'attaque aléatoire
        const randAtk = Math.floor(Math.random() * 3) + 1;
        this.animManager.play(`ATTACK${randAtk}`);
        
        if (this.mode === "CAMPAGNE" && this.hero.streak % 10 === 0) {
            this.hero.heal(20);
            this.flashUI("heal");
        } else {
            this.flashUI("success");
        }
    }

    handleFailure() {
        this.hero.takeDamage(15);
        this.hero.streak = 0;
        this.animManager.play("HURT");
        this.triggerDamageAnimation();
        this.flashUI("error");
    }

    startTimer() {
        this.currentTime = Math.max(3, 10 - Math.floor(this.hero.streak / 10));
        this.maxTime = this.currentTime;
        
        this.timerInterval = setInterval(() => {
            this.currentTime -= 0.1;
            const percent = (this.currentTime / this.maxTime) * 100;
            this.ui.timerBar.style.width = `${percent}%`;
            
            if (this.currentTime <= 0) {
                this.stopTimer(); // On arrête le chrono actuel
                this.handleFailure(); // Perd de la vie + reset streak + flash rouge
                this.updateStatsUI();
                this.nextTurn(); // On passe au problème suivant
            }
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStatsUI() {
        const hpPercent = (this.hero.currentHp / this.hero.maxHp) * 100;
        this.ui.hpBar.style.width = `${hpPercent}%`;
        this.ui.streakDisplay.textContent = this.hero.streak;
    }

    updateHighScoreUI() {
        if (this.ui.highScoreDisplay) {
            this.ui.highScoreDisplay.textContent = `Record: ${this.highScore}`;
        }
    }

    updateMessage(html) {
        this.ui.problemText.innerHTML = html;
    }

    triggerDamageAnimation() {
        this.ui.arena.classList.remove('damage-effect');
        void this.ui.arena.offsetWidth; 
        this.ui.arena.classList.add('damage-effect');
    }

    flashUI(type) {
        const color = type === 'error' ? 'rgba(231, 76, 60, 0.4)' : 
                      type === 'heal'  ? 'rgba(46, 204, 113, 0.4)' : 
                                         'rgba(241, 196, 15, 0.2)';
        document.body.style.boxShadow = `inset 0 0 60px ${color}`;
        setTimeout(() => document.body.style.boxShadow = 'none', 200);
    }

    gameOver() {
        this.stopTimer();
        this.isGameActive = false;
        this.animManager.play("DEATH");
        this.ui.input.style.display = "none";
        
        // Gestion du record
        let recordMsg = "";
        if (this.hero.totalCorrect > this.highScore) {
            this.highScore = this.hero.totalCorrect;
            localStorage.setItem("matharena_highscore", this.highScore);
            this.updateHighScoreUI();
            recordMsg = "<br><span style='color: gold;'>NOUVEAU RECORD !</span>";
        }

        this.updateMessage(`GAME OVER<br>Score : ${this.hero.totalCorrect}${recordMsg}<br><br><small>Appuyez sur ENTRÉE pour rejouer</small>`);
    }

    bindEvents() {
        // Lancement du jeu
        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !this.isGameActive) {
                this.start();
            }
        });

        // Validation par Entrée (FONCTIONNE DÉSORMAIS DANS LES DEUX MODES)
        this.ui.form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.isGameActive) {
                const val = parseInt(this.ui.input.value);
                // On vérifie seulement si l'utilisateur a tapé quelque chose
                if (!isNaN(val)) {
                    this.checkAnswer(val);
                }
            }
        });

        // Auto-validation spécifique au mode CAMPAGNE
        this.ui.input.addEventListener("input", () => {
            if (this.isGameActive && this.mode === "CAMPAGNE") {
                const val = parseInt(this.ui.input.value);
                if (val === this.currentProblem.answer) {
                    this.checkAnswer(val);
                }
            }
        });
    }
}