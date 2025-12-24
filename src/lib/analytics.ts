/**
 * Google Analytics 4 utilities for tracking custom events
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.gtag) {
    console.log("GA4 Event:", eventName, eventParams);
    window.gtag("event", eventName, eventParams);
  } else {
    console.warn("GA4 not initialized. Event not tracked:", eventName);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
    });
  }
}

/**
 * Track user signup/login
 */
export function trackUserAuth(action: "signup" | "login") {
  trackEvent(action, {
    method: "hercules_auth",
  });
}

/**
 * Track image upload
 */
export function trackImageUpload(imageCount: number) {
  trackEvent("image_upload", {
    image_count: imageCount,
  });
}

/**
 * Track image export
 */
export function trackImageExport(
  format: string,
  quality?: number,
  isAnimated?: boolean
) {
  trackEvent("image_export", {
    format,
    quality,
    is_animated: isAnimated,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  details?: Record<string, unknown>
) {
  trackEvent("feature_used", {
    feature_name: feature,
    ...details,
  });
}

/**
 * Track layout change
 */
export function trackLayoutChange(layoutType: string) {
  trackEvent("layout_change", {
    layout_type: layoutType,
  });
}

/**
 * Track filter application
 */
export function trackFilterApplied(filterName: string) {
  trackEvent("filter_applied", {
    filter_name: filterName,
  });
}

/**
 * Track blend mode change
 */
export function trackBlendModeChange(blendMode: string) {
  trackEvent("blend_mode_change", {
    blend_mode: blendMode,
  });
}

/**
 * Track project save
 */
export function trackProjectSave(projectId: string) {
  trackEvent("project_save", {
    project_id: projectId,
  });
}

/**
 * Track project load
 */
export function trackProjectLoad(projectId: string) {
  trackEvent("project_load", {
    project_id: projectId,
  });
}

/**
 * Track upgrade/checkout
 */
export function trackCheckoutStarted(tier: string) {
  trackEvent("begin_checkout", {
    tier,
    currency: "USD",
  });
}

/**
 * Track successful upgrade
 */
export function trackUpgradeComplete(tier: string, value: number) {
  trackEvent("purchase", {
    tier,
    value,
    currency: "USD",
  });
}

/**
 * Track social share
 */
export function trackSocialShare(platform: string) {
  trackEvent("share", {
    method: platform,
    content_type: "image",
  });
}

/**
 * Track template usage
 */
export function trackTemplateUsed(templateName: string) {
  trackEvent("template_used", {
    template_name: templateName,
  });
}

/**
 * Track effect usage
 */
export function trackEffectUsed(effectType: string, effectName: string) {
  trackEvent("effect_used", {
    effect_type: effectType,
    effect_name: effectName,
  });
}

/**
 * Track batch processing
 */
export function trackBatchProcessing(imageCount: number) {
  trackEvent("batch_processing", {
    image_count: imageCount,
  });
}

/**
 * Track background removal
 */
export function trackBackgroundRemoval() {
  trackEvent("background_removal");
}

/**
 * Track GIF creation
 */
export function trackGifCreation(frameCount: number, duration: number) {
  trackEvent("gif_creation", {
    frame_count: frameCount,
    duration_ms: duration,
  });
}

/**
 * Track error
 */
export function trackError(errorMessage: string, errorContext?: string) {
  trackEvent("error", {
    error_message: errorMessage,
    error_context: errorContext,
  });
}
