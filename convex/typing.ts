import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getConvexUser } from "./helpers";

const TYPING_TIMEOUT_MS = 3000;

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) return;

    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversationId_userId", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();

    if (args.isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, { updatedAt: Date.now() });
      } else {
        await ctx.db.insert("typing", {
          conversationId: args.conversationId,
          userId: me._id,
          updatedAt: Date.now(),
        });
      }
    } else {
      if (existing) await ctx.db.delete(existing._id);
    }
  },
});

export const getTypingUsers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) return [];

    const now = Date.now();
    const typingRecords = await ctx.db
      .query("typing")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const active = typingRecords.filter(
      (t) => t.userId !== me._id && now - t.updatedAt < TYPING_TIMEOUT_MS
    );

    return await Promise.all(active.map((t) => ctx.db.get(t.userId)));
  },
});
