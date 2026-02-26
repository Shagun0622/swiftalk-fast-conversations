"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

interface Props { conversation: any; }

export default function ChatHeader({ conversation }: Props) {
  const other = conversation?.otherMembers?.[0];
  const onlineUsers = useQuery(api.presence.getOnlineUsers);
  const isOnline = !conversation?.isGroup && onlineUsers?.includes(other?._id);
  const isGroup = conversation?.isGroup;

  return (
    <div className="px-5 py-3.5 border-b border-[#1e2d45] gradient-mesh flex items-center gap-3 flex-shrink-0">
      <Link href="/chat" className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-[#1e2a40] text-[#8899b4] transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="relative flex-shrink-0">
        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
            flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        ) : other?.imageUrl ? (
          <div className="relative w-10 h-10 ring-2 ring-indigo-500/20 rounded-full">
            <Image src={other.imageUrl} alt={other.name} fill className="rounded-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
            flex items-center justify-center font-bold text-white shadow-lg">
            {other?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {!isGroup && isOnline && (
          <span className="online-pulse absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500
            rounded-full border-2 border-[#111827]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-[#f0f4ff] truncate">
          {isGroup ? conversation.groupName : other?.name ?? "Chat"}
        </h2>
        <p className={`text-xs font-medium ${isGroup ? "text-[#8899b4]" : isOnline ? "text-green-400" : "text-[#8899b4]"}`}>
          {isGroup ? `${conversation.memberCount} members` : isOnline ? "Active now" : "Offline"}
        </p>
      </div>
    </div>
  );
}
