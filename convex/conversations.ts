import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getConvexUser } from "./helpers";

export const getOrCreateConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", me._id))
      .collect();

    for (const membership of myMemberships) {
      const conv = await ctx.db.get(membership.conversationId);
      if (!conv || conv.isGroup) continue;

      const otherMember = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversationId_userId", (q) =>
          q.eq("conversationId", membership.conversationId).eq("userId", args.otherUserId)
        )
        .unique();

      if (otherMember) return membership.conversationId;
    }

    const convId = await ctx.db.insert("conversations", { isGroup: false });
    await ctx.db.insert("conversationMembers", { conversationId: convId, userId: me._id });
    await ctx.db.insert("conversationMembers", { conversationId: convId, userId: args.otherUserId });
    return convId;
  },
});

export const createGroupConversation = mutation({
  args: {
    memberIds: v.array(v.id("users")),
    groupName: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) throw new Error("Not authenticated");
    if (args.memberIds.length < 2) throw new Error("Need at least 2 other members");

    const convId = await ctx.db.insert("conversations", {
      isGroup: true,
      groupName: args.groupName,
    });

    // Add creator
    await ctx.db.insert("conversationMembers", { conversationId: convId, userId: me._id });

    // Add all selected members
    for (const memberId of args.memberIds) {
      await ctx.db.insert("conversationMembers", { conversationId: convId, userId: memberId });
    }

    return convId;
  },
});

export const getMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const me = await getConvexUser(ctx);
    if (!me) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", me._id))
      .collect();

    const conversations = await Promise.all(
      memberships.map(async (membership) => {
        const conv = await ctx.db.get(membership.conversationId);
        if (!conv) return null;

        const allMembers = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
          .collect();

        const otherMembers = await Promise.all(
          allMembers
            .filter((m) => m.userId !== me._id)
            .map((m) => ctx.db.get(m.userId))
        );

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();

        const allMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
          .order("asc")
          .collect();

        let unreadCount = 0;
        const lastSeenId = membership.lastSeenMessageId;

        if (!lastSeenId) {
          unreadCount = allMessages.filter((m) => m.senderId !== me._id).length;
        } else {
          const lastSeenIndex = allMessages.findIndex((m) => m._id === lastSeenId);
          if (lastSeenIndex === -1) {
            unreadCount = allMessages.filter((m) => m.senderId !== me._id).length;
          } else {
            unreadCount = allMessages
              .slice(lastSeenIndex + 1)
              .filter((m) => m.senderId !== me._id).length;
          }
        }

        return {
          ...conv,
          otherMembers: otherMembers.filter(Boolean),
          lastMessage: lastMessage ?? null,
          unreadCount,
          memberCount: allMembers.length,
        };
      })
    );

    return conversations
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a!.lastMessage?._creationTime ?? a!._creationTime;
        const bTime = b!.lastMessage?._creationTime ?? b!._creationTime;
        return bTime - aTime;
      });
  },
});

export const markConversationSeen = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) return;

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId_userId", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();
    if (!membership) return;

    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .first();

    if (lastMessage) {
      await ctx.db.patch(membership._id, { lastSeenMessageId: lastMessage._id });
    }
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getConvexUser(ctx);
    if (!me) return null;
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;

    const allMembers = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
      .collect();

    const otherMembers = await Promise.all(
      allMembers.filter((m) => m.userId !== me._id).map((m) => ctx.db.get(m.userId))
    );

    return {
      ...conv,
      otherMembers: otherMembers.filter(Boolean),
      memberCount: allMembers.length,
    };
  },
});
