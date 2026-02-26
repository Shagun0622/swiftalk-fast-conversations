"use client";

import { useState } from "react";
import UserSync from "@/components/UserSync";
import ConversationList from "./ConversationList";
import UserSearch from "./UserSearch";
import SidebarHeader from "./SidebarHeader";
import { useParams } from "next/navigation";

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();
  const activeConversationId = params?.conversationId as string | undefined;

  return (
    <>
      <UserSync />
      {/* No width/visibility classes here — layout.tsx controls that now */}
      <div className="flex flex-col h-full w-full">
        <SidebarHeader />

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 text-slate-200 placeholder-slate-500
                rounded-lg text-sm border border-slate-700 focus:outline-none focus:border-indigo-500
                transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery ? (
            <UserSearch query={searchQuery} onSelect={() => setSearchQuery("")} />
          ) : (
            <ConversationList activeConversationId={activeConversationId} />
          )}
        </div>
      </div>
    </>
  );
}