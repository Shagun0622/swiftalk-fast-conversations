"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Sidebar from "@/components/sidebar/Sidebar";
import { useParams } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const updatePresence = useMutation(api.presence.updatePresence);
  const params = useParams();
  const hasConversation = !!params?.conversationId;  // true when a chat is open

  useEffect(() => {
    updatePresence();
    const interval = setInterval(() => updatePresence(), 10000);
    return () => clearInterval(interval);
  }, [updatePresence]);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* On mobile: show sidebar ONLY when no conversation is open */}
      {/* On desktop: always show sidebar */}
      <div className={`
        w-full md:w-80 flex-shrink-0 border-r border-slate-800 flex flex-col h-full
        ${hasConversation ? "hidden md:flex" : "flex"}
      `}>
        <Sidebar />
      </div>

      {/* On mobile: show chat ONLY when a conversation is open */}
      {/* On desktop: always show chat */}
      <main className={`
        flex-1 flex flex-col min-w-0 h-full
        ${hasConversation ? "flex" : "hidden md:flex"}
      `}>
        {children}
      </main>

    </div>
  );
}