const express = require("express");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const mediasoup = require("mediasoup");
require("dotenv").config();

const options = {
  key: fs.readFileSync("./certs/key.pem"), // Chemin vers votre clé privée
  cert: fs.readFileSync("./certs/cert.pem"), // Chemin vers votre certificat
};

const app = express();
const server = https.createServer(options, app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permettre toutes les origines pour le moment (à sécuriser en prod)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // Ajoutez cette option si vous utilisez des cookies ou des headers de sécurité
  },
});

// Map pour stocker les salles
const rooms = new Map();

// Chargement de la configuration MediaSoup
const mediasoupConfig = require("./config/mediasoup.config.js");

// Fonction pour créer un worker MediaSoup
async function createWorker() {
  try {
    return await mediasoup.createWorker(mediasoupConfig.worker);
  } catch (error) {
    console.error("Erreur lors de la création du worker :", error);
    throw error;
  }
}

// Fonction pour créer une salle avec un routeur MediaSoup
async function createRoom(roomId) {
  try {
    const worker = await createWorker();
    const router = await worker.createRouter({
      mediaCodecs: mediasoupConfig.router.mediaCodecs,
    });

    // Configuration du transport WebRTC
    const mediasoupTransportConfig = {
      listenIps: [
        {
          ip: "0.0.0.0", // Écoute sur toutes les interfaces réseau
          announcedIp: "192.168.1.150", // IP publique ou locale du serveur
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    };

    const webRtcTransport = await router.createWebRtcTransport(
      mediasoupConfig.webRtcTransport
    );
    console.log(`WebRTC Transport créé pour la room ${roomId}`);

    rooms.set(roomId, { router, peers: new Map() });
    console.log(`Room ${roomId} créée avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de la création de la room ${roomId} :`, error);
    throw error;
  }
}

// Gestion des connexions clients via Socket.IO
io.on("connection", (socket) => {
  console.log("Nouveau client connecté :", socket.id);

  // Rejoindre une salle
  socket.on("joinRoom", async ({ roomId, username }, callback) => {
    try {
      if (!rooms.has(roomId)) {
        await createRoom(roomId);
      }
      const room = rooms.get(roomId);

      // Ajouter le client à la salle
      room.peers.set(socket.id, { username });
      socket.join(roomId);

      console.log(`${username} a rejoint la room ${roomId}.`);

      // Envoyer les capacités du routeur au client
      callback({ routerCapabilities: room.router.rtpCapabilities });

      // Notifier les autres utilisateurs de la salle
      socket.to(roomId).emit("userJoined", { userId: socket.id, username });
    } catch (error) {
      console.error(
        "Erreur lors de la tentative de rejoindre une salle :",
        error
      );
      callback({ error: "Impossible de rejoindre la salle." });
    }
  });

  // Gestion des messages envoyés dans la salle
  socket.on("sendMessage", ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) {
      console.warn(
        `Tentative d'envoi de message à une room inexistante : ${roomId}`
      );
      return;
    }
    const peer = room.peers.get(socket.id);
    if (!peer) {
      console.warn(
        `Utilisateur non trouvé dans la room ${roomId} : ${socket.id}`
      );
      return;
    }

    console.log(`Message de ${peer.username} dans ${roomId} : ${message}`);
    socket.to(roomId).emit("receiveMessage", { user: peer.username, message });
  });

  // Déconnexion du client
  socket.on("disconnect", () => {
    console.log("Client déconnecté :", socket.id);

    for (const [roomId, room] of rooms.entries()) {
      if (room.peers.has(socket.id)) {
        const { username } = room.peers.get(socket.id);

        // Retirer le client de la salle
        room.peers.delete(socket.id);
        console.log(`Utilisateur ${username} retiré de la room ${roomId}.`);

        // Notifier les autres utilisateurs
        socket.to(roomId).emit("userLeft", { userId: socket.id, username });

        // Supprimer la salle si elle est vide
        if (room.peers.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} supprimée car vide.`);
        }
        break;
      }
    }
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 3004;
const HOST = process.env.HOST || "192.168.1.150"; // Votre IP locale
server.listen(PORT, () => {
  console.log(`MediaSoup server running on https://${HOST}:${PORT}`);
});
