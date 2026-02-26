import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

export async function getConvexUser(ctx: QueryCtx | MutationCtx) {
  const clerkId = await getAuthUserId(ctx);
  if (!clerkId) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}
