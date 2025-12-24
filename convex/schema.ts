import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    subscriptionTier: v.optional(v.union(v.literal("free"), v.literal("premium"), v.literal("lifetime"))),
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("cancelled"), v.literal("expired"), v.literal("paused"))),
    subscriptionExpiresAt: v.optional(v.number()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezySubscriptionId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_subscription_id", ["lemonSqueezySubscriptionId"]),

  exports: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    format: v.union(v.literal("png"), v.literal("jpeg")),
    month: v.string(), // Format: "YYYY-MM"
  }).index("by_user_and_month", ["userId", "month"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    images: v.array(
      v.object({
        storageId: v.id("_storage"),
        order: v.number(),
      })
    ),
    settings: v.object({
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
      splitSettings: v.optional(v.object({
        splitPosition: v.number(),
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
    }),
  }).index("by_user", ["userId"]),

  testimonials: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    userEmail: v.optional(v.string()),
    rating: v.number(), // 1-5
    testimonial: v.string(),
    approved: v.boolean(), // Admin approval
  }).index("by_user", ["userId"]).index("by_approved", ["approved"]),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
  }).index("by_status", ["status"]),

  backgroundRemovalCache: defineTable({
    imageHash: v.string(), // SHA-256 hash of the image data
    resultStorageId: v.id("_storage"), // Processed image in Convex storage
    modelType: v.optional(v.string()), // For future: "general", "portrait", "product"
  }).index("by_hash", ["imageHash"]),

  faceRetouchCache: defineTable({
    imageHash: v.string(), // SHA-256 hash of the image data
    resultStorageId: v.id("_storage"), // Retouched image in Convex storage
  }).index("by_hash", ["imageHash"]),

  magicEraserCache: defineTable({
    imageHash: v.string(), // SHA-256 hash of the image data + mask
    resultStorageId: v.id("_storage"), // Processed image in Convex storage
  }).index("by_hash", ["imageHash"]),
});
