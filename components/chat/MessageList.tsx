"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatMessageTime } from "@/lib/formatTimestamp";
import TypingIndicator from "./TypingIndicator";
import MessageReactions from "./MessageReactions";
import EmojiPicker from "./EmojiPicker";

interface Props {
  conversationId: Id<"conversations">;
}

export default function MessageList({ conversationId }: Props) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const me = useQuery(api.users.getMe);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [emojiAnchor, setEmojiAnchor] = useState<{ id: string; el: HTMLElement } | null>(null);
  const prevCountRef = useRef(0);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    if (atBottom) setShowNewMessages(false);
  };

  useEffect(() => {
    if (!messages) return;
    const count = messages.length;
    if (count > prevCountRef.current) {
      prevCountRef.current = count;
      if (isAtBottom) scrollToBottom("smooth");
      else setShowNewMessages(true);
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (messages && messages.length > 0) scrollToBottom("instant");
  }, [conversationId]);

  if (messages === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-[#8899b4] text-sm font-medium">No messages yet</p>
        <p className="text-[#3d5070] text-xs mt-1">Say hello! 👋</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4 flex flex-col gap-1"
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === me?._id;
          const prev = messages[idx - 1];
          const showAvatar = !isMe && (!prev || prev.senderId !== msg.senderId);

          return (
            <div key={msg._id}
              className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}
              ${idx > 0 && messages[idx - 1].senderId === msg.senderId ? "mt-0.5" : "mt-3"}`}>

              {/* Avatar */}
              <div className="w-8 flex-shrink-0">
                {!isMe && showAvatar && (
                  (msg.sender as any)?.imageUrl ? (
                    <div className="relative w-8 h-8">
                      <Image src={(msg.sender as any).imageUrl} alt={(msg.sender as any).name}
                        fill className="rounded-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                      {(msg.sender as any)?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )
                )}
              </div>

              <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                {showAvatar && !isMe && (
                  <p className="text-xs text-slate-500 mb-1 ml-1">{(msg.sender as any)?.name}</p>
                )}

                <div className="group flex items-end gap-1">
                  {/* Emoji reaction button */}
                  {!msg.isDeleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmojiAnchor(
                          emojiAnchor?.id === msg._id
                            ? null
                            : { id: msg._id, el: e.currentTarget }
                        );
                      }}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity
                        p-1 rounded text-slate-500 hover:text-slate-300 text-base
                        ${isMe ? "order-first" : "order-last"}`}
                    >
                      😊
                    </button>
                  )}

                  {/* Delete button for own messages */}
                  {isMe && !msg.isDeleted && (
                    <button
                      onClick={() => deleteMessage({ messageId: msg._id })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1
                        rounded text-slate-600 hover:text-red-400 order-first"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  {/* Message bubble */}
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
                    ${isMe
                      ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20"
                      : "bg-[#1a2235] text-[#e2e8f8] rounded-bl-sm border border-[#1e2d45]"}
                    ${msg.isDeleted ? "opacity-60 italic" : ""}`}>
                    {msg.isDeleted ? "This message was deleted" : msg.content}
                  </div>
                </div>

                {/* Reactions row */}
                {!msg.isDeleted && (msg as any).reactions?.length > 0 && (
                  <MessageReactions
                    reactions={(msg as any).reactions}
                    messageId={msg._id}
                    isMe={isMe}
                  />
                )}

                <p className="text-[10px] text-[#3d5070] mt-0.5 mx-1">
                  {formatMessageTime(msg._creationTime)}
                </p>
              </div>

              {/* Emoji picker portal — outside scroll container */}
              {emojiAnchor?.id === msg._id && (
                <EmojiPicker
                  messageId={msg._id}
                  onClose={() => setEmojiAnchor(null)}
                  anchorEl={emojiAnchor.el}
                />
              )}
            </div>
          );
        })}

        <TypingIndicator conversationId={conversationId} />
        <div ref={bottomRef} />
      </div>

      {showNewMessages && (
        <button
          onClick={() => { scrollToBottom(); setShowNewMessages(false); }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-500
            text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          New messages
        </button>
      )}
    </div>
  );
}
