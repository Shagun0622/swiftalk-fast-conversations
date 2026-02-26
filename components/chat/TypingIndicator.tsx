"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Props { conversationId: Id<"conversations">; }

export default function TypingIndicator({ conversationId }: Props) {
  const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });
  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map((u: any) => u?.name?.split(" ")[0]).filter(Boolean);
  const label = names.length === 1 ? `${names[0]} is typing` : `${names.join(", ")} are typing`;

  return (
    <div className="flex items-center gap-2.5 mt-3 ml-10 fade-up">
      <div className="bg-[#1a2235] border border-[#1e2d45] rounded-2xl rounded-bl-sm px-3.5 py-2.5
        flex items-center gap-2">
        <div className="flex gap-1 items-center">
          <span className="typing-dot w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          <span className="typing-dot w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          <span className="typing-dot w-1.5 h-1.5 bg-indigo-400 rounded-full" />
        </div>
        <p className="text-xs text-[#8899b4] italic">{label}</p>
      </div>
    </div>
  );
}
