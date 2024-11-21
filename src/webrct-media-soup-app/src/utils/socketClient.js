import io from "socket.io-client";

export const connectSocket = () => {
  const socket = io("http://localhost:3001");
  socket.on("connect", () => {
    console.log("Connected to MediaSoup server");
  });
  return socket;
};

export const socket = io("http://localhost:3001"); // Adresse du serveur
