import { query } from "./_generated/server";

/**
 * Get the Google Analytics 4 Measurement ID
 * This is a public value that's safe to expose to clients
 */
export const getGA4MeasurementId = query({
  args: {},
  handler: async () => {
    // Return the GA4 measurement ID from environment variables
    // If not set, return null to disable analytics
    return process.env.GA4_MEASUREMENT_ID || null;
  },
});
