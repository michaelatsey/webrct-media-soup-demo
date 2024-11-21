"use client";
import { connectSocket } from "@/utils/socketClient";
import { initializeWebRTC } from "@/utils/webrtc";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function VideoChat() {
  const [socket, setSocket] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const params = useSearchParams();
  const roomId = params.get("roomId");
  console.log("roomId: ", roomId);
  useEffect(() => {
    const socketInstance = connectSocket();
    setSocket(socketInstance);

    initializeWebRTC(socketInstance, localVideoRef, remoteVideoRef);

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  return (
    <div className="video-chat flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Chat Vidéo</h2>
      <video
        ref={localVideoRef}
        id="localVideo"
        autoPlay
        playsInline
        className="w-full max-w-md rounded-lg mb-4 bg-slate-400"
      ></video>
      <video
        id="remoteVideo"
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full max-w-md rounded-lg bg-stone-400"
      ></video>
    </div>
  );
}
