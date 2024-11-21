"use client";
import { connectSocket } from "@/utils/socketClient";
import { initializeWebRTC } from "@/utils/webrtc";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// const socketInstance = io(
//   process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
// );

export default function Room({ roomId }) {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [mediaStream, setMediaStream] = useState(null);
  //const mediaStream = useRef(null); // Stores the user's media stream

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [routerCapabilities, setRouterCapabilities] = useState(null);

  // Access user's media devices
  const startMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      if (error.name === "NotAllowedError") {
        alert(
          "Access to camera or microphone denied. Please grant permissions in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        alert(
          "No camera or microphone found. Please connect them and try again."
        );
      } else if (error.name === "OverConstrainedError") {
        alert(
          "The requested media device constraints could not be satisfied. Please check your settings."
        );
      } else {
        alert("An unknown error occurred. Please try again.");
      }
    }
  }, []);

  const joinRoom = useCallback(async () => {
    if (!username || !roomId) {
      alert("Please enter a username and room ID.");
      return;
    }

    await startMediaStream(); // Start capturing media

    socket.emit("joinRoom", { roomId, username }, (response) => {
      if (response.error) {
        alert(`Error: ${response.error}`);
      } else {
        setIsConnected(true);
        setMessages((prev) => [
          ...prev,
          {
            user: "System",
            message: `Welcome to the room ${roomId}, ${username}!`,
          },
        ]);
      }
    });
  }, [roomId, socket, startMediaStream, username]);

  const sendMessage = useCallback(() => {
    if (newMessage.trim()) {
      socket.emit("sendMessage", { roomId, message: newMessage });
      setMessages((prev) => [...prev, { user: username, message: newMessage }]);
      setNewMessage("");
    }
  }, [newMessage, roomId, socket, username]);

  const leaveRoom = useCallback(() => {
    setIsConnected(false);
    //setRoomId("");
    setMessages([]);
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
    socket.disconnect();
    socket.connect();
  }, [mediaStream, socket]);

  useEffect(() => {
    const socketInstance = connectSocket();
    setSocket(socketInstance);

    initializeWebRTC(socketInstance, localVideoRef, remoteVideoRef);

    socketInstance.on("connect", () =>
      console.log("Connected to server:", socketInstance.id)
    );
    socketInstance.on("disconnect", () =>
      console.log("Disconnected from server")
    );

    socketInstance.on("receiveMessage", ({ user, message }) => {
      setMessages((prevMessages) => [...prevMessages, { user, message }]);
    });

    socketInstance.on("userJoined", ({ userId, username }) => {
      setMessages((prev) => [
        ...prev,
        { user: "System", message: `${username} joined the room.` },
      ]);
    });

    socketInstance.on("userLeft", ({ userId, username }) => {
      setMessages((prev) => [
        ...prev,
        { user: "System", message: `${username} left the room.` },
      ]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [connected]);

  useEffect(() => {
    if (localVideoRef?.current && mediaStream && isConnected) {
      console.log("localVideoRef.current:", localVideoRef);
      localVideoRef.current.srcObject = mediaStream;
    }
  }, [isConnected, localVideoRef, mediaStream]);

  return (
    <div className="flex flex-col items-center p-4">
      {!isConnected ? (
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Join a Room</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border mb-2 rounded"
          />
          {/* <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full p-2 border mb-4 rounded"
          /> */}
          <button
            onClick={joinRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>
          <video
            id="localVideo"
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto border mb-4 rounded bg-slate-400"
          ></video>
          <div className="border p-4 h-64 overflow-y-auto bg-gray-100 rounded mb-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.user}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow p-2 border rounded"
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
          <button
            onClick={leaveRoom}
            className="bg-red-500 text-white px-4 py-2 rounded w-full mt-4"
          >
            Leave Room
          </button>
        </div>
      )}
    </div>
  );
}
