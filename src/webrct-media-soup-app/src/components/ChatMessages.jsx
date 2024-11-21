"use client";
import { connectSocket } from "@/utils/socketClient";
import React, { useEffect, useState } from "react";

export default function ChatMessages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = connectSocket();

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("sendMessage", newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: "You", text: newMessage },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-messages mt-4 w-full max-w-md">
      <div className="messages-list bg-gray-200 p-4 rounded h-64 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}: </strong>
            {msg.text}
          </p>
        ))}
      </div>
      <div className="input-group mt-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez un message..."
          className="flex-1 p-2 border border-gray-400 rounded-l"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-r"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
