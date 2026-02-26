import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getConvexUser } from "./helpers";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) throw new Error("Not authenticated");
    if (!ALLOWED_EMOJIS.includes(args.emoji)) throw new Error("Invalid emoji");

    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_messageId_userId", (q) =>
        q.eq("messageId", args.messageId).eq("userId", me._id)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: me._id,
        emoji: args.emoji,
      });
    }
  },
});

export const getReactions = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) return {};

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const result: Record<string, { emoji: string; count: number; likedByMe: boolean }[]> = {};

    for (const message of messages) {
      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_messageId", (q) => q.eq("messageId", message._id))
        .collect();

      if (reactions.length === 0) continue;

      // Group by emoji
      const grouped: Record<string, { count: number; likedByMe: boolean }> = {};
      for (const r of reactions) {
        if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, likedByMe: false };
        grouped[r.emoji].count++;
        if (r.userId === me._id) grouped[r.emoji].likedByMe = true;
      }

      result[message._id] = Object.entries(grouped).map(([emoji, data]) => ({
        emoji,
        ...data,
      }));
    }

    return result;
  },
});
