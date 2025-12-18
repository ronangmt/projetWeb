export class StatsManager {
    constructor() {
        this.storageKey = "matharena_data_v1";
        this.data = this.loadData();
    }

    // Structure des données par défaut
    getDefaultData() {
        return {
            highScores: {
                SOLO: 0,
                CAMPAGNE: 0
            },
            maxStreak: 0,
            operations: {
                ADDITION: { count: 0, level: 1 },
                SUBTRACTION: { count: 0, level: 1 },
                MULTIPLICATION: { count: 0, level: 1 },
                DIVISION: { count: 0, level: 1 }
            }
        };
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return { ...this.getDefaultData(), ...JSON.parse(stored) };
        }
        return this.getDefaultData();
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
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