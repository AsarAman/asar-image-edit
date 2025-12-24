import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/lemon-squeezy-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      
      // Verify webhook signature
      const signature = request.headers.get("X-Signature");
      const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
      
      if (!secret) {
        console.error("Webhook secret not configured");
        return new Response("Webhook not configured", { status: 500 });
      }
      
      if (!signature) {
        console.error("Missing webhook signature");
        return new Response("Unauthorized", { status: 401 });
      }

      // Verify the signature using crypto
      const crypto = await import("node:crypto");
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(body);
      const digest = hmac.digest("hex");
      
      if (signature !== digest) {
        console.error("Invalid webhook signature");
        return new Response("Unauthorized", { status: 401 });
      }
      
      const event = JSON.parse(body);

      // Route events to appropriate handlers
      const eventName = event.meta?.event_name;

      if (eventName === "order_created") {
        await ctx.runMutation(api.paymentsWebhooks.handleOrderCreated, {
          payload: event,
        });
      } else if (eventName === "subscription_created") {
        await ctx.runMutation(api.paymentsWebhooks.handleSubscriptionCreated, {
          payload: event,
        });
      } else if (eventName === "subscription_updated") {
        await ctx.runMutation(api.paymentsWebhooks.handleSubscriptionUpdated, {
          payload: event,
        });
      } else if (eventName === "subscription_cancelled") {
        await ctx.runMutation(
          api.paymentsWebhooks.handleSubscriptionCancelled,
          {
            payload: event,
          }
        );
      } else if (eventName === "subscription_resumed") {
        await ctx.runMutation(api.paymentsWebhooks.handleSubscriptionResumed, {
          payload: event,
        });
      } else if (eventName === "subscription_payment_success") {
        await ctx.runMutation(
          api.paymentsWebhooks.handleSubscriptionPaymentSuccess,
          {
            payload: event,
          }
        );
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

export default http;
