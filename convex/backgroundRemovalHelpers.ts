import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal query to check cache
export const checkCache = internalQuery({
  args: { imageHash: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("backgroundRemovalCache")
      .withIndex("by_hash", (q) => q.eq("imageHash", args.imageHash))
      .first();
    return cached;
  },
});

// Internal mutation to save to cache
export const saveToCache = internalMutation({
  args: {
    imageHash: v.string(),
    resultStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("backgroundRemovalCache", {
      imageHash: args.imageHash,
      resultStorageId: args.resultStorageId,
    });
  },
});
