"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const createCheckoutUrl = action({
  args: {
    tier: v.union(v.literal("pro"), v.literal("lifetime")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const proVariantId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID;
    const lifetimeVariantId = process.env.LEMON_SQUEEZY_LIFETIME_VARIANT_ID;

    if (!apiKey || !storeId || !proVariantId || !lifetimeVariantId) {
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Payment configuration missing",
      });
    }

    const variantId = args.tier === "pro" ? proVariantId : lifetimeVariantId;

    try {
      const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                email: identity.email,
                custom: {
                  user_id: identity.tokenIdentifier,
                },
              },
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: storeId,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: variantId,
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lemon Squeezy API error:", errorText);
        throw new ConvexError({
          code: "EXTERNAL_SERVICE_ERROR",
          message: "Failed to create checkout session",
        });
      }

      const data = await response.json();
      return { url: data.data.attributes.url };
    } catch (error) {
      console.error("Checkout error:", error);
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Failed to create checkout session",
      });
    }
  },
});
