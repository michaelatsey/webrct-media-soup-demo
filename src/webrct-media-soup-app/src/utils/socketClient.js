import io from "socket.io-client";

export const connectSocket = () => {
  const socket = io(`${process.env.MEDIASOUP_SERVER_URL}`, { secure: true });
  socket.on("connect", () => {
    console.log("Connected to MediaSoup server");
  });
  return socket;
};
