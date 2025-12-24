import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// Submit a contact form
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate email format (more robust)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(args.email)) {
      throw new ConvexError({
        message: "Invalid email address",
        code: "BAD_REQUEST",
      });
    }

    // Validate required fields
    if (!args.name.trim() || !args.subject.trim() || !args.message.trim()) {
      throw new ConvexError({
        message: "All fields are required",
        code: "BAD_REQUEST",
      });
    }
    
    // Validate field lengths
    if (args.name.length > 100) {
      throw new ConvexError({
        message: "Name must be less than 100 characters",
        code: "BAD_REQUEST",
      });
    }
    
    if (args.email.length > 255) {
      throw new ConvexError({
        message: "Email must be less than 255 characters",
        code: "BAD_REQUEST",
      });
    }
    
    if (args.subject.length > 200) {
      throw new ConvexError({
        message: "Subject must be less than 200 characters",
        code: "BAD_REQUEST",
      });
    }
    
    if (args.message.length > 5000) {
      throw new ConvexError({
        message: "Message must be less than 5000 characters",
        code: "BAD_REQUEST",
      });
    }

    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      status: "new",
    });

    return submissionId;
  },
});
