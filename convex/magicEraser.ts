"use node";

import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { createHash } from "crypto";

export const eraseObjects = action({
  args: { 
    imageUrl: v.string(),
    maskUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ imageUrl: string; cached: boolean }> => {
    // Verify user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    // Check if user has premium access
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const isPremium = user.subscriptionTier === "premium" || user.subscriptionTier === "lifetime";
    if (!isPremium) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Magic Eraser requires a Pro subscription",
      });
    }

    // Generate hash from image + mask data for caching
    const combinedData = args.imageUrl + args.maskUrl;
    const imageHash = createHash("sha256").update(combinedData).digest("hex");
    
    // Check cache first
    const cached = await ctx.runQuery(internal.magicEraserHelpers.checkCache, {
      imageHash,
    });

    if (cached) {
      console.log("Magic Eraser cache hit! Returning cached result for hash:", imageHash.substring(0, 12));
      // Return the cached result from storage
      const url = (await ctx.storage.getUrl(cached.resultStorageId)) as string | null;
      if (url) {
        return { imageUrl: url, cached: true };
      }
      // If storage URL is not available, fall through to re-process
      console.log("Cached storage URL expired, re-processing");
    }

    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) {
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Magic Eraser service not configured",
      });
    }

    // Log first few characters for debugging (without exposing the full key)
    console.log("Processing new magic eraser, hash:", imageHash.substring(0, 12));

    try {
      // Use Replicate's LaMa model for inpainting (allenhooo/lama)
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "cdac78a1bec5b23c07fd29692fb70baa513ea403a39e643c48ec5edadb15fe72",
          input: {
            image: args.imageUrl,
            mask: args.maskUrl,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Replicate API error:", errorText);
        
        // Try to parse the error message from Replicate
        let errorMessage = "Failed to start Magic Eraser. Please check your Replicate account.";
        
        try {
          const errorData = JSON.parse(errorText);
          
          if (errorData.detail) {
            // Extract the helpful part of the error message
            if (errorData.detail.includes("insufficient credit")) {
              errorMessage = "Replicate API: Insufficient credit. If you just added credit, please wait 5-10 minutes and try again. Make sure the API key matches the account with credit.";
            } else if (errorData.detail.includes("authentication")) {
              errorMessage = "Invalid Replicate API key. Please check your REPLICATE_API_TOKEN in Secrets.";
            } else {
              errorMessage = errorData.detail;
            }
          } else if (errorData.title) {
            errorMessage = errorData.title;
          }
        } catch {
          // If we can't parse the error, use the default message
        }
        
        throw new ConvexError({
          code: "EXTERNAL_SERVICE_ERROR",
          message: errorMessage,
        });
      }

      const prediction = await response.json();
      const predictionId = prediction.id;

      // Poll for completion (max 60 seconds)
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const statusResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
            },
          }
        );

        if (!statusResponse.ok) {
          throw new ConvexError({
            code: "EXTERNAL_SERVICE_ERROR",
            message: "Failed to check Magic Eraser status",
          });
        }

        const status = await statusResponse.json();

        if (status.status === "succeeded") {
          // Fetch the processed image from Replicate
          const imageResponse = await fetch(status.output);
          if (!imageResponse.ok) {
            throw new ConvexError({
              code: "EXTERNAL_SERVICE_ERROR",
              message: "Failed to fetch processed image from Replicate",
            });
          }

          const imageBlob = await imageResponse.blob();
          
          // Store in Convex storage
          const storageId = await ctx.storage.store(imageBlob);
          
          // Save to cache for future requests
          await ctx.runMutation(internal.magicEraserHelpers.saveToCache, {
            imageHash,
            resultStorageId: storageId,
          });

          console.log("Cached new magic eraser result for hash:", imageHash.substring(0, 12));
          
          // Return the storage URL
          const url = (await ctx.storage.getUrl(storageId)) as string | null;
          if (!url) {
            throw new ConvexError({
              code: "EXTERNAL_SERVICE_ERROR",
              message: "Failed to get storage URL for processed image",
            });
          }
          return { imageUrl: url, cached: false };
        }

        if (status.status === "failed") {
          throw new ConvexError({
            code: "EXTERNAL_SERVICE_ERROR",
            message: "Magic Eraser failed. Please try again with a different area.",
          });
        }

        attempts++;
      }

      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Magic Eraser timed out",
      });

    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      console.error("Magic Eraser error:", error);
      throw new ConvexError({
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Failed to erase objects",
      });
    }
  },
});
