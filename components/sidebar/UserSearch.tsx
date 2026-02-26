"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import OnlineDot from "./OnlineDot";

interface Props {
  query: string;
  onSelect: () => void;
}

export default function UserSearch({ query, onSelect }: Props) {
  const users = useQuery(api.users.getAllUsers);
  const onlineUsers = useQuery(api.presence.getOnlineUsers);
  const getOrCreate = useMutation(api.conversations.getOrCreateConversation);
  const router = useRouter();

  const filtered = users?.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = async (userId: Id<"users">) => {
    const convId = await getOrCreate({ otherUserId: userId });
    router.push(`/chat/${convId}`);
    onSelect();
  };

  if (filtered === undefined) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
            <div className="w-11 h-11 rounded-full bg-slate-800" />
            <div className="h-3.5 bg-slate-800 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">No users found</p>
        <p className="text-slate-600 text-xs mt-1">Try a different name</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      <p className="text-xs text-slate-500 px-3 py-2 uppercase tracking-wider font-medium">
        Users ({filtered.length})
      </p>
      {filtered.map((user) => {
        const isOnline = onlineUsers?.includes(user._id);
        return (
          <button
            key={user._id}
            onClick={() => handleSelect(user._id)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left w-full"
          >
            <div className="relative flex-shrink-0">
              {user.imageUrl ? (
                <div className="relative w-11 h-11">
                  <Image src={user.imageUrl} alt={user.name} fill className="rounded-full object-cover" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-slate-300">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <OnlineDot isOnline={!!isOnline} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
