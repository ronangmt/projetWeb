export class StatsManager {
    constructor(authManager) {
        this.storageKey = "matharena_data_v1";
        this.auth = authManager;
        this.data = this.loadLocalData();
    }

    // Structure des données par défaut
    getDefaultData() {
        return {
            highScores: { SOLO: 0, CAMPAGNE: 0 },
            maxStreak: { SOLO: 0, CAMPAGNE: 0 },
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
            this.saveData();
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
        if (!this.data.highScores) {
            this.data.highScores = { SOLO: 0, CAMPAGNE: 0 };
        }

        if (this.data.highScores[mode] === undefined) {
            this.data.highScores[mode] = 0;
        }

        if (score > this.data.highScores[mode]) {
            this.data.highScores[mode] = score;
            this.saveData();
            return true;
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
        
        const newLevel = 1 + Math.floor(this.data.operations[type].count / 10);
        this.data.operations[type].level = newLevel;
        
        this.saveData();
    }

    getGlobalLevel() {
        const ops = this.data.operations;
        
        const totalSuccess = 
            ops.ADDITION.count + 
            ops.SUBTRACTION.count + 
            ops.MULTIPLICATION.count + 
            ops.DIVISION.count;

        return 1 + Math.floor(totalSuccess / 40);
    }

    getStats() {
        return this.data;
    }
}