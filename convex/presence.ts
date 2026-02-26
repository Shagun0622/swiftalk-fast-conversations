import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getConvexUser } from "./helpers";

const ONLINE_THRESHOLD_MS = 15000; // 15 seconds

export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await getConvexUser(ctx);
    if (!me) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", me._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: Date.now() });
    } else {
      await ctx.db.insert("presence", { userId: me._id, updatedAt: Date.now() });
    }
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const presences = await ctx.db.query("presence").collect();
    return presences
      .filter((p) => now - p.updatedAt < ONLINE_THRESHOLD_MS)
      .map((p) => p.userId);
  },
});
