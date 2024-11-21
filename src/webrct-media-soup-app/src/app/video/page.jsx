import ChatMessages from "@/components/ChatMessages";
import VideoChat from "@/components/VideoChat";
import React from "react";

export default function VideoPage() {
  return (
    <div className="container mx-auto p-4">
      <VideoChat />
      <ChatMessages />
    </div>
  );
}
