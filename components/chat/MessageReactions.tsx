"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Reaction {
  emoji: string;
  count: number;
  likedByMe: boolean;
}

interface Props {
  reactions: Reaction[];
  messageId: Id<"messages">;
  isMe: boolean;
}

export default function MessageReactions({ reactions, messageId, isMe }: Props) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
      {reactions.map(({ emoji, count, likedByMe }) => (
        <button
          key={emoji}
          onClick={() => toggleReaction({ messageId, emoji })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors
            ${likedByMe
              ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
              : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400"
            }`}
        >
          <span>{emoji}</span>
          <span className="font-medium">{count}</span>
        </button>
      ))}
    </div>
  );
}
