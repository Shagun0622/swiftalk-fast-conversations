"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Props { conversationId: Id<"conversations">; }

export default function MessageInput({ conversationId }: Props) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopTyping = useCallback(() => {
    setTyping({ conversationId, isTyping: false });
  }, [conversationId, setTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setTyping({ conversationId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setContent("");
    stopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    try {
      await sendMessage({ conversationId, content: trimmed });
    } catch {
      setContent(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="px-4 py-3 border-t border-[#1e2d45] bg-[#0d1220] flex-shrink-0">
      <div className="flex items-end gap-3 bg-[#111827] border border-[#1e2d45] rounded-2xl
        px-4 py-2 focus-within:border-indigo-500/50 focus-within:bg-[#131c2e]
        transition-all duration-200">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          className="flex-1 bg-transparent text-[#f0f4ff] placeholder-[#3d5070] text-sm
            resize-none focus:outline-none leading-relaxed py-1.5 max-h-40 font-['DM_Sans']"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 160) + "px";
          }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30
            disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150
            hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex-shrink-0 mb-0.5"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-[10px] text-[#3d5070] mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
