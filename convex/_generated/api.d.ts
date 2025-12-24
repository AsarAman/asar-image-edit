/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as backgroundRemoval from "../backgroundRemoval.js";
import type * as backgroundRemovalHelpers from "../backgroundRemovalHelpers.js";
import type * as contact from "../contact.js";
import type * as faceRetouch from "../faceRetouch.js";
import type * as faceRetouchHelpers from "../faceRetouchHelpers.js";
import type * as http from "../http.js";
import type * as magicEraser from "../magicEraser.js";
import type * as magicEraserHelpers from "../magicEraserHelpers.js";
import type * as payments from "../payments.js";
import type * as paymentsWebhooks from "../paymentsWebhooks.js";
import type * as projects from "../projects.js";
import type * as subscriptions from "../subscriptions.js";
import type * as testimonials from "../testimonials.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  backgroundRemoval: typeof backgroundRemoval;
  backgroundRemovalHelpers: typeof backgroundRemovalHelpers;
  contact: typeof contact;
  faceRetouch: typeof faceRetouch;
  faceRetouchHelpers: typeof faceRetouchHelpers;
  http: typeof http;
  magicEraser: typeof magicEraser;
  magicEraserHelpers: typeof magicEraserHelpers;
  payments: typeof payments;
  paymentsWebhooks: typeof paymentsWebhooks;
  projects: typeof projects;
  subscriptions: typeof subscriptions;
  testimonials: typeof testimonials;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
