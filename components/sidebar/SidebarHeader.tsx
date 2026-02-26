"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import CreateGroupModal from "./CreateGroupModal";

export default function SidebarHeader() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showGroupModal, setShowGroupModal] = useState(false);

  return (
    <>
      <div className="px-4 py-4 gradient-mesh border-b border-[#1e2d45] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {user?.imageUrl ? (
              <div className="relative w-10 h-10 ring-2 ring-indigo-500/30 rounded-full">
                <Image src={user.imageUrl} alt={user.fullName ?? ""} fill
                  className="rounded-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {user?.firstName?.[0] ?? "?"}
              </div>
            )}
            <span className="online-pulse absolute bottom-0 right-0 w-3 h-3 bg-green-500
              rounded-full border-2 border-[#111827]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f0f4ff] leading-tight">
              {user?.fullName ?? user?.username ?? "You"}
            </p>
            <p className="text-xs text-green-400 font-medium">● Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setShowGroupModal(true)} title="New group chat"
            className="p-2 rounded-xl text-[#8899b4] hover:text-[#f0f4ff] hover:bg-[#1e2a40]
              transition-all duration-150">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={() => signOut()} title="Sign out"
            className="p-2 rounded-xl text-[#8899b4] hover:text-red-400 hover:bg-red-400/10
              transition-all duration-150">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
      {showGroupModal && <CreateGroupModal onClose={() => setShowGroupModal(false)} />}
    </>
  );
}
