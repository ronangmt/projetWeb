import { AnimationManager, characterAnimations } from "./AnimationManager.js";
import { Hero } from "../entities/Hero.js";
import { MathEngine } from "./MathEngine.js";
import { StatsManager } from "./StatsManager.js";

export class GameEngine {
    constructor() {
        this.hero = new Hero(100);
        this.mathEngine = new MathEngine();
        this.statsManager = new StatsManager();
        
        this.isGameActive = false;
        this.mode = "SOLO";
        
        this.timerInterval = null;
        this.currentTime = 10;
        this.maxTime = 10;

        this.ui = {
            problemText: document.getElementById("math-problem"),
            input: document.getElementById("answer-input"),
            form: document.getElementById("game-form"),
            hpBar: document.querySelector(".hp-bar"),
            timerBar: document.getElementById("timer-bar"),
            streakDisplay: document.getElementById("streak-count"),
            heroSprite: document.getElementById("player-img"),
            arena: document.getElementById('game-arena'),
            
            // MODIFICATION ICI : On pointe vers les éléments de DROITE
            enemyGameView: document.getElementById("enemy-game-view"),
            statsView: document.getElementById("global-stats-view"),
            
            // Champs de Stats (Inchangés)
            statHighSolo: document.getElementById("stat-high-solo"),
            statHighCampagne: document.getElementById("stat-high-campagne"),
            statMaxStreak: document.getElementById("stat-max-streak"),
            statLvlAdd: document.getElementById("stat-lvl-add"),
            statLvlSub: document.getElementById("stat-lvl-sub"),
            statLvlMul: document.getElementById("stat-lvl-mul"),
            statLvlDiv: document.getElementById("stat-lvl-div"),
        };

        this.animManager = new AnimationManager(this.ui.heroSprite, characterAnimations);
        this.animManager.play("IDLE");
        
        this.bindEvents();
    }

    setMode(newMode) {
        this.stopTimer();
        this.isGameActive = false;
        this.ui.input.style.display = "none";
        this.mode = newMode;

        // MODIFICATION DE LA LOGIQUE D'AFFICHAGE (A DROITE MAINTENANT)
        if (this.mode === "STATS") {
            // On cache l'ennemi et le chrono
            this.ui.enemyGameView.classList.add("hidden");
            // On affiche le panneau de stats
            this.ui.statsView.classList.remove("hidden");
            
            this.refreshStatsView();
            this.updateMessage(`MODE STATISTIQUES<br><small>Tes exploits s'affichent à droite !</small>`);
            return; 
        } else {
            // Mode jeu : On réaffiche l'ennemi et on cache les stats
            this.ui.enemyGameView.classList.remove("hidden");
            this.ui.statsView.classList.add("hidden");
        }
        
        // Configuration UI Jeu standard...
        const isCampaign = this.mode === "CAMPAGNE";
        this.ui.timerBar.parentElement.style.opacity = isCampaign ? "1" : "0.3";
        
        let subMsg = isCampaign 
            ? "Soin actif, Auto-validation & Chrono" 
            : "Pas de soin, Validation manuelle";
            
        let msg = `MODE ${this.mode}<br><small>${subMsg}</small><br><br><strong>Appuyez sur entrée pour commencer</strong>`;
        this.updateMessage(msg);
    }

    refreshStatsView() {
        const data = this.statsManager.getStats();
        
        this.ui.statHighSolo.textContent = data.highScores.SOLO;
        this.ui.statHighCampagne.textContent = data.highScores.CAMPAGNE;
        this.ui.statMaxStreak.textContent = data.maxStreak;
        
        this.ui.statLvlAdd.textContent = data.operations.ADDITION.level;
        this.ui.statLvlSub.textContent = data.operations.SUBTRACTION.level;
        this.ui.statLvlMul.textContent = data.operations.MULTIPLICATION.level;
        this.ui.statLvlDiv.textContent = data.operations.DIVISION.level;
    }

    start() {
        if (this.mode === "STATS") return; 

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
        if (isNaN(val)) return; 

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
        
        this.statsManager.registerCorrectOperation(this.currentProblem.type);
        this.statsManager.updateMaxStreak(this.hero.streak);

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
            this.ui.timerBar.style.width = `${(this.currentTime / this.maxTime) * 100}%`;
            if (this.currentTime <= 0) {
                this.stopTimer();
                this.handleFailure();
                this.updateStatsUI();
                this.nextTurn();
            }
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    triggerDamageAnimation() {
        this.ui.arena.classList.remove('damage-effect');
        void this.ui.arena.offsetWidth; 
        this.ui.arena.classList.add('damage-effect');
    }

    flashUI(type) {
        const color = type === 'error' ? 'rgba(231, 76, 60, 0.4)' : type === 'heal' ? 'rgba(46, 204, 113, 0.4)' : 'rgba(241, 196, 15, 0.2)';
        document.body.style.boxShadow = `inset 0 0 60px ${color}`;
        setTimeout(() => document.body.style.boxShadow = 'none', 200);
    }

    updateStatsUI() {
        const hpPercent = (this.hero.currentHp / this.hero.maxHp) * 100;
        this.ui.hpBar.style.width = `${hpPercent}%`;
        this.ui.streakDisplay.textContent = this.hero.streak;
    }

    updateMessage(html) {
        this.ui.problemText.innerHTML = html;
    }

    gameOver() {
        this.stopTimer();
        this.isGameActive = false;
        this.animManager.play("DEATH");
        this.ui.input.style.display = "none";
        
        const isNewRecord = this.statsManager.updateHighScore(this.mode, this.hero.totalCorrect);
        
        let recordMsg = isNewRecord ? "<br><span style='color: gold;'>NOUVEAU RECORD !</span>" : "";

        this.updateMessage(`GAME OVER<br>Score : ${this.hero.totalCorrect}${recordMsg}<br><br><small>Appuyez sur ENTRÉE pour rejouer</small>`);
    }

    bindEvents() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !this.isGameActive && this.mode !== "STATS") {
                this.start();
            }
        });

        this.ui.form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.isGameActive) {
                const val = parseInt(this.ui.input.value);
                if (!isNaN(val)) this.checkAnswer(val);
            }
        });

        this.ui.input.addEventListener("input", () => {
            if (this.isGameActive && this.mode === "CAMPAGNE") {
                const val = parseInt(this.ui.input.value);
                if (val === this.currentProblem.answer) this.checkAnswer(val);
            }
        });
        
        const resetBtn = document.getElementById("reset-data");
        if(resetBtn) {
            resetBtn.addEventListener("click", () => {
                if(confirm("Effacer toutes les statistiques ?")) {
                    this.statsManager.resetData();
                    if(this.mode === "STATS") this.refreshStatsView();
                    alert("Données effacées.");
                }
            });
        }
    }
}