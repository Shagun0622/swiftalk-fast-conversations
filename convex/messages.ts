import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getConvexUser } from "./helpers";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId_userId", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();
    if (!membership) throw new Error("Not a member of this conversation");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: me._id,
      content: args.content,
      isDeleted: false,
    });

    await ctx.db.patch(membership._id, { lastSeenMessageId: messageId });
    return messageId;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);

        // Get reactions for this message
        const rawReactions = await ctx.db
          .query("reactions")
          .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
          .collect();

        const grouped: Record<string, { count: number; likedByMe: boolean }> = {};
        for (const r of rawReactions) {
          if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, likedByMe: false };
          grouped[r.emoji].count++;
          if (r.userId === me._id) grouped[r.emoji].likedByMe = true;
        }
        const reactions = Object.entries(grouped).map(([emoji, data]) => ({ emoji, ...data }));

        return { ...msg, sender, reactions };
      })
    );
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== me._id) throw new Error("Can only delete your own messages");

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});
