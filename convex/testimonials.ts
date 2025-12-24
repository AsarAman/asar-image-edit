import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// Create a new testimonial
export const create = mutation({
  args: {
    rating: v.number(),
    testimonial: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new ConvexError({
        message: "Rating must be between 1 and 5",
        code: "BAD_REQUEST",
      });
    }
    
    // Validate testimonial content
    if (!args.testimonial.trim()) {
      throw new ConvexError({
        message: "Testimonial cannot be empty",
        code: "BAD_REQUEST",
      });
    }
    
    if (args.testimonial.length > 1000) {
      throw new ConvexError({
        message: "Testimonial must be less than 1000 characters",
        code: "BAD_REQUEST",
      });
    }

    // Check if user already has a testimonial
    const existing = await ctx.db
      .query("testimonials")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      throw new ConvexError({
        message: "You have already submitted a testimonial",
        code: "CONFLICT",
      });
    }

    const testimonialId = await ctx.db.insert("testimonials", {
      userId: user._id,
      userName: user.name || identity.name || "Anonymous",
      userEmail: user.email || identity.email,
      rating: args.rating,
      testimonial: args.testimonial,
      approved: false, // Requires admin approval
    });

    return testimonialId;
  },
});

// Get approved testimonials
export const getApproved = query({
  args: {},
  handler: async (ctx) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .collect();

    return testimonials;
  },
});

// Get current user's testimonial
export const getCurrentUserTestimonial = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null;
    }

    const testimonial = await ctx.db
      .query("testimonials")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return testimonial;
  },
});
