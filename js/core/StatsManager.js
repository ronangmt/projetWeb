export class StatsManager {
    constructor(authManager) { // On reçoit l'authManager
        this.storageKey = "matharena_data_v1";
        this.auth = authManager;
        this.data = this.loadLocalData();
    }

    // Structure des données par défaut
    getDefaultData() {
        return {
            highScores: { SOLO: 0, CAMPAGNE: 0 },
            maxStreak: 0,
            operations: {
                ADDITION: { count: 0, level: 1 },
                SUBTRACTION: { count: 0, level: 1 },
                MULTIPLICATION: { count: 0, level: 1 },
                DIVISION: { count: 0, level: 1 }
            }
        };
    }

    loadLocalData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? { ...this.getDefaultData(), ...JSON.parse(stored) } : this.getDefaultData();
    }

    loadCloudData(cloudData) {
        if (cloudData) {
            this.data = { ...this.getDefaultData(), ...cloudData };
            this.saveData(); // Met à jour le localStorage aussi
        }
    }

    saveData() {
        // 1. Sauvegarde locale (backup)
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        
        // 2. Sauvegarde Cloud (si connecté)
        if (this.auth && this.auth.isLoggedIn()) {
            this.auth.saveCloudData(this.data);
        }
    }

    resetData() {
        this.data = this.getDefaultData();
        this.saveData();
    }

    // --- MÉTODHES DE MISE À JOUR ---

    updateHighScore(mode, score) {
        if (score > this.data.highScores[mode]) {
            this.data.highScores[mode] = score;
            this.saveData();
            return true; // Nouveau record !
        }
        return false;
    }

    updateMaxStreak(streak) {
        if (streak > this.data.maxStreak) {
            this.data.maxStreak = streak;
            this.saveData();
        }
    }

    // Augmente le compteur d'une opération. 
    // Règle : Niveau = 1 + (Nombre de bonnes réponses / 10)
    registerCorrectOperation(type) {
        if (!this.data.operations[type]) return;

        this.data.operations[type].count++;
        
        // Recalcul du niveau
        const newLevel = 1 + Math.floor(this.data.operations[type].count / 10);
        this.data.operations[type].level = newLevel;
        
        this.saveData();
    }

    // --- GETTERS ---
    getStats() {
        return this.data;
    }
}