/**
 * Image optimization utilities for compression and resizing
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for jpeg, ignored for png
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CompressionResult {
  blob: Blob;
  url: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Check if image needs compression based on size
 */
export function needsCompression(fileSize: number, fileSizeThresholdMB = 2): boolean {
  return fileSize > fileSizeThresholdMB * 1024 * 1024;
}

/**
 * Compress an image file with mobile-friendly error handling
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    format = file.type === "image/png" ? "image/png" : "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    // Add timeout for mobile devices
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Image compression timeout - file may be too large"));
    }, 15000); // 15 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        // Mobile-specific: reduce max dimensions if original is very large
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const mobileMaxWidth = isMobile ? Math.min(maxWidth, 1600) : maxWidth;
        const mobileMaxHeight = isMobile ? Math.min(maxHeight, 1600) : maxHeight;
        
        if (width > mobileMaxWidth || height > mobileMaxHeight) {
          const ratio = Math.min(mobileMaxWidth / width, mobileMaxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", {
          // Use willReadFrequently for better mobile performance
          willReadFrequently: false,
          alpha: format === "image/png"
        });
        
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw image with better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with error handling
        try {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to create blob - image may be corrupted"));
                return;
              }

              const compressedUrl = URL.createObjectURL(blob);
              const compressionRatio = ((file.size - blob.size) / file.size) * 100;

              resolve({
                blob,
                url: compressedUrl,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio,
              });

              // Cleanup
              URL.revokeObjectURL(url);
            },
            format,
            quality
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas conversion failed - device may be out of memory"));
        }
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = (error) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      console.error("Image load error:", error);
      reject(new Error("Failed to load image - file may be corrupted or invalid format"));
    };

    img.src = url;
  });
}

/**
 * Estimate compressed file size for export
 */
export function estimateExportSize(
  width: number,
  height: number,
  format: "png" | "jpeg",
  quality = 0.92
): number {
  const pixels = width * height;
  
  if (format === "png") {
    // PNG: approximately 3-4 bytes per pixel
    return pixels * 3.5;
  } else {
    // JPEG: varies based on quality
    // quality 0.9-1.0: ~1.5 bytes/pixel
    // quality 0.7-0.9: ~0.8 bytes/pixel
    // quality 0.5-0.7: ~0.4 bytes/pixel
    const bytesPerPixel = quality > 0.9 ? 1.5 : quality > 0.7 ? 0.8 : 0.4;
    return pixels * bytesPerPixel;
  }
}

/**
 * Get size warning level
 */
export function getSizeWarningLevel(
  sizeInBytes: number
): "none" | "warning" | "critical" {
  const sizeMB = sizeInBytes / (1024 * 1024);
  
  if (sizeMB > 10) return "critical";
  if (sizeMB > 5) return "warning";
  return "none";
}
