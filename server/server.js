require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); // Autorise le jeu à parler au serveur
app.use(express.json()); // Permet de lire les JSON envoyés par le jeu

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- MODÈLE UTILISATEUR (SCHEMA) ---
// On définit à quoi ressemble un joueur dans la base de données
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gameData: { type: Object, default: {} } // Pour sauvegarder les stats plus tard
});

const User = mongoose.model('User', userSchema);

// --- ROUTE DE TEST ---
app.get('/', (req, res) => {
    res.send('Le serveur MathArena fonctionne !');
});

// --- ROUTE INSCRIPTION (/register) ---
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Vérifier si le joueur existe déjà
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Ce pseudo est déjà pris." });

        // 2. Crypter le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Créer le joueur
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
});

// --- ROUTE CONNEXION (/login) ---
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Chercher le joueur
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "Utilisateur introuvable." });

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect." });

        // 3. Créer le Token (La carte d'identité temporaire)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token, 
            username: user.username, 
            gameData: user.gameData 
        });

    } catch (err) {
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
});

// --- MIDDLEWARE DE SÉCURITÉ (Vérifie le Token) ---
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Accès refusé" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Token invalide" });
    }
};

// --- ROUTE SAUVEGARDE (/save) ---
app.post('/save', authenticateToken, async (req, res) => {
    try {
        // On met à jour les données du joueur connecté
        // req.user.id vient du Token décodé par le middleware
        await User.findByIdAndUpdate(req.user.id, { 
            gameData: req.body.gameData 
        });

        res.json({ message: "Sauvegarde réussie !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la sauvegarde" });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        // 1. On cherche les utilisateurs
        // 2. On trie par 'gameData.highScores.SOLO' en ordre décroissant (-1)
        // 3. On en prend seulement 10
        // 4. On sélectionne uniquement le pseudo et le score (pas le mot de passe !)
        const topPlayers = await User.find({}, 'username gameData.highScores.SOLO')
            .sort({ 'gameData.highScores.SOLO': -1 })
            .limit(10);

        res.json(topPlayers);
    } catch (err) {
        res.status(500).json({ error: "Erreur récupération leaderboard" });
    }
});

// --- LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));