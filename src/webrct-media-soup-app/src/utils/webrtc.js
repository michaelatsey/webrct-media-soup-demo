//import mediasoupClient from "mediasoup-client";
import { Device } from "mediasoup-client";

export const initializeWebRTC = async (
  socket,
  localVideoRef,
  remoteVideoRef
) => {
  const device = new Device();

  socket.on("routerCapabilities", async (routerRtpCapabilities) => {
    await device.load({ routerRtpCapabilities });
    console.log(
      "MediaSoup device loaded with capabilities:",
      routerRtpCapabilities
    );

    // const stream = await navigator.mediaDevices.getUserMedia({
    //   video: true,
    //   audio: true,
    // });
    // localVideoRef.current.srcObject = stream;

    // Logique pour envoyer et recevoir des flux vidéo/audio
  });
};
