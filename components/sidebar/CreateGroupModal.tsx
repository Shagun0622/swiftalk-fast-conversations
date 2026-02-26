"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  onClose: () => void;
}

export default function CreateGroupModal({ onClose }: Props) {
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Id<"users">[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const users = useQuery(api.users.getAllUsers);
  const createGroup = useMutation(api.conversations.createGroupConversation);
  const router = useRouter();

  const toggleUser = (userId: Id<"users">) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 1) return;
    setIsCreating(true);
    try {
      const convId = await createGroup({ memberIds: selectedIds, groupName: groupName.trim() });
      router.push(`/chat/${convId}`);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-200">New Group Chat</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name..."
            className="w-full px-4 py-2.5 bg-slate-800 text-slate-200 placeholder-slate-500
              rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
          />

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
              Select Members ({selectedIds.length} selected)
            </p>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {users?.map((user) => {
                const isSelected = selectedIds.includes(user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => toggleUser(user._id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left
                      ${isSelected ? "bg-indigo-600/20 border border-indigo-500/50" : "hover:bg-slate-800 border border-transparent"}`}
                  >
                    <div className="relative w-9 h-9 flex-shrink-0">
                      {user.imageUrl ? (
                        <Image src={user.imageUrl} alt={user.name} fill className="rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-300">
                          {user.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length < 1 || isCreating}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
              disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isCreating ? "Creating..." : `Create Group`}
          </button>
        </div>
      </div>
    </div>
  );
}
