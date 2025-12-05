class MathEngine {
    constructor() {
        // Pas d'état interne, tout est basé sur le "streak"
    }

    generateProblem(streak) {
        const difficulty = this.getDifficultyStage(streak);
        
        // On génère un nombre aléatoire (0.0 à 1.0) UNE SEULE FOIS ici.
        // Il servira à choisir le type d'opération dans les switch cases.
        const rand = Math.random(); 

        switch (difficulty) {
            case 1: 
                // NIVEAU 1 : Juste des additions simples (1 à 10)
                return this.randomAddition(1, 10);

            case 2: 
                // NIVEAU 2 : Additions moyennes ou Soustractions simples
                // 50% de chance pour chaque
                return rand < 0.5 
                    ? this.randomAddition(10, 50) 
                    : this.randomSubtraction(1, 20);

            case 3: 
                // NIVEAU 3 : On ajoute les Multiplications (Tables 2 à 9)
                if (rand < 0.33) return this.randomAddition(20, 100);
                if (rand < 0.66) return this.randomSubtraction(10, 50);
                return this.randomMultiplication(2, 9);

            case 4: 
                // NIVEAU 4 : Expert (Avec Divisions)
                if (rand < 0.25) return this.randomAddition(50, 200);
                if (rand < 0.50) return this.randomSubtraction(50, 200);
                if (rand < 0.75) return this.randomMultiplication(3, 12);
                return this.randomDivision(2, 12); // Diviseurs entre 2 et 12

            default:
                return this.randomAddition(1, 10);
        }
    }

    getDifficultyStage(streak) {
        if (streak < 10) return 1; // Un peu plus long pour chauffer
        if (streak < 20) return 2;
        if (streak < 40) return 3;
        return 4;
    }

    // --- GÉNÉRATEURS D'OPÉRATIONS ---

    randomAddition(min, max) {
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        return { text: `${a} + ${b}`, answer: a + b };
    }

    randomSubtraction(min, max) {
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        // On s'assure que le résultat est toujours positif
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
        // Astuce : On génère la multiplication inverse pour avoir un compte rond.
        // Exemple : On veut 12 / 4 = 3. On génère 4 et 3.
        
        // On force le diviseur à être au moins 2 (éviter la division par 1 trop facile)
        const realMin = Math.max(2, min); 
        
        const divisor = this.randInt(realMin, max); // Le diviseur
        const result = this.randInt(min, max);      // Le quotient (réponse)
        const dividend = divisor * result;          // Le nombre à diviser
        
        return { text: `${dividend} / ${divisor}`, answer: result };
    }

    // Fonction utilitaire pour générer un entier aléatoire entre min et max (inclus)
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}