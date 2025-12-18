// MathEngine.js
export class MathEngine {
    constructor() {}

    generateProblem(streak) {
        const difficulty = this.getDifficultyStage(streak);
        const rand = Math.random(); 

        switch (difficulty) {
            case 1: 
                return this.randomAddition(1, 10);
            case 2: 
                return rand < 0.5 
                    ? this.randomAddition(10, 50) 
                    : this.randomSubtraction(1, 20);
            case 3: 
                if (rand < 0.33) return this.randomAddition(20, 100);
                if (rand < 0.66) return this.randomSubtraction(10, 50);
                return this.randomMultiplication(2, 9);
            case 4: 
                if (rand < 0.25) return this.randomAddition(50, 200);
                if (rand < 0.50) return this.randomSubtraction(50, 200);
                if (rand < 0.75) return this.randomMultiplication(3, 12);
                return this.randomDivision(2, 12);
            default:
                return this.randomAddition(1, 10);
        }
    }

    getDifficultyStage(streak) {
        if (streak < 10) return 1;
        if (streak < 20) return 2;
        if (streak < 40) return 3;
        return 4;
    }

    randomAddition(min, max) {
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        return { text: `${a} + ${b}`, answer: a + b };
    }

    randomSubtraction(min, max) {
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        const large = Math.max(a, b);
        const small = Math.min(a, b);
        return { text: `${large} - ${small}`, answer: large - small };
    }

    randomMultiplication(min, max) {
        const a = this.randInt(min, max);
        const b = this.randInt(min, max);
        return { text: `${a} × ${b}`, answer: a * b };
    }

    randomDivision(min, max) {
        const realMin = Math.max(2, min); 
        const divisor = this.randInt(realMin, max);
        const result = this.randInt(min, max);
        const dividend = divisor * result;
        return { text: `${dividend} ÷ ${divisor}`, answer: result };
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}