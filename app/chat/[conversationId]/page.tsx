"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations">;
  const markSeen = useMutation(api.conversations.markConversationSeen);

  // Mark as seen when entering
  useEffect(() => {
    if (conversationId) markSeen({ conversationId });
  }, [conversationId, markSeen]);

  const conversation = useQuery(api.conversations.getConversation, { conversationId });

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader conversation={conversation} />
      <MessageList conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
