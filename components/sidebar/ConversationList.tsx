"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { formatTimestamp } from "@/lib/formatTimestamp";
import OnlineDot from "./OnlineDot";

interface Props {
  activeConversationId?: string;
}

export default function ConversationList({ activeConversationId }: Props) {
  const conversations = useQuery(api.conversations.getMyConversations);
  const onlineUsers = useQuery(api.presence.getOnlineUsers);

  if (conversations === undefined) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
            <div className="w-11 h-11 rounded-full bg-[#1a2235] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-[#1a2235] rounded w-3/4" />
              <div className="h-3 bg-[#1a2235] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm font-medium">No conversations yet</p>
        <p className="text-slate-600 text-xs mt-1">Search for a user above to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {conversations.map((conv) => {
        if (!conv) return null;
        const isActive = conv._id === activeConversationId;
        const lastMsg = conv.lastMessage;
        const isGroup = conv.isGroup;
        const other = (conv.otherMembers as any)?.[0];
        const isOnline = !isGroup && onlineUsers?.includes(other?._id);

        return (
          <Link
            key={conv._id}
            href={`/chat/${conv._id}`}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors group
              ${isActive ? "bg-gradient-to-r from-indigo-600 to-indigo-500" : "hover:bg-[#1a2235]"}`}
          >
            <div className="relative flex-shrink-0">
              {isGroup ? (
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              ) : other?.imageUrl ? (
                <div className="relative w-11 h-11">
                  <Image src={other.imageUrl} alt={other.name} fill className="rounded-full object-cover" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-slate-300">
                  {other?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              {!isGroup && <OnlineDot isOnline={!!isOnline} isActive={isActive} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                  {isGroup ? conv.groupName : other?.name ?? "Unknown"}
                </p>
                {lastMsg && (
                  <span className={`text-xs flex-shrink-0 ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                    {formatTimestamp(lastMsg._creationTime)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <p className={`text-xs truncate ${isActive ? "text-indigo-200" : "text-slate-400"}`}>
                  {isGroup
                    ? `${(conv as any).memberCount} members`
                    : lastMsg
                      ? lastMsg.isDeleted ? "This message was deleted" : lastMsg.content
                      : "No messages yet"}
                </p>
                {(conv as any).unreadCount > 0 && !isActive && (
                  <span className="flex-shrink-0 bg-indigo-500 text-white text-xs rounded-full
                    min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                    {(conv as any).unreadCount > 99 ? "99+" : (conv as any).unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
