import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./helpers";

// Called from Clerk webhook or on first login to upsert user in Convex
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", args);
  },
});

// Get the currently logged-in user's Convex record
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const clerkId = await getAuthUserId(ctx);
    if (!clerkId) return null;   // ✅ was wrongly "return all" — fixed
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

// Get all users except the current user
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const clerkId = await getAuthUserId(ctx);
    const all = await ctx.db.query("users").collect();
    if (!clerkId) return all;    // ✅ return all if auth fails, not empty array
    return all.filter((u) => u.clerkId !== clerkId);
  },
});

// Get a user by their Convex ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});