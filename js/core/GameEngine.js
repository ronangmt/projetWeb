import { AnimationManager, characterAnimations } from "./AnimationManager.js";
import { Hero } from "../entities/Hero.js";
import { MathEngine } from "./MathEngine.js";
import { StatsManager } from "./StatsManager.js";
import { AuthManager } from "./AuthManager.js"; 

export class GameEngine {
    constructor() {
        this.hero = new Hero(100);
        this.mathEngine = new MathEngine();
        
        this.authManager = new AuthManager(); 
        this.statsManager = new StatsManager(this.authManager);
        
        this.isGameActive = false;
        this.mode = "SOLO";
        
        this.timerInterval = null;
        this.currentTime = 10;
        this.maxTime = 10;

        // Configuration de l'interface (UI)
        this.ui = {
            problemText: document.getElementById("math-problem"),
            input: document.getElementById("answer-input"),
            form: document.getElementById("game-form"),
            hpBar: document.querySelector(".hp-bar"),
            timerBar: document.getElementById("timer-bar"),
            streakDisplay: document.getElementById("streak-count"),
            heroSprite: document.getElementById("player-img"),
            globalLevelDisplay: document.getElementById("global-level"),
            arena: document.getElementById('game-arena'),
            
            // Éléments de la zone de droite
            enemyGameView: document.getElementById("enemy-game-view"),
            statsView: document.getElementById("global-stats-view"),
            statGlobalLevel: document.getElementById("stat-global-level"),
            
            // Champs de statistiques
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
        this.setupAuthUI();
        this.updateIdentityUI();
        this.setupLeaderboard();
    }

    // --- GESTION DE L'INTERFACE DE CONNEXION ---
    setupAuthUI() {
        const loginBtn = document.getElementById('btn-login');
        const authModal = document.getElementById('auth-modal');
        const closeAuthBtn = document.getElementById('close-auth');
        const authForm = document.getElementById('auth-form');
        const toggleLink = document.getElementById('toggle-auth-mode');
        const authTitle = document.getElementById('auth-title');
        const submitBtn = authForm ? authForm.querySelector('button[type="submit"]') : null;
        
        let isLoginMode = true;

        // GESTION DU BOUTON PRINCIPAL (Connexion OU Déconnexion)
        if (loginBtn) {
            loginBtn.onclick = (e) => {
                e.preventDefault();

                // Si on est DÉJÀ connecté, ce bouton sert à se DÉCONNECTER
                if (this.authManager.isLoggedIn()) {
                    if(confirm("Voulez-vous vous déconnecter ?")) {
                        this.authManager.logout(); // Supprime le token et recharge la page
                    }
                    return;
                }

                // Sinon, on ouvre la fenêtre de connexion
                if (authModal) authModal.classList.remove('hidden');
            };
        }

        if (closeAuthBtn) {
            closeAuthBtn.onclick = () => {
                if (authModal) authModal.classList.add('hidden');
            };
        }

        if (toggleLink) {
            toggleLink.onclick = (e) => {
                e.preventDefault();
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    authTitle.textContent = "Connexion";
                    submitBtn.textContent = "Se connecter";
                    toggleLink.textContent = "Pas de compte ? S'inscrire";
                } else {
                    authTitle.textContent = "Inscription";
                    submitBtn.textContent = "S'inscrire";
                    toggleLink.textContent = "Déjà un compte ? Se connecter";
                }
                document.getElementById('auth-message').textContent = "";
            };
        }

        if (authForm) {
            authForm.onsubmit = async (e) => {
                e.preventDefault();
                const usernameInput = document.getElementById('auth-username').value;
                const passwordInput = document.getElementById('auth-password').value;
                const msgBox = document.getElementById('auth-message');

                msgBox.style.color = "blue";
                msgBox.textContent = "Chargement...";

                let result;
                if (isLoginMode) {
                    result = await this.authManager.login(usernameInput, passwordInput);
                } else {
                    result = await this.authManager.register(usernameInput, passwordInput);
                }

                if (result.success) {
                    msgBox.style.color = "green";
                    
                    if (isLoginMode) {
                        msgBox.textContent = "Connecté !";
                        setTimeout(() => {
                            authModal.classList.add('hidden');
                            this.updateIdentityUI(); // <--- MISE À JOUR DE L'INTERFACE ICI
                        }, 1000);
                        if(result.gameData) this.statsManager.loadCloudData(result.gameData);
                    } else {
                        msgBox.textContent = "Compte créé ! Connectez-vous.";
                        setTimeout(() => toggleLink.click(), 1500);
                    }
                } else {
                    msgBox.style.color = "red";
                    msgBox.textContent = result.error || "Erreur";
                }
            };
        }
    }

    setMode(newMode) {
        this.stopTimer();
        this.isGameActive = false;
        this.ui.input.style.display = "none";
        this.mode = newMode;

        if (this.mode === "STATS") {
            this.ui.enemyGameView.classList.add("hidden");
            this.ui.statsView.classList.remove("hidden");
            this.refreshStatsView();
            this.updateMessage(`MODE STATISTIQUES<br><small>Tes exploits s'affichent à droite !</small>`);
            return; 
        } else {
            this.ui.enemyGameView.classList.remove("hidden");
            this.ui.statsView.classList.add("hidden");
        }
        
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

        const globalLevel = this.statsManager.getGlobalLevel();
        if(this.ui.statGlobalLevel) {
            this.ui.statGlobalLevel.textContent = globalLevel;
        }
        
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

        this.updateIdentityUI();
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

    updateIdentityUI() {
        const nameDisplay = document.getElementById('player-name-display');
        const loginBtn = document.getElementById('btn-login');
        const currentGlobalLevel = this.statsManager.getGlobalLevel();

        if (this.ui.globalLevelDisplay) {
            this.ui.globalLevelDisplay.textContent = currentGlobalLevel;
        }

        if (this.authManager.isLoggedIn()) {
            // CAS 1 : L'utilisateur est connecté
            if (nameDisplay) nameDisplay.textContent = this.authManager.username;
            
            if (loginBtn) {
                loginBtn.textContent = "Déconnexion"; // Le bouton change de fonction
                loginBtn.classList.add('logged-in-btn'); // (Optionnel) Pour le styliser différemment
            }
        } else {
            // CAS 2 : L'utilisateur n'est pas connecté
            if (nameDisplay) nameDisplay.textContent = "[Joueur]";
            if (loginBtn) loginBtn.textContent = "Connexion";
        }
    }

    setupLeaderboard() {
        const btn = document.getElementById('btn-leaderboard');
        const modal = document.getElementById('leaderboard-modal');
        const closeBtn = document.getElementById('close-leaderboard');
        const tbody = document.getElementById('leaderboard-body');

        // 1. Ouvrir et charger
        if (btn) {
            btn.onclick = async () => {
                if (modal) modal.classList.remove('hidden');
                
                // Appel au serveur
                try {
                    const res = await fetch('http://localhost:3000/leaderboard');
                    const players = await res.json();
                    
                    // On vide le tableau
                    tbody.innerHTML = '';

                    // On remplit ligne par ligne
                    players.forEach((player, index) => {
                        const rank = index + 1;
                        // On gère le cas où gameData ou highScores n'existe pas encore
                        const score = player.gameData?.highScores?.SOLO || 0;
                        
                        // Classe CSS spéciale pour les 3 premiers
                        const rankClass = rank <= 3 ? `rank-${rank}` : '';
                        const trophy = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

                        const row = `
                            <tr class="${rankClass}">
                                <td>${trophy}</td>
                                <td>${player.username}</td>
                                <td>${score}</td>
                            </tr>
                        `;
                        tbody.innerHTML += row;
                    });

                } catch (e) {
                    tbody.innerHTML = '<tr><td colspan="3" style="color:red">Erreur connexion serveur</td></tr>';
                }
            };
        }

        // 2. Fermer
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.add('hidden');
        }
    }

}