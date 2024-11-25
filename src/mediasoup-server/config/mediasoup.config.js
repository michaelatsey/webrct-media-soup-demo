// config/mediasoup.config.js
module.exports = {
  worker: {
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
    logLevel: "warn",
    logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
  },
  router: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
    ],
  },
  webRtcTransport: {
    listenIps: [
      {
        ip: "0.0.0.0", // Écoute sur toutes les interfaces réseau
        announcedIp: "192.168.1.150", // Assurez-vous que c'est l'IP du serveur
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    // Forcer l'utilisation de HTTPS
    secure: true,
  },
};
