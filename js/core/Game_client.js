// js/game_client.js
const API_URL = "http://localhost/MathArena/api"; // Vérifie que le chemin est bon !

async function api_sauvegarderScore(userId, mode, score) {
    console.log("Envoi du score...", score);
    try {
        const response = await fetch(`${API_URL}/save_score.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_utilisateur: userId,
                mode_jeu: mode,
                score_solo: score
            })
        });
        const result = await response.json();
        console.log("Retour API Score:", result);
    } catch (e) {
        console.error("Erreur API Score:", e);
    }
}

async function api_majNiveau(userId, typeOp, niveau) {
    try {
        const response = await fetch(`${API_URL}/update_level.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_utilisateur: userId,
                type_operation: typeOp, // 'addition', 'soustraction', etc.
                nouveau_niveau: niveau
            })
        });
        const result = await response.json();
        console.log("Retour API Niveau:", result);
    } catch (e) {
        console.error("Erreur API Niveau:", e);
    }
}