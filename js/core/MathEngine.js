class MathEngine {
    constructor() {
        // Pas d'état interne nécessaire ici, tout dépend du "streak" (série) passé en paramètre
    }
s
    /**
     * Génère un problème en fonction du niveau de série (streak) du joueur
     * Retourne un objet : { text: "2 + 2", answer: 4 }
     */
    generateProblem(streak) {
        let difficulty = this.getDifficultyStage(streak);
        
        switch (difficulty) {
            case 1:
                return this.randomAddition(1, 20);
            case 2:
                // 50% chance addition moyenne, 50% soustraction simple
                return Math.random() > 0.5 ? this.randomAddition(10, 50) : this.randomSubtraction(1, 20);
            case 3:
                // Mélange addition dure, soustraction moyenne et multiplication
                let rand = Math.random();
                if (rand < 0.33) return this.randomAddition(10, 100)
                if (rand < 0.66) return this.randomSubtraction(10, 50)
                return this.randomMultiplication(1, 20);
            case 4:
                // Le chaos total (inclut la division)
                if (rand < 0.25) return this.randomAddition(10, 100);
                if (rand < 0.5) return this.randomSubtraction(10, 200);
                if (rand < 0.75) return this.randomMultiplication(1, 50);
                return this.randomDivision(1, 20);
            default:
                return this.randomAddition(1, 20);
        }
    }

    getDifficultyStage(streak) {
        if (streak < 10) return 1;
        if (streak < 25) return 2;
        if (streak < 50) return 3;
        return 4;
    }

    // --- Générateurs ---

    randomAddition(min, max) {
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        return { text: `${a} + ${b}`, answer: a + b };
    }

    randomSubtraction(min, max) {
        // On s'assure que le résultat est positif
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        const large = Math.max(a, b);
        const small = Math.min(a, b);
        return { text: `${large} - ${small}`, answer: large - small };
    }

    randomMultiplication(min, max) {
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        return { text: `${a} x ${b}`, answer: a * b };
    }

    randomDivision(min, max) {
        // Astuce : On multiplie d'abord pour avoir une division entière propre
        // Si on veut 12 / 4 = 3, on génère 4 et 3, puis on affiche 12 / 4
        const divisor = this.randInt(min, max); // diviseur
        const result = this.randInt(min, max);  // quotient
        const dividend = divisor * result;
        return { text: `${dividend} / ${divisor}`, answer: result };
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}