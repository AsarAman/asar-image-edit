import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const handleOrderCreated = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { payload } = args;
    const attributes = payload.data?.attributes;
    const customData = attributes?.first_order_item?.product_name;

    // Extract user identifier from custom data
    const userIdentifier = attributes?.user_email;
    if (!userIdentifier) {
      console.error("No user identifier in order");
      return;
    }

    // Check if this is a lifetime purchase
    const isLifetime = customData?.toLowerCase().includes("lifetime");

    if (isLifetime) {
      // Find user by email using filter (no index available for optional email field)
      const users = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), userIdentifier))
        .collect();
      const user = users[0];

      if (user) {
        await ctx.db.patch(user._id, {
          subscriptionTier: "lifetime",
          subscriptionStatus: "active",
          lemonSqueezyOrderId: payload.data.id,
          lemonSqueezyCustomerId: attributes.customer_id?.toString(),
        });
      }
    }
  },
});

export const handleSubscriptionCreated = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { payload } = args;
    const attributes = payload.data?.attributes;
    const userEmail = attributes?.user_email;

    if (!userEmail) {
      console.error("No user email in subscription");
      return;
    }

    // Find user by email using filter (no index available for optional email field)
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), userEmail))
      .collect();
    const user = users[0];

    if (user) {
      await ctx.db.patch(user._id, {
        subscriptionTier: "premium",
        subscriptionStatus: "active",
        lemonSqueezySubscriptionId: payload.data.id,
        lemonSqueezyCustomerId: attributes.customer_id?.toString(),
      });
    }
  },
});

export const handleSubscriptionUpdated = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { payload } = args;
    const subscriptionId = payload.data?.id;
    const attributes = payload.data?.attributes;

    if (!subscriptionId) return;

    // Find user by subscription ID using index
    const user = await ctx.db
      .query("users")
      .withIndex("by_subscription_id", (q) =>
        q.eq("lemonSqueezySubscriptionId", subscriptionId)
      )
      .first();

    if (user) {
      const status = attributes?.status;
      let subscriptionStatus: "active" | "cancelled" | "expired" | "paused" =
        "active";

      if (status === "cancelled") subscriptionStatus = "cancelled";
      else if (status === "expired") subscriptionStatus = "expired";
      else if (status === "paused") subscriptionStatus = "paused";

      await ctx.db.patch(user._id, {
        subscriptionStatus,
      });
    }
  },
});

export const handleSubscriptionCancelled = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { payload } = args;
    const subscriptionId = payload.data?.id;

    if (!subscriptionId) return;

    // Find user by subscription ID using index
    const user = await ctx.db
      .query("users")
      .withIndex("by_subscription_id", (q) =>
        q.eq("lemonSqueezySubscriptionId", subscriptionId)
      )
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        subscriptionStatus: "cancelled",
      });
    }
  },
});

export const handleSubscriptionResumed = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { payload } = args;
    const subscriptionId = payload.data?.id;

    if (!subscriptionId) return;

    // Find user by subscription ID using index
    const user = await ctx.db
      .query("users")
      .withIndex("by_subscription_id", (q) =>
        q.eq("lemonSqueezySubscriptionId", subscriptionId)
      )
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        subscriptionStatus: "active",
      });
    }
  },
});

export const handleSubscriptionPaymentSuccess = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const { payload } = args;
    const subscriptionId = payload.data?.attributes?.subscription_id;

    if (!subscriptionId) return;

    // Find user by subscription ID using index
    const user = await ctx.db
      .query("users")
      .withIndex("by_subscription_id", (q) =>
        q.eq("lemonSqueezySubscriptionId", subscriptionId?.toString())
      )
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        subscriptionStatus: "active",
      });
    }
  },
});
