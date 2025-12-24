import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Export limits per tier
const FREE_TIER_MONTHLY_LIMIT = 5;
const PREMIUM_TIER_MONTHLY_LIMIT = 80;
// Lifetime tier has unlimited exports (no limit)

// Upload limits per tier
const FREE_TIER_UPLOAD_LIMIT = 4;
const PREMIUM_TIER_UPLOAD_LIMIT = 8;
const LIFETIME_TIER_UPLOAD_LIMIT = 8;

// Get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Check if user can export (within limits)
export const canExport = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Default to free tier if not set
    const subscriptionTier = user.subscriptionTier || "free";

    // Lifetime users have unlimited exports
    if (subscriptionTier === "lifetime") {
      return {
        canExport: true,
        isPremium: true,
        tier: "lifetime" as const,
        exportsUsed: 0,
        exportsLimit: null,
        exportsRemaining: null,
      };
    }

    // Check monthly limits for free and premium users
    const currentMonth = getCurrentMonth();
    const exports = await ctx.db
      .query("exports")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", user._id).eq("month", currentMonth)
      )
      .collect();

    const exportsUsed = exports.length;
    
    if (subscriptionTier === "premium") {
      const canExport = exportsUsed < PREMIUM_TIER_MONTHLY_LIMIT;
      return {
        canExport,
        isPremium: true,
        tier: "premium" as const,
        exportsUsed,
        exportsLimit: PREMIUM_TIER_MONTHLY_LIMIT,
        exportsRemaining: Math.max(0, PREMIUM_TIER_MONTHLY_LIMIT - exportsUsed),
      };
    }

    // Free users
    const canExport = exportsUsed < FREE_TIER_MONTHLY_LIMIT;
    return {
      canExport,
      isPremium: false,
      tier: "free" as const,
      exportsUsed,
      exportsLimit: FREE_TIER_MONTHLY_LIMIT,
      exportsRemaining: Math.max(0, FREE_TIER_MONTHLY_LIMIT - exportsUsed),
    };
  },
});

// Track an export
export const trackExport = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    format: v.union(v.literal("png"), v.literal("jpeg")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Check if user can export
    const currentMonth = getCurrentMonth();
    const subscriptionTier = user.subscriptionTier || "free";
    
    // Lifetime users have unlimited exports
    if (subscriptionTier !== "lifetime") {
      const exports = await ctx.db
        .query("exports")
        .withIndex("by_user_and_month", (q) =>
          q.eq("userId", user._id).eq("month", currentMonth)
        )
        .collect();

      if (subscriptionTier === "free" && exports.length >= FREE_TIER_MONTHLY_LIMIT) {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: `Export limit reached (${FREE_TIER_MONTHLY_LIMIT}/month). Upgrade to Pro for ${PREMIUM_TIER_MONTHLY_LIMIT} exports/month or Lifetime for unlimited exports.`,
        });
      }

      if (subscriptionTier === "premium" && exports.length >= PREMIUM_TIER_MONTHLY_LIMIT) {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: `Export limit reached (${PREMIUM_TIER_MONTHLY_LIMIT}/month). Upgrade to Lifetime for unlimited exports.`,
        });
      }
    }

    // Track the export
    await ctx.db.insert("exports", {
      userId: user._id,
      projectId: args.projectId,
      format: args.format,
      month: currentMonth,
    });

    return { success: true };
  },
});

// Get upload limits for current user
export const getUploadLimits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Default to free tier if not set
    const subscriptionTier = user.subscriptionTier || "free";

    let maxImages: number;
    if (subscriptionTier === "lifetime") {
      maxImages = LIFETIME_TIER_UPLOAD_LIMIT;
    } else if (subscriptionTier === "premium") {
      maxImages = PREMIUM_TIER_UPLOAD_LIMIT;
    } else {
      maxImages = FREE_TIER_UPLOAD_LIMIT;
    }

    return {
      maxImages,
      tier: subscriptionTier,
    };
  },
});

// Get subscription status
export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      tier: user.subscriptionTier || "free",
      status: user.subscriptionStatus || "active",
      expiresAt: user.subscriptionExpiresAt,
    };
  },
});


