import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

// Get all users with pagination
export const listUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const result = await ctx.db
      .query("users")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((user) => ({
        _id: user._id,
        _creationTime: user._creationTime,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier || "free",
        subscriptionStatus: user.subscriptionStatus || "active",
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        role: user.role || "user",
      })),
    };
  },
});

// Get platform statistics
export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const users = await ctx.db.query("users").collect();
    const projects = await ctx.db.query("projects").collect();
    const exports = await ctx.db.query("exports").collect();

    const totalUsers = users.length;
    const freeUsers = users.filter(
      (u) => (u.subscriptionTier || "free") === "free"
    ).length;
    const premiumUsers = users.filter(
      (u) => u.subscriptionTier === "premium"
    ).length;
    const totalProjects = projects.length;
    const totalExports = exports.length;

    // Get this month's stats
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthExports = exports.filter((e) => e.month === currentMonth).length;

    return {
      totalUsers,
      freeUsers,
      premiumUsers,
      totalProjects,
      totalExports,
      thisMonthExports,
    };
  },
});

// Get user details including their projects and exports
export const getUserDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const exports = await ctx.db
      .query("exports")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // Get current month exports
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthExports = exports.filter((e) => e.month === currentMonth).length;

    return {
      user: {
        _id: user._id,
        _creationTime: user._creationTime,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier || "free",
        subscriptionStatus: user.subscriptionStatus || "active",
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        role: user.role || "user",
      },
      projectCount: projects.length,
      totalExports: exports.length,
      thisMonthExports,
    };
  },
});

// Update user subscription
export const updateUserSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionTier: v.union(v.literal("free"), v.literal("premium"), v.literal("lifetime")),
    subscriptionStatus: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("paused")
    ),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    await ctx.db.patch(args.userId, {
      subscriptionTier: args.subscriptionTier,
      subscriptionStatus: args.subscriptionStatus,
    });

    return { success: true };
  },
});

// Update user role
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
    });

    return { success: true };
  },
});

// Delete user and all their data
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Delete user's projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    // Delete user's exports
    const exports = await ctx.db
      .query("exports")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    for (const exp of exports) {
      await ctx.db.delete(exp._id);
    }

    // Delete user
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});

// Check if current user is admin
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return currentUser?.role === "admin";
  },
});

// Get all testimonials (pending and approved)
export const getAllTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const testimonials = await ctx.db
      .query("testimonials")
      .order("desc")
      .collect();

    return testimonials;
  },
});

// Approve or reject testimonial
export const updateTestimonialStatus = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    await ctx.db.patch(args.testimonialId, {
      approved: args.approved,
    });

    return { success: true };
  },
});

// Get all contact submissions
export const getAllContactSubmissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const submissions = await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .collect();

    return submissions;
  },
});

// Update contact submission status
export const updateContactSubmissionStatus = mutation({
  args: {
    submissionId: v.id("contactSubmissions"),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    await ctx.db.patch(args.submissionId, {
      status: args.status,
    });

    return { success: true };
  },
});
