// GIF.js worker script
// This worker handles GIF encoding in a separate thread to avoid blocking the UI

(function(global) {
  'use strict';

  // Import the GIF.js worker from CDN with fallback
  try {
    importScripts('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
  } catch (e) {
    console.error('Failed to load GIF.js worker from CDN:', e);
    // Fallback - try unpkg CDN
    try {
      importScripts('https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js');
    } catch (e2) {
      console.error('Failed to load GIF.js worker from unpkg:', e2);
    }
  }
})(this);
