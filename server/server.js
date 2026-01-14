require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Serveur requis pour Socket.io
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// --- CONNEXION MONGODB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur MongoDB:", err));

// --- MODÈLE UTILISATEUR ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gameData: {
    highScores: { 
        SOLO: { type: Number, default: 0 },
        CAMPAGNE: { type: Number, default: 0 } // Ajout du mode Campagne
    },
    operations: {
        ADDITION: { count: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
        SUBTRACTION: { count: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
        MULTIPLICATION: { count: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
        DIVISION: { count: { type: Number, default: 0 }, level: { type: Number, default: 1 } }
    },
    lastPlayed: { type: Date, default: Date.now },
  },
}, { minimize: false });

const User = mongoose.model("User", userSchema);

// --- ROUTES API ---

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Pseudo déjà pris." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Identifiants incorrects." });
    }

    // FIX : On ajoute le username dans le token pour Socket.io
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, username: user.username, gameData: user.gameData });
  } catch (err) {
    res.status(500).json({ error: "Erreur de connexion." });
  }
});

// --- LOGIQUE MULTIJOUEUR (SOCKET.IO) ---

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Auth error"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username; // Maintenant decoded.username existe !
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`🎮 ${socket.username} connecté`);

  socket.on("joinRoom", (roomID) => {
    socket.join(roomID);
    console.log(`👥 ${socket.username} dans la salle : ${roomID}`);
    // Prévenir les autres
    socket.to(roomID).emit("playerJoined", { username: socket.username });
  });

  // FIX : Relayer le lancement de la partie depuis le lobby
  socket.on("startGame", (roomID) => {
    io.to(roomID).emit("gameStart");
  });

  // Relais des scores et des actions en temps réel
  socket.on("sendScore", (data) => {
    // On extrait roomID et on stocke tout le reste dans l'objet 'rest'
    const { roomID, ...rest } = data;

    // On envoie à l'autre joueur de la salle :
    // 1. Le pseudo de l'expéditeur (récupéré depuis la socket sécurisée)
    // 2. Toutes les autres données (score, action, etc.)
    socket.to(roomID).emit("opponentUpdate", {
      username: socket.username,
      ...rest,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.username} déconnecté`);
  });
});

// --- SAUVEGARDE ET LEADERBOARD ---

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Accès refusé" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ error: "Token invalide" });
  }
};

app.post("/save", authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { gameData: req.body.gameData });
    res.json({ message: "Sauvegarde réussie !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur sauvegarde" });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const topPlayers = await User.find({}, "username gameData.highScores.SOLO")
      .sort({ "gameData.highScores.SOLO": -1 })
      .limit(10);
    res.json(topPlayers);
  } catch (err) {
    res.status(500).json({ error: "Erreur leaderboard" });
  }
});

// --- FIX : LANCEMENT AVEC server.listen ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Serveur MathArena prêt sur le port ${PORT}`)
);
