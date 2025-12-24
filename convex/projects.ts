import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Require authentication to access storage URLs
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }
    
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

const settingsValidator = v.object({
  layout: v.union(
    v.literal("single"),
    v.literal("horizontal"),
    v.literal("vertical"),
    v.literal("grid"),
    v.literal("collage1"),
    v.literal("collage2"),
    v.literal("overlay"),
    v.literal("diagonal"),
    v.literal("circular"),
    v.literal("stacked"),
    v.literal("mosaic")
  ),
  canvasWidth: v.number(),
  canvasHeight: v.number(),
  backgroundColor: v.string(),
  blendMode: v.optional(v.union(
    v.literal("normal"),
    v.literal("multiply"),
    v.literal("screen"),
    v.literal("overlay"),
    v.literal("darken"),
    v.literal("lighten"),
    v.literal("soft-light"),
    v.literal("hard-light")
  )),
  overlaySettings: v.optional(v.object({
    opacity: v.number(),
    x: v.number(),
    y: v.number(),
    scale: v.number(),
    rotation: v.number(),
  })),
  transparencies: v.optional(v.array(v.object({
    imageIndex: v.number(),
    opacity: v.number(),
  }))),
  visualEffects: v.optional(v.object({
    borderWidth: v.number(),
    borderColor: v.string(),
    cornerRadius: v.number(),
    shadowBlur: v.number(),
    shadowOffsetX: v.number(),
    shadowOffsetY: v.number(),
    shadowColor: v.string(),
    margin: v.number(),
  })),
  imageTransforms: v.optional(v.array(v.object({
    imageIndex: v.number(),
    rotation: v.number(),
    flipHorizontal: v.boolean(),
    flipVertical: v.boolean(),
  }))),
  crops: v.optional(v.array(v.object({
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
  }))),
  masks: v.optional(v.array(v.object({
    imageIndex: v.number(),
    shape: v.union(
      v.literal("none"),
      v.literal("circle"),
      v.literal("heart"),
      v.literal("star"),
      v.literal("pentagon"),
      v.literal("hexagon"),
      v.literal("square")
    ),
    customPath: v.optional(v.string()),
    gradientEnabled: v.boolean(),
    gradientDirection: v.union(
      v.literal("horizontal"),
      v.literal("vertical"),
      v.literal("radial"),
      v.literal("diagonal")
    ),
    gradientStart: v.number(),
    gradientEnd: v.number(),
    feather: v.number(),
    invert: v.boolean(),
  }))),
  filters: v.optional(v.object({
    brightness: v.number(),
    contrast: v.number(),
    saturation: v.number(),
    blur: v.number(),
    hueRotate: v.number(),
    grayscale: v.number(),
    sepia: v.number(),
    invert: v.number(),
  })),
  textLayers: v.optional(v.array(v.object({
    id: v.string(),
    text: v.string(),
    x: v.number(),
    y: v.number(),
    fontSize: v.number(),
    fontFamily: v.string(),
    color: v.string(),
    align: v.union(v.literal("left"), v.literal("center"), v.literal("right")),
    bold: v.boolean(),
    italic: v.boolean(),
    strokeWidth: v.number(),
    strokeColor: v.string(),
    shadowBlur: v.number(),
    shadowOffsetX: v.number(),
    shadowOffsetY: v.number(),
    shadowColor: v.string(),
    behindImages: v.optional(v.boolean()),
  }))),
  stickerLayers: v.optional(v.array(v.object({
    id: v.string(),
    type: v.string(),
    emoji: v.string(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    rotation: v.number(),
    opacity: v.number(),
    zIndex: v.number(),
  }))),
  drawingStrokes: v.optional(v.array(v.object({
    id: v.string(),
    tool: v.union(
      v.literal("pen"),
      v.literal("line"),
      v.literal("arrow"),
      v.literal("rectangle"),
      v.literal("circle"),
      v.literal("highlighter")
    ),
    color: v.string(),
    size: v.number(),
    opacity: v.number(),
    points: v.array(v.object({
      x: v.number(),
      y: v.number(),
    })),
    startPoint: v.optional(v.object({
      x: v.number(),
      y: v.number(),
    })),
    endPoint: v.optional(v.object({
      x: v.number(),
      y: v.number(),
    })),
  }))),
  animationSettings: v.optional(v.object({
    enabled: v.boolean(),
    duration: v.number(),
    transition: v.union(
      v.literal("none"),
      v.literal("fade"),
      v.literal("slide-left"),
      v.literal("slide-right"),
      v.literal("slide-up"),
      v.literal("slide-down"),
      v.literal("zoom-in"),
      v.literal("zoom-out"),
      v.literal("dissolve")
    ),
    transitionDuration: v.number(),
    loop: v.boolean(),
    loopCount: v.number(),
    fps: v.number(),
  })),
  glitchEffects: v.optional(v.object({
    enabled: v.boolean(),
    rgbSplit: v.object({
      enabled: v.boolean(),
      intensity: v.number(),
    }),
    scanlines: v.object({
      enabled: v.boolean(),
      intensity: v.number(),
      count: v.number(),
    }),
    distortion: v.object({
      enabled: v.boolean(),
      intensity: v.number(),
      frequency: v.number(),
    }),
    noise: v.object({
      enabled: v.boolean(),
      intensity: v.number(),
    }),
    colorShift: v.object({
      enabled: v.boolean(),
      hueShift: v.number(),
      saturationShift: v.number(),
    }),
  })),
  doubleExposureSettings: v.optional(v.object({
    enabled: v.boolean(),
    baseImageIndex: v.number(),
    overlayImageIndex: v.number(),
    blendMode: v.union(
      v.literal("normal"),
      v.literal("multiply"),
      v.literal("screen"),
      v.literal("overlay"),
      v.literal("darken"),
      v.literal("lighten"),
      v.literal("soft-light"),
      v.literal("hard-light")
    ),
    opacity: v.number(),
    overlayScale: v.number(),
    overlayX: v.number(),
    overlayY: v.number(),
    overlayRotation: v.number(),
    invert: v.boolean(),
  })),
  lightLeakOverlays: v.optional(v.array(v.object({
    id: v.string(),
    type: v.string(),
    url: v.string(),
    opacity: v.number(),
    blendMode: v.union(
      v.literal("screen"),
      v.literal("overlay"),
      v.literal("soft-light"),
      v.literal("lighten"),
      v.literal("normal")
    ),
    x: v.number(),
    y: v.number(),
    scale: v.number(),
    rotation: v.number(),
  }))),
  shadowSettings: v.optional(v.object({
    enabled: v.boolean(),
    type: v.union(
      v.literal("drop"),
      v.literal("inner"),
      v.literal("angle"),
      v.literal("curved")
    ),
    blur: v.number(),
    offsetX: v.number(),
    offsetY: v.number(),
    color: v.string(),
    opacity: v.number(),
    spread: v.number(),
    angle: v.number(),
    distance: v.number(),
    curve: v.number(),
  })),
  bokehSettings: v.optional(v.object({
    enabled: v.boolean(),
    intensity: v.number(),
    focalPoint: v.object({
      x: v.number(),
      y: v.number(),
    }),
    focalSize: v.number(),
    shape: v.union(
      v.literal("circle"),
      v.literal("hexagon"),
      v.literal("octagon")
    ),
    quality: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
  })),
  duotoneSettings: v.optional(v.object({
    enabled: v.boolean(),
    shadowColor: v.string(),
    highlightColor: v.string(),
    intensity: v.number(),
    contrast: v.number(),
  })),
});

export const create = mutation({
  args: {
    name: v.string(),
    images: v.array(
      v.object({
        storageId: v.id("_storage"),
        order: v.number(),
      })
    ),
    settings: settingsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
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
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      name: args.name,
      images: args.images,
      settings: args.settings,
    });

    return projectId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      projects.map(async (project) => ({
        ...project,
        imageUrls: await Promise.all(
          project.images.map(async (img) => ({
            url: await ctx.storage.getUrl(img.storageId),
            order: img.order,
          }))
        ),
      }))
    );
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 6);

    return await Promise.all(
      projects.map(async (project) => ({
        ...project,
        imageUrls: await Promise.all(
          project.images.map(async (img) => ({
            url: await ctx.storage.getUrl(img.storageId),
            order: img.order,
          }))
        ),
      }))
    );
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || project.userId !== user._id) {
      throw new ConvexError({
        message: "Unauthorized",
        code: "FORBIDDEN",
      });
    }

    return {
      ...project,
      imageUrls: await Promise.all(
        project.images.map(async (img) => ({
          url: await ctx.storage.getUrl(img.storageId),
          order: img.order,
        }))
      ),
    };
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    images: v.optional(v.array(
      v.object({
        storageId: v.id("_storage"),
        order: v.number(),
      })
    )),
    settings: v.optional(settingsValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || project.userId !== user._id) {
      throw new ConvexError({
        message: "Unauthorized",
        code: "FORBIDDEN",
      });
    }

    const updates: {
      name?: string;
      images?: typeof args.images;
      settings?: typeof args.settings;
    } = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.images !== undefined) updates.images = args.images;
    if (args.settings !== undefined) updates.settings = args.settings;

    await ctx.db.patch(args.projectId, updates);
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || project.userId !== user._id) {
      throw new ConvexError({
        message: "Unauthorized",
        code: "FORBIDDEN",
      });
    }

    await ctx.db.delete(args.projectId);
  },
});
