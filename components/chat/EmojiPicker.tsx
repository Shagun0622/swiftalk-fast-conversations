"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface Props {
  messageId: Id<"messages">;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export default function EmojiPicker({ messageId, onClose, anchorEl }: Props) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const pickerWidth = 220;
    let left = rect.left;
    let top = rect.top - 56;
    if (left + pickerWidth > window.innerWidth) left = window.innerWidth - pickerWidth - 10;
    if (left < 10) left = 10;
    if (top < 10) top = rect.bottom + 8;
    setPosition({ top, left });

    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("mousedown", handleOutsideClick), 0);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  return createPortal(
    <div
      ref={pickerRef}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[9999] bg-slate-800 border border-slate-600
        rounded-full px-3 py-2 flex gap-2 shadow-2xl"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            toggleReaction({ messageId, emoji });
            onClose();
          }}
          className="text-xl hover:scale-125 transition-transform duration-150"
        >
          {emoji}
        </button>
      ))}
    </div>,
    document.body
  );
}