import type { LayoutType } from "./LayoutSelector";
import type { BlendMode } from "./BlendModeSelector";
import type { ImageTransparency } from "./TransparencyControls";
import type { VisualEffectsData } from "./VisualEffects";
import type { ImageTransformData } from "./ImageTransform";
import type { FilterSettings } from "./Filters";
import type { OverlaySettings } from "./OverlayControls";
import type { CropData } from "./CropTool";
import type { ImageMask } from "./ImageMasks";

// Helper function to get blend mode for canvas
function getCanvasBlendMode(mode: BlendMode): GlobalCompositeOperation {
  const modeMap: Record<BlendMode, GlobalCompositeOperation> = {
    normal: "source-over",
    multiply: "multiply",
    screen: "screen",
    overlay: "overlay",
    darken: "darken",
    lighten: "lighten",
    "soft-light": "soft-light",
    "hard-light": "hard-light",
  };
  return modeMap[mode];
}

// Helper function to get opacity for an image
function getImageOpacity(
  imageIndex: number,
  transparencies: ImageTransparency[]
): number {
  const transparency = transparencies.find((t) => t.imageIndex === imageIndex);
  return transparency ? transparency.opacity : 1;
}

// Helper to get transform for an image
function getImageTransform(
  imageIndex: number,
  transforms: ImageTransformData[]
): ImageTransformData {
  const existing = transforms.find((t) => t.imageIndex === imageIndex);
  return (
    existing || {
      imageIndex,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    }
  );
}

// Helper function to create CSS filter string
function createFilterString(filters?: FilterSettings): string {
  if (!filters) return "none";
  
  const parts: string[] = [];
  
  if (filters.brightness !== 100) {
    parts.push(`brightness(${filters.brightness}%)`);
  }
  if (filters.contrast !== 100) {
    parts.push(`contrast(${filters.contrast}%)`);
  }
  if (filters.saturation !== 100) {
    parts.push(`saturate(${filters.saturation}%)`);
  }
  if (filters.blur > 0) {
    parts.push(`blur(${filters.blur}px)`);
  }
  if (filters.hueRotate !== 0) {
    parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  }
  if (filters.grayscale > 0) {
    parts.push(`grayscale(${filters.grayscale}%)`);
  }
  if (filters.sepia > 0) {
    parts.push(`sepia(${filters.sepia}%)`);
  }
  if (filters.invert > 0) {
    parts.push(`invert(${filters.invert}%)`);
  }
  
  return parts.length > 0 ? parts.join(" ") : "none";
}

// Helper to get crop for an image
function getImageCrop(
  imageIndex: number,
  crops: CropData[]
): CropData {
  const existing = crops[imageIndex];
  return (
    existing || { x: 0, y: 0, width: 100, height: 100 }
  );
}

// Helper to get mask for an image
function getImageMask(
  imageIndex: number,
  masks: ImageMask[]
): ImageMask | null {
  return masks.find((m) => m.imageIndex === imageIndex) || null;
}

// Helper to create shape mask path
function createShapeMaskPath(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.min(width, height) / 2;

  ctx.beginPath();

  switch (shape) {
    case "circle":
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      break;

    case "square":
      ctx.rect(x, y, width, height);
      break;

    case "heart": {
      // Heart shape
      const topCurveHeight = height * 0.3;
      ctx.moveTo(centerX, y + topCurveHeight);
      // Top left curve
      ctx.bezierCurveTo(
        centerX, y,
        x, y,
        x, y + topCurveHeight
      );
      // Bottom left curve
      ctx.bezierCurveTo(
        x, y + (height + topCurveHeight) / 2,
        centerX, y + (height + topCurveHeight) / 1.5,
        centerX, y + height
      );
      // Bottom right curve
      ctx.bezierCurveTo(
        centerX, y + (height + topCurveHeight) / 1.5,
        x + width, y + (height + topCurveHeight) / 2,
        x + width, y + topCurveHeight
      );
      // Top right curve
      ctx.bezierCurveTo(
        x + width, y,
        centerX, y,
        centerX, y + topCurveHeight
      );
      break;
    }

    case "star": {
      // 5-pointed star
      const spikes = 5;
      const outerRadius = radius;
      const innerRadius = radius * 0.5;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(centerX, centerY - outerRadius);
      for (let i = 0; i < spikes; i++) {
        // Outer point
        let x1 = centerX + Math.cos(rot) * outerRadius;
        let y1 = centerY + Math.sin(rot) * outerRadius;
        ctx.lineTo(x1, y1);
        rot += step;

        // Inner point
        x1 = centerX + Math.cos(rot) * innerRadius;
        y1 = centerY + Math.sin(rot) * innerRadius;
        ctx.lineTo(x1, y1);
        rot += step;
      }
      ctx.lineTo(centerX, centerY - outerRadius);
      break;
    }

    case "pentagon": {
      // Regular pentagon
      const sides = 5;
      const angle = (Math.PI * 2) / sides;
      const startAngle = -Math.PI / 2;
      
      for (let i = 0; i <= sides; i++) {
        const x1 = centerX + radius * Math.cos(startAngle + i * angle);
        const y1 = centerY + radius * Math.sin(startAngle + i * angle);
        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
      }
      break;
    }

    case "hexagon": {
      // Regular hexagon
      const sides = 6;
      const angle = (Math.PI * 2) / sides;
      const startAngle = 0;
      
      for (let i = 0; i <= sides; i++) {
        const x1 = centerX + radius * Math.cos(startAngle + i * angle);
        const y1 = centerY + radius * Math.sin(startAngle + i * angle);
        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
      }
      break;
    }

    default:
      // No mask
      ctx.rect(x, y, width, height);
  }

  ctx.closePath();
}

// Helper to create gradient mask
function createGradientMask(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  direction: string,
  startOpacity: number,
  endOpacity: number
): CanvasGradient {
  let gradient: CanvasGradient;

  switch (direction) {
    case "horizontal":
      gradient = ctx.createLinearGradient(x, y, x + width, y);
      break;
    case "vertical":
      gradient = ctx.createLinearGradient(x, y, x, y + height);
      break;
    case "diagonal":
      gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      break;
    case "radial":
      gradient = ctx.createRadialGradient(
        x + width / 2,
        y + height / 2,
        0,
        x + width / 2,
        y + height / 2,
        Math.max(width, height) / 2
      );
      break;
    default:
      gradient = ctx.createLinearGradient(x, y, x + width, y);
  }

  gradient.addColorStop(0, `rgba(0, 0, 0, ${startOpacity})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${endOpacity})`);

  return gradient;
}

// Helper function to draw image with blend mode, transparency, effects, transforms, crop, and masks
function drawImageWithEffects(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  imageIndex: number,
  blendMode: BlendMode,
  transparencies: ImageTransparency[],
  visualEffects: VisualEffectsData,
  imageTransforms: ImageTransformData[],
  crops: CropData[],
  masks: ImageMask[],
  filterSettings?: FilterSettings
) {
  const transform = getImageTransform(imageIndex, imageTransforms);
  const crop = getImageCrop(imageIndex, crops);
  const mask = getImageMask(imageIndex, masks);

  ctx.save();
  
  // Apply filters
  ctx.filter = createFilterString(filterSettings);
  
  // Apply blend mode and opacity
  ctx.globalCompositeOperation = getCanvasBlendMode(blendMode);
  ctx.globalAlpha = getImageOpacity(imageIndex, transparencies);

  // Apply shadow
  if (visualEffects.shadowBlur > 0) {
    ctx.shadowColor = visualEffects.shadowColor;
    ctx.shadowBlur = visualEffects.shadowBlur;
    ctx.shadowOffsetX = visualEffects.shadowOffsetX;
    ctx.shadowOffsetY = visualEffects.shadowOffsetY;
  }

  // Apply transformations
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  ctx.translate(centerX, centerY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(
    transform.flipHorizontal ? -1 : 1,
    transform.flipVertical ? -1 : 1
  );

  // Calculate crop coordinates
  const sx = (crop.x / 100) * img.naturalWidth;
  const sy = (crop.y / 100) * img.naturalHeight;
  const sWidth = (crop.width / 100) * img.naturalWidth;
  const sHeight = (crop.height / 100) * img.naturalHeight;

  // If gradient mask is enabled, we need to draw on a temporary canvas first
  // to prevent the mask from affecting other images on the main canvas
  if (mask && mask.gradientEnabled) {
    // Create temporary canvas for this image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    
    if (tempCtx) {
      // Draw the image on temp canvas (centered)
      tempCtx.save();
      
      // Apply shape mask on temp canvas if exists
      if (mask.shape !== "none") {
        createShapeMaskPath(tempCtx, mask.shape, 0, 0, width, height);
        if (mask.invert) {
          tempCtx.rect(-width, -height, width * 3, height * 3);
          tempCtx.clip("evenodd");
        } else {
          tempCtx.clip();
        }
      }
      
      // Draw with border and corner radius on temp canvas
      if (visualEffects.cornerRadius > 0 || visualEffects.borderWidth > 0) {
        const radius = visualEffects.cornerRadius;
        const borderWidth = visualEffects.borderWidth;

        tempCtx.beginPath();
        tempCtx.moveTo(radius, 0);
        tempCtx.lineTo(width - radius, 0);
        tempCtx.arcTo(width, 0, width, radius, radius);
        tempCtx.lineTo(width, height - radius);
        tempCtx.arcTo(width, height, width - radius, height, radius);
        tempCtx.lineTo(radius, height);
        tempCtx.arcTo(0, height, 0, height - radius, radius);
        tempCtx.lineTo(0, radius);
        tempCtx.arcTo(0, 0, radius, 0, radius);
        tempCtx.closePath();
        
        tempCtx.clip();
        tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

        if (borderWidth > 0) {
          tempCtx.strokeStyle = visualEffects.borderColor;
          tempCtx.lineWidth = borderWidth;
          tempCtx.stroke();
        }
      } else {
        tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
      }
      
      tempCtx.restore();
      
      // Now apply gradient mask on temp canvas only
      tempCtx.globalCompositeOperation = "destination-in";
      tempCtx.fillStyle = createGradientMask(
        tempCtx,
        0,
        0,
        width,
        height,
        mask.gradientDirection,
        mask.gradientStart / 100,
        mask.gradientEnd / 100
      );
      tempCtx.fillRect(0, 0, width, height);
      
      // Draw the masked image from temp canvas to main canvas
      ctx.drawImage(tempCanvas, -width / 2, -height / 2);
    }
  } else {
    // No gradient mask, draw normally
    
    // Apply shape mask if exists
    if (mask && mask.shape !== "none") {
      // Create mask path
      createShapeMaskPath(ctx, mask.shape, -width / 2, -height / 2, width, height);
      
      if (mask.invert) {
        // Invert mask by clipping to everything except the shape
        ctx.rect(-width * 2, -height * 2, width * 4, height * 4);
        ctx.clip("evenodd");
      } else {
        ctx.clip();
      }
    }

    // Draw with border and corner radius
    if (visualEffects.cornerRadius > 0 || visualEffects.borderWidth > 0) {
      const radius = visualEffects.cornerRadius;
      const borderWidth = visualEffects.borderWidth;

      // Draw rounded rectangle path
      ctx.beginPath();
      ctx.moveTo(-width / 2 + radius, -height / 2);
      ctx.lineTo(width / 2 - radius, -height / 2);
      ctx.arcTo(width / 2, -height / 2, width / 2, -height / 2 + radius, radius);
      ctx.lineTo(width / 2, height / 2 - radius);
      ctx.arcTo(width / 2, height / 2, width / 2 - radius, height / 2, radius);
      ctx.lineTo(-width / 2 + radius, height / 2);
      ctx.arcTo(-width / 2, height / 2, -width / 2, height / 2 - radius, radius);
      ctx.lineTo(-width / 2, -height / 2 + radius);
      ctx.arcTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2, radius);
      ctx.closePath();
      
      ctx.clip();
      ctx.drawImage(img, sx, sy, sWidth, sHeight, -width / 2, -height / 2, width, height);

      // Draw border
      if (borderWidth > 0) {
        ctx.strokeStyle = visualEffects.borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();
      }
    } else {
      ctx.drawImage(img, sx, sy, sWidth, sHeight, -width / 2, -height / 2, width, height);
    }
  }

  ctx.restore();
}

export function drawLayout(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  layout: LayoutType,
  canvasWidth: number,
  canvasHeight: number,
  visualEffects: VisualEffectsData,
  imageTransforms: ImageTransformData[],
  crops: CropData[],
  masks: ImageMask[],
  filterSettings?: FilterSettings,
  overlaySettings?: OverlaySettings,
  blendMode: BlendMode = "normal",
  transparencies: ImageTransparency[] = []
) {
  const padding = visualEffects.margin || 20;

  switch (layout) {
    case "single": {
      // Single centered image
      const img = images[0];
      if (!img) {
        console.error("drawLayout: No image provided for single layout");
        return;
      }
      
      // Validate image dimensions
      if (!img.width || !img.height || img.width <= 0 || img.height <= 0) {
        console.error("drawLayout: Invalid image dimensions", { width: img.width, height: img.height });
        return;
      }
      
      // Calculate dimensions to fit within canvas while maintaining aspect ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = canvasWidth / canvasHeight;
      
      let drawWidth = canvasWidth - padding * 2;
      let drawHeight = canvasHeight - padding * 2;
      
      if (imgAspect > canvasAspect) {
        drawHeight = drawWidth / imgAspect;
      } else {
        drawWidth = drawHeight * imgAspect;
      }
      
      // Validate calculated dimensions
      if (!drawWidth || !drawHeight || drawWidth <= 0 || drawHeight <= 0) {
        console.error("drawLayout: Invalid calculated dimensions", { drawWidth, drawHeight, imgAspect, canvasAspect });
        return;
      }
      
      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;
      
      console.log("drawLayout: Drawing single image", {
        imgSize: { w: img.width, h: img.height },
        drawSize: { w: drawWidth, h: drawHeight },
        position: { x, y }
      });
      
      drawImageWithEffects(
        ctx,
        img,
        x,
        y,
        drawWidth,
        drawHeight,
        0,
        blendMode,
        transparencies,
        visualEffects,
        imageTransforms,
        crops,
        masks,
        filterSettings
      );
      break;
    }
    
    case "horizontal": {
      // Side by side horizontal
      const imageWidth = (canvasWidth - padding * (images.length + 1)) / images.length;
      const imageHeight = canvasHeight - padding * 2;

      images.forEach((img, index) => {
        const x = padding + index * (imageWidth + padding);
        const y = padding;

        // Calculate aspect ratio fit
        const scale = Math.min(imageWidth / img.width, imageHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center in allocated space
        const offsetX = (imageWidth - scaledWidth) / 2;
        const offsetY = (imageHeight - scaledHeight) / 2;

        drawImageWithEffects(
          ctx,
          img,
          x + offsetX,
          y + offsetY,
          scaledWidth,
          scaledHeight,
          index,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );
      });
      break;
    }

    case "vertical": {
      // Vertical top to bottom
      const imageHeight = (canvasHeight - padding * (images.length + 1)) / images.length;
      const imageWidth = canvasWidth - padding * 2;

      images.forEach((img, index) => {
        const x = padding;
        const y = padding + index * (imageHeight + padding);

        // Calculate aspect ratio fit
        const scale = Math.min(imageWidth / img.width, imageHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center in allocated space
        const offsetX = (imageWidth - scaledWidth) / 2;
        const offsetY = (imageHeight - scaledHeight) / 2;

        drawImageWithEffects(
          ctx,
          img,
          x + offsetX,
          y + offsetY,
          scaledWidth,
          scaledHeight,
          index,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );
      });
      break;
    }

    case "grid": {
      // Dynamic grid layout for 2-8 images
      const imageCount = images.length;
      
      // Calculate optimal grid dimensions
      let cols = 2;
      let rows = 2;
      
      if (imageCount <= 2) {
        cols = imageCount;
        rows = 1;
      } else if (imageCount <= 4) {
        cols = 2;
        rows = Math.ceil(imageCount / 2);
      } else if (imageCount <= 6) {
        cols = 3;
        rows = Math.ceil(imageCount / 3);
      } else {
        cols = Math.ceil(Math.sqrt(imageCount));
        rows = Math.ceil(imageCount / cols);
      }

      const cellWidth = (canvasWidth - padding * (cols + 1)) / cols;
      const cellHeight = (canvasHeight - padding * (rows + 1)) / rows;

      images.forEach((img, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        const cellX = padding + col * (cellWidth + padding);
        const cellY = padding + row * (cellHeight + padding);

        // Scale image to fit cell
        const scale = Math.min(cellWidth / img.width, cellHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center in cell
        const offsetX = (cellWidth - scaledWidth) / 2;
        const offsetY = (cellHeight - scaledHeight) / 2;

        drawImageWithEffects(
          ctx,
          img,
          cellX + offsetX,
          cellY + offsetY,
          scaledWidth,
          scaledHeight,
          index,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );
      });
      break;
    }

    case "collage1": {
      // Creative overlapping layout - displays all images in scattered arrangement
      if (images.length >= 2) {
        // Define positions and sizes for each image slot (up to 8)
        const positions = [
          { x: 0.1, y: 0.15, width: 0.5, height: 0.55, rotation: -5 },   // Large left
          { x: 0.45, y: 0.5, width: 0.45, height: 0.45, rotation: 8 },   // Medium right-bottom
          { x: 0.55, y: 0.05, width: 0.35, height: 0.35, rotation: -3 }, // Small top-right
          { x: 0.05, y: 0.65, width: 0.3, height: 0.3, rotation: 5 },    // Small bottom-left
          { x: 0.65, y: 0.45, width: 0.25, height: 0.25, rotation: -8 }, // Tiny right-center
          { x: 0.25, y: 0.05, width: 0.25, height: 0.25, rotation: 4 },  // Tiny top-center
          { x: 0.35, y: 0.7, width: 0.25, height: 0.25, rotation: -6 },  // Tiny bottom-center
          { x: 0.75, y: 0.15, width: 0.2, height: 0.2, rotation: 10 },   // Tiny far-right
        ];

        images.forEach((img, index) => {
          const pos = positions[index];
          if (!pos) return; // Skip if more than 8 images

          const imgWidth = canvasWidth * pos.width;
          const imgHeight = canvasHeight * pos.height;
          const scale = Math.min(imgWidth / img.width, imgHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          const x = canvasWidth * pos.x;
          const y = canvasHeight * pos.y;

          ctx.save();
          ctx.filter = createFilterString(filterSettings);
          ctx.globalCompositeOperation = getCanvasBlendMode(blendMode);
          ctx.globalAlpha = getImageOpacity(index, transparencies);
          
          // Translate and rotate
          ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
          ctx.rotate((pos.rotation * Math.PI) / 180);
          
          // Shadow
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 15 + index * 2;
          ctx.shadowOffsetX = 8;
          ctx.shadowOffsetY = 8;
          
          // Apply crop
          const crop = getImageCrop(index, crops);
          const sx = (crop.x / 100) * img.naturalWidth;
          const sy = (crop.y / 100) * img.naturalHeight;
          const sWidth = (crop.width / 100) * img.naturalWidth;
          const sHeight = (crop.height / 100) * img.naturalHeight;
          
          // Apply shape mask if exists
          const mask = getImageMask(index, masks);
          if (mask && mask.shape !== "none") {
            createShapeMaskPath(ctx, mask.shape, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
            if (mask.invert) {
              ctx.rect(-scaledWidth * 2, -scaledHeight * 2, scaledWidth * 4, scaledHeight * 4);
              ctx.clip("evenodd");
            } else {
              ctx.clip();
            }
          }
          
          ctx.drawImage(img, sx, sy, sWidth, sHeight, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
          
          // Apply gradient mask if enabled
          if (mask && mask.gradientEnabled) {
            ctx.globalCompositeOperation = "destination-in";
            ctx.fillStyle = createGradientMask(
              ctx,
              -scaledWidth / 2,
              -scaledHeight / 2,
              scaledWidth,
              scaledHeight,
              mask.gradientDirection,
              mask.gradientStart / 100,
              mask.gradientEnd / 100
            );
            ctx.fillRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
          }
          
          ctx.restore();
        });
      }
      break;
    }

    case "collage2": {
      // Magazine-style arrangement - main image on left, stack on right
      if (images.length >= 2) {
        // First image - large on the left (60% width)
        const img1 = images[0];
        const leftWidth = canvasWidth * 0.6 - padding * 1.5;
        const leftHeight = canvasHeight - padding * 2;
        const scale1 = Math.min(leftWidth / img1.width, leftHeight / img1.height);
        const scaled1Width = img1.width * scale1;
        const scaled1Height = img1.height * scale1;

        drawImageWithEffects(
          ctx,
          img1,
          padding,
          padding + (leftHeight - scaled1Height) / 2,
          scaled1Width,
          scaled1Height,
          0,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );

        // Right column - stack remaining images (40% width)
        const rightColWidth = canvasWidth * 0.4 - padding * 1.5;
        const rightX = canvasWidth * 0.6 + padding * 0.5;
        const remainingImages = images.slice(1);
        const cellHeight = (canvasHeight - padding * (remainingImages.length + 1)) / remainingImages.length;

        remainingImages.forEach((img, idx) => {
          const actualIndex = idx + 1;
          const cellY = padding + idx * (cellHeight + padding);

          const scale = Math.min(rightColWidth / img.width, cellHeight / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          const offsetX = (rightColWidth - scaledWidth) / 2;
          const offsetY = (cellHeight - scaledHeight) / 2;

          drawImageWithEffects(
            ctx,
            img,
            rightX + offsetX,
            cellY + offsetY,
            scaledWidth,
            scaledHeight,
            actualIndex,
            blendMode,
            transparencies,
            visualEffects,
            imageTransforms,
            crops,
            masks,
            filterSettings
          );
        });
      }
      break;
    }

    case "overlay": {
      // Overlay mode - layer images on top of each other
      if (images.length >= 2 && overlaySettings) {
        // Draw base image (first image) - full canvas
        const baseImg = images[0];
        const baseWidth = canvasWidth - padding * 2;
        const baseHeight = canvasHeight - padding * 2;
        const baseScale = Math.min(baseWidth / baseImg.width, baseHeight / baseImg.height);
        const scaledBaseWidth = baseImg.width * baseScale;
        const scaledBaseHeight = baseImg.height * baseScale;

        const baseX = padding + (baseWidth - scaledBaseWidth) / 2;
        const baseY = padding + (baseHeight - scaledBaseHeight) / 2;

        drawImageWithEffects(
          ctx,
          baseImg,
          baseX,
          baseY,
          scaledBaseWidth,
          scaledBaseHeight,
          0,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );

        // Draw overlay image (second image) with transforms
        const overlayImg = images[1];
        const overlayMaxWidth = canvasWidth * 0.6;
        const overlayMaxHeight = canvasHeight * 0.6;
        const overlayScale = Math.min(
          overlayMaxWidth / overlayImg.width,
          overlayMaxHeight / overlayImg.height
        );
        const baseOverlayWidth = overlayImg.width * overlayScale;
        const baseOverlayHeight = overlayImg.height * overlayScale;

        // Apply user settings
        const finalWidth = baseOverlayWidth * overlaySettings.scale;
        const finalHeight = baseOverlayHeight * overlaySettings.scale;

        // Center position + user offsets
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        ctx.save();
        ctx.filter = createFilterString(filterSettings);
        ctx.globalCompositeOperation = getCanvasBlendMode(blendMode);
        // Combine overlay opacity with transparency setting
        ctx.globalAlpha = overlaySettings.opacity * getImageOpacity(1, transparencies);

        // Apply transformations
        ctx.translate(centerX + overlaySettings.x, centerY + overlaySettings.y);
        ctx.rotate((overlaySettings.rotation * Math.PI) / 180);

        // Add shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Apply crop for overlay image
        const overlayCrop = getImageCrop(1, crops);
        const osx = (overlayCrop.x / 100) * overlayImg.naturalWidth;
        const osy = (overlayCrop.y / 100) * overlayImg.naturalHeight;
        const osWidth = (overlayCrop.width / 100) * overlayImg.naturalWidth;
        const osHeight = (overlayCrop.height / 100) * overlayImg.naturalHeight;

        ctx.drawImage(
          overlayImg,
          osx,
          osy,
          osWidth,
          osHeight,
          -finalWidth / 2,
          -finalHeight / 2,
          finalWidth,
          finalHeight
        );

        ctx.restore();
      }
      break;
    }

    case "diagonal": {
      // Diagonal layout - images arranged diagonally from top-left to bottom-right
      const imageSize = Math.min(canvasWidth, canvasHeight) * 0.35;
      const step = (Math.min(canvasWidth, canvasHeight) - imageSize) / (images.length || 1);

      images.forEach((img, index) => {
        const x = padding + step * index;
        const y = padding + step * index;

        const scale = Math.min(imageSize / img.width, imageSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        drawImageWithEffects(
          ctx,
          img,
          x,
          y,
          scaledWidth,
          scaledHeight,
          index,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );
      });
      break;
    }

    case "circular": {
      // Circular layout - images arranged in a circle
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
      const imageSize = Math.min(canvasWidth, canvasHeight) * 0.25;

      images.forEach((img, index) => {
        const angle = (index / images.length) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius - imageSize / 2;
        const y = centerY + Math.sin(angle) * radius - imageSize / 2;

        const scale = Math.min(imageSize / img.width, imageSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        drawImageWithEffects(
          ctx,
          img,
          x,
          y,
          scaledWidth,
          scaledHeight,
          index,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );
      });
      break;
    }

    case "stacked": {
      // Stacked polaroid-style layout
      const baseWidth = Math.min(canvasWidth, canvasHeight) * 0.5;
      const baseHeight = baseWidth * 1.1; // Polaroid proportions
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const rotationStep = 12; // degrees between each photo

      images.forEach((img, index) => {
        const rotation = (index - Math.floor(images.length / 2)) * rotationStep;
        const offsetX = (index - Math.floor(images.length / 2)) * 15;
        const offsetY = (index - Math.floor(images.length / 2)) * 10;

        const scale = Math.min((baseWidth * 0.85) / img.width, (baseHeight * 0.75) / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        ctx.save();
        ctx.translate(centerX + offsetX, centerY + offsetY);
        ctx.rotate((rotation * Math.PI) / 180);

        // Draw polaroid frame
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.fillRect(-baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);

        // Reset shadow for image
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Apply filters and effects
        ctx.filter = createFilterString(filterSettings);
        ctx.globalCompositeOperation = getCanvasBlendMode(blendMode);
        ctx.globalAlpha = getImageOpacity(index, transparencies);

        // Apply crop
        const crop = getImageCrop(index, crops);
        const sx = (crop.x / 100) * img.naturalWidth;
        const sy = (crop.y / 100) * img.naturalHeight;
        const sWidth = (crop.width / 100) * img.naturalWidth;
        const sHeight = (crop.height / 100) * img.naturalHeight;

        // Draw image centered in polaroid
        ctx.drawImage(
          img,
          sx,
          sy,
          sWidth,
          sHeight,
          -scaledWidth / 2,
          -scaledHeight / 2 - baseHeight * 0.05,
          scaledWidth,
          scaledHeight
        );

        ctx.restore();
      });
      break;
    }

    case "mosaic": {
      // Mosaic layout - artistic asymmetric arrangement
      const positions = [
        { x: 0.05, y: 0.05, width: 0.4, height: 0.55 },    // Large left
        { x: 0.5, y: 0.05, width: 0.45, height: 0.35 },    // Medium top-right
        { x: 0.5, y: 0.45, width: 0.25, height: 0.5 },     // Tall right-bottom
        { x: 0.05, y: 0.65, width: 0.4, height: 0.3 },     // Wide bottom-left
        { x: 0.78, y: 0.45, width: 0.17, height: 0.25 },   // Small right-mid
        { x: 0.78, y: 0.73, width: 0.17, height: 0.22 },   // Small right-bottom
        { x: 0.3, y: 0.42, width: 0.15, height: 0.2 },     // Floating small
        { x: 0.62, y: 0.15, width: 0.12, height: 0.15 },   // Tiny accent
      ];

      images.forEach((img, index) => {
        const pos = positions[index];
        if (!pos) return;

        const x = canvasWidth * pos.x;
        const y = canvasHeight * pos.y;
        const targetWidth = canvasWidth * pos.width;
        const targetHeight = canvasHeight * pos.height;

        const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const offsetX = (targetWidth - scaledWidth) / 2;
        const offsetY = (targetHeight - scaledHeight) / 2;

        drawImageWithEffects(
          ctx,
          img,
          x + offsetX,
          y + offsetY,
          scaledWidth,
          scaledHeight,
          index,
          blendMode,
          transparencies,
          visualEffects,
          imageTransforms,
          crops,
          masks,
          filterSettings
        );
      });
      break;
    }
  }
}

// Text Layer Interface
export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  strokeWidth: number;
  strokeColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  behindImages: boolean;
}

// Function to draw text layers on canvas
export function drawTextLayers(
  ctx: CanvasRenderingContext2D,
  textLayers: TextLayer[],
  canvasWidth: number,
  canvasHeight: number
) {
  textLayers.forEach((layer) => {
    ctx.save();

    // Calculate position (percentage to pixels)
    const x = (layer.x / 100) * canvasWidth;
    const y = (layer.y / 100) * canvasHeight;

    // Set font
    const fontStyle = `${layer.italic ? "italic" : ""} ${layer.bold ? "bold" : ""} ${layer.fontSize}px ${layer.fontFamily}`.trim();
    ctx.font = fontStyle;
    ctx.textAlign = layer.align;
    ctx.textBaseline = "middle";

    // Set shadow
    if (layer.shadowBlur > 0) {
      ctx.shadowColor = layer.shadowColor;
      ctx.shadowBlur = layer.shadowBlur;
      ctx.shadowOffsetX = layer.shadowOffsetX;
      ctx.shadowOffsetY = layer.shadowOffsetY;
    }

    // Draw stroke (outline)
    if (layer.strokeWidth > 0) {
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineWidth = layer.strokeWidth;
      ctx.strokeText(layer.text, x, y);
    }

    // Draw fill text
    ctx.fillStyle = layer.color;
    ctx.fillText(layer.text, x, y);

    ctx.restore();
  });
}

// Helper function to separate text layers by z-order
export function separateTextLayers(textLayers: TextLayer[]): {
  behindLayers: TextLayer[];
  frontLayers: TextLayer[];
} {
  return {
    behindLayers: textLayers.filter((layer) => layer.behindImages),
    frontLayers: textLayers.filter((layer) => !layer.behindImages),
  };
}

// Sticker Layer Interface
export interface StickerLayer {
  id: string;
  type: string;
  emoji: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

// Function to draw sticker layers on canvas
export function drawStickerLayers(
  ctx: CanvasRenderingContext2D,
  stickerLayers: StickerLayer[],
  canvasWidth: number,
  canvasHeight: number
) {
  // Sort by zIndex to draw in correct order
  const sortedLayers = [...stickerLayers].sort((a, b) => a.zIndex - b.zIndex);
  
  sortedLayers.forEach((layer) => {
    ctx.save();

    // Calculate position (percentage to pixels)
    const x = (layer.x / 100) * canvasWidth;
    const y = (layer.y / 100) * canvasHeight;

    // Set opacity
    ctx.globalAlpha = layer.opacity;

    // Move to position and rotate
    ctx.translate(x, y);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    // Set font size for emoji
    ctx.font = `${layer.height}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw emoji/sticker
    ctx.fillText(layer.emoji, 0, 0);

    ctx.restore();
  });
}

// Drawing Stroke Interface
export interface DrawingStroke {
  id: string;
  tool: "pen" | "line" | "arrow" | "rectangle" | "circle" | "highlighter";
  color: string;
  size: number;
  opacity: number;
  points: { x: number; y: number }[];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
}

// Function to draw annotation strokes on canvas
export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  strokes: DrawingStroke[],
  canvasWidth: number,
  canvasHeight: number
) {
  strokes.forEach((stroke) => {
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.globalAlpha = stroke.opacity;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (stroke.tool) {
      case "pen":
        if (stroke.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "highlighter":
        ctx.globalAlpha = stroke.opacity * 0.4;
        ctx.lineWidth = stroke.size * 1.5;
        if (stroke.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "line":
        if (stroke.startPoint && stroke.endPoint) {
          ctx.beginPath();
          ctx.moveTo(stroke.startPoint.x, stroke.startPoint.y);
          ctx.lineTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.stroke();
        }
        break;

      case "arrow":
        if (stroke.startPoint && stroke.endPoint) {
          const headLength = stroke.size * 3;
          const dx = stroke.endPoint.x - stroke.startPoint.x;
          const dy = stroke.endPoint.y - stroke.startPoint.y;
          const angle = Math.atan2(dy, dx);

          ctx.beginPath();
          ctx.moveTo(stroke.startPoint.x, stroke.startPoint.y);
          ctx.lineTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.lineTo(
            stroke.endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
            stroke.endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(stroke.endPoint.x, stroke.endPoint.y);
          ctx.lineTo(
            stroke.endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
            stroke.endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (stroke.startPoint && stroke.endPoint) {
          const x = Math.min(stroke.startPoint.x, stroke.endPoint.x);
          const y = Math.min(stroke.startPoint.y, stroke.endPoint.y);
          const w = Math.abs(stroke.endPoint.x - stroke.startPoint.x);
          const h = Math.abs(stroke.endPoint.y - stroke.startPoint.y);
          ctx.strokeRect(x, y, w, h);
        }
        break;

      case "circle":
        if (stroke.startPoint && stroke.endPoint) {
          const centerX = stroke.startPoint.x;
          const centerY = stroke.startPoint.y;
          const radius = Math.sqrt(
            Math.pow(stroke.endPoint.x - stroke.startPoint.x, 2) +
              Math.pow(stroke.endPoint.y - stroke.startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  });
}

// Double Exposure Types
export interface DoubleExposureSettings {
  enabled: boolean;
  baseImageIndex: number;
  overlayImageIndex: number;
  blendMode: "screen" | "multiply" | "overlay" | "lighten" | "darken" | "soft-light" | "hard-light" | "difference" | "exclusion";
  opacity: number;
  overlayScale: number;
  overlayX: number;
  overlayY: number;
  overlayRotation: number;
  invert: boolean;
}

// Draw double exposure effect
export function drawDoubleExposure(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  canvasWidth: number,
  canvasHeight: number,
  settings: DoubleExposureSettings
) {
  if (!settings.enabled || images.length < 2) return;

  const baseImg = images[settings.baseImageIndex];
  const overlayImg = images[settings.overlayImageIndex];

  if (!baseImg || !overlayImg) return;

  ctx.save();

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw base image (centered and fitted)
  const baseAspect = baseImg.width / baseImg.height;
  const canvasAspect = canvasWidth / canvasHeight;
  
  let baseWidth = canvasWidth;
  let baseHeight = canvasHeight;
  
  if (baseAspect > canvasAspect) {
    baseHeight = canvasWidth / baseAspect;
  } else {
    baseWidth = canvasHeight * baseAspect;
  }
  
  const baseX = (canvasWidth - baseWidth) / 2;
  const baseY = (canvasHeight - baseHeight) / 2;

  ctx.drawImage(baseImg, baseX, baseY, baseWidth, baseHeight);

  // Apply double exposure blend
  ctx.globalCompositeOperation = settings.blendMode;
  ctx.globalAlpha = settings.opacity / 100;

  // Calculate overlay dimensions with scale
  const overlayAspect = overlayImg.width / overlayImg.height;
  let overlayWidth = canvasWidth * (settings.overlayScale / 100);
  let overlayHeight = canvasHeight * (settings.overlayScale / 100);
  
  if (overlayAspect > canvasAspect) {
    overlayHeight = overlayWidth / overlayAspect;
  } else {
    overlayWidth = overlayHeight * overlayAspect;
  }

  // Calculate overlay position (centered + offsets)
  const overlayX = (canvasWidth - overlayWidth) / 2 + settings.overlayX;
  const overlayY = (canvasHeight - overlayHeight) / 2 + settings.overlayY;

  // Apply rotation if needed
  if (settings.overlayRotation !== 0) {
    const centerX = overlayX + overlayWidth / 2;
    const centerY = overlayY + overlayHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((settings.overlayRotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Apply invert filter if enabled
  if (settings.invert) {
    ctx.filter = "invert(100%)";
  }

  // Draw overlay image
  ctx.drawImage(overlayImg, overlayX, overlayY, overlayWidth, overlayHeight);

  ctx.restore();
}

// Light Leak Overlay type
export interface LightLeakOverlay {
  id: string;
  type: string;
  url: string;
  opacity: number;
  blendMode: "screen" | "overlay" | "soft-light" | "lighten" | "normal";
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

// Function to draw light leak overlays
export async function drawLightLeakOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: LightLeakOverlay[],
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  for (const overlay of overlays) {
    try {
      // Load overlay image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = overlay.url;
      });

      ctx.save();

      // Set blend mode
      const blendModeMap: Record<LightLeakOverlay["blendMode"], GlobalCompositeOperation> = {
        screen: "screen",
        overlay: "overlay",
        "soft-light": "soft-light",
        lighten: "lighten",
        normal: "source-over",
      };
      ctx.globalCompositeOperation = blendModeMap[overlay.blendMode];
      ctx.globalAlpha = overlay.opacity / 100;

      // Calculate dimensions with scale
      const scaledWidth = (canvasWidth * overlay.scale) / 100;
      const scaledHeight = (img.height / img.width) * scaledWidth;

      // Calculate position (percentage to pixels)
      const x = (canvasWidth * overlay.x) / 100 - scaledWidth / 2;
      const y = (canvasHeight * overlay.y) / 100 - scaledHeight / 2;

      // Apply rotation if needed
      if (overlay.rotation !== 0) {
        const centerX = x + scaledWidth / 2;
        const centerY = y + scaledHeight / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      // Draw overlay
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      ctx.restore();
    } catch (error) {
      console.error("Failed to load light leak overlay:", overlay.url, error);
    }
  }
}

// Shadow Settings type (re-export for convenience)
export interface ShadowSettingsType {
  enabled: boolean;
  type: "drop" | "inner" | "angle" | "curved";
  blur: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
  spread: number;
  angle: number;
  distance: number;
  curve: number;
}

// Function to apply shadows to canvas
export function applyShadows(
  canvas: HTMLCanvasElement,
  shadowSettings: ShadowSettingsType
): void {
  console.log("applyShadows called with:", shadowSettings);
  
  if (!shadowSettings.enabled) {
    console.log("Shadow disabled, returning early");
    return;
  }
  
  console.log("Applying shadow effect, type:", shadowSettings.type);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Parse shadow color and apply opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const shadowColor = hexToRgba(shadowSettings.color, shadowSettings.opacity);

  ctx.save();

  if (shadowSettings.type === "drop") {
    // Drop shadow - apply to the whole canvas
    // Get current canvas state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create temp canvas to hold the shadow
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = canvas.width + Math.abs(shadowSettings.offsetX) * 2 + shadowSettings.blur * 2;
    shadowCanvas.height = canvas.height + Math.abs(shadowSettings.offsetY) * 2 + shadowSettings.blur * 2;
    const shadowCtx = shadowCanvas.getContext("2d");
    
    if (shadowCtx) {
      // Draw with shadow on temp canvas
      shadowCtx.shadowColor = shadowColor;
      shadowCtx.shadowBlur = shadowSettings.blur;
      shadowCtx.shadowOffsetX = shadowSettings.offsetX + shadowSettings.blur;
      shadowCtx.shadowOffsetY = shadowSettings.offsetY + shadowSettings.blur;
      
      // Draw the image data with shadow
      shadowCtx.putImageData(imageData, shadowSettings.blur, shadowSettings.blur);
      
      // Clear main canvas and draw shadow canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(shadowCanvas, -shadowSettings.blur, -shadowSettings.blur);
    }
    
  } else if (shadowSettings.type === "angle") {
    // Angle shadow - use angle and distance to calculate offset
    const angleRad = (shadowSettings.angle * Math.PI) / 180;
    const offsetX = Math.cos(angleRad) * shadowSettings.distance;
    const offsetY = Math.sin(angleRad) * shadowSettings.distance;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = canvas.width + Math.abs(offsetX) * 2 + shadowSettings.blur * 2;
    shadowCanvas.height = canvas.height + Math.abs(offsetY) * 2 + shadowSettings.blur * 2;
    const shadowCtx = shadowCanvas.getContext("2d");
    
    if (shadowCtx) {
      shadowCtx.shadowColor = shadowColor;
      shadowCtx.shadowBlur = shadowSettings.blur;
      shadowCtx.shadowOffsetX = offsetX + shadowSettings.blur;
      shadowCtx.shadowOffsetY = offsetY + shadowSettings.blur;
      
      shadowCtx.putImageData(imageData, shadowSettings.blur, shadowSettings.blur);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(shadowCanvas, -shadowSettings.blur, -shadowSettings.blur);
    }
    
  } else if (shadowSettings.type === "curved") {
    // Curved shadow - create a curved shadow effect at the bottom
    const curveHeight = Math.max(20, (canvas.height * shadowSettings.curve) / 100);
    
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = shadowColor;
    ctx.filter = `blur(${shadowSettings.blur}px)`;

    // Create curved shadow path
    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2,
      canvas.height - curveHeight / 2,
      (canvas.width * 0.8) / 2,
      curveHeight / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.filter = "none";
    ctx.restore();
    
  } else if (shadowSettings.type === "inner") {
    // Inner shadow effect
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Create shadow overlay
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = canvas.width;
    shadowCanvas.height = canvas.height;
    const shadowCtx = shadowCanvas.getContext("2d");
    
    if (shadowCtx) {
      // Fill with shadow color
      shadowCtx.fillStyle = shadowColor;
      shadowCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply blur
      shadowCtx.filter = `blur(${shadowSettings.blur}px)`;
      shadowCtx.drawImage(shadowCanvas, 0, 0);
      shadowCtx.filter = "none";
      
      // Shift for offset
      shadowCtx.clearRect(0, 0, canvas.width, canvas.height);
      shadowCtx.fillStyle = shadowColor;
      shadowCtx.fillRect(
        -shadowSettings.offsetX,
        -shadowSettings.offsetY,
        canvas.width,
        canvas.height
      );
      shadowCtx.filter = `blur(${shadowSettings.blur}px)`;
      shadowCtx.drawImage(shadowCanvas, 0, 0);
      
      // Composite with original content
      ctx.globalCompositeOperation = "source-atop";
      ctx.drawImage(shadowCanvas, 0, 0);
    }
  }

  ctx.restore();
}

// Bokeh Settings type
export interface BokehSettingsType {
  enabled: boolean;
  intensity: number;
  focalPoint: {
    x: number;
    y: number;
  };
  focalSize: number;
  shape: "circle" | "hexagon" | "octagon";
  quality: "low" | "medium" | "high";
}

// Function to apply bokeh/depth-of-field effect to canvas
export function applyBokeh(
  canvas: HTMLCanvasElement,
  bokehSettings: BokehSettingsType
): void {
  if (!bokehSettings.enabled || bokehSettings.intensity === 0) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Calculate focal point in pixels
  const focalX = (canvas.width * bokehSettings.focalPoint.x) / 100;
  const focalY = (canvas.height * bokehSettings.focalPoint.y) / 100;
  const focalRadius = Math.min(canvas.width, canvas.height) * (bokehSettings.focalSize / 100);

  // Quality determines blur strength
  const qualityMap = {
    low: 5,
    medium: 10,
    high: 20,
  };
  const baseBlur = qualityMap[bokehSettings.quality];
  const maxBlur = (bokehSettings.intensity * baseBlur) / 100;

  // Create temporary canvases
  const originalCanvas = document.createElement("canvas");
  originalCanvas.width = canvas.width;
  originalCanvas.height = canvas.height;
  const originalCtx = originalCanvas.getContext("2d");
  if (!originalCtx) return;
  
  // Save original
  originalCtx.drawImage(canvas, 0, 0);

  // Create blurred version
  const blurredCanvas = document.createElement("canvas");
  blurredCanvas.width = canvas.width;
  blurredCanvas.height = canvas.height;
  const blurredCtx = blurredCanvas.getContext("2d");
  if (!blurredCtx) return;
  
  // Apply blur filter
  blurredCtx.filter = `blur(${maxBlur}px)`;
  blurredCtx.drawImage(originalCanvas, 0, 0);
  blurredCtx.filter = "none";

  // Clear main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blurred background
  ctx.drawImage(blurredCanvas, 0, 0);

  // Create radial gradient mask for focal area
  const maxDim = Math.max(canvas.width, canvas.height);
  const gradient = ctx.createRadialGradient(
    focalX, focalY, focalRadius * 0.5,
    focalX, focalY, focalRadius * 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  // Draw sharp focal area with gradient mask
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  
  // Create clipping path with gradient
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  
  // Draw the sharp center with soft edges
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  
  // Use a mask canvas
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext("2d");
  if (maskCtx) {
    maskCtx.fillStyle = gradient;
    maskCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw original with mask
    maskCtx.globalCompositeOperation = "source-in";
    maskCtx.drawImage(originalCanvas, 0, 0);
    
    // Composite onto main canvas
    ctx.drawImage(maskCanvas, 0, 0);
  }
  
  ctx.restore();
}

export interface DuotoneSettingsType {
  enabled: boolean;
  shadowColor: string;
  highlightColor: string;
  intensity: number;
  contrast: number;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

// Apply duotone effect to canvas
export function applyDuotone(canvas: HTMLCanvasElement, settings: DuotoneSettingsType) {
  if (!settings.enabled) return;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Get shadow and highlight colors
  const shadowRgb = hexToRgb(settings.shadowColor);
  const highlightRgb = hexToRgb(settings.highlightColor);
  
  if (!shadowRgb || !highlightRgb) return;

  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Calculate intensity multiplier (0-1)
  const intensity = settings.intensity / 100;
  
  // Calculate contrast adjustment
  const contrastFactor = (settings.contrast / 100 - 0.5) * 2 + 1;

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Calculate luminance (grayscale value)
    let luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Apply contrast adjustment
    luminance = ((luminance / 255 - 0.5) * contrastFactor + 0.5) * 255;
    
    // Clamp luminance to 0-255
    luminance = Math.max(0, Math.min(255, luminance));
    
    // Normalize luminance to 0-1
    const t = luminance / 255;

    // Interpolate between shadow and highlight colors based on luminance
    const newR = shadowRgb.r + t * (highlightRgb.r - shadowRgb.r);
    const newG = shadowRgb.g + t * (highlightRgb.g - shadowRgb.g);
    const newB = shadowRgb.b + t * (highlightRgb.b - shadowRgb.b);

    // Blend with original based on intensity
    data[i] = r + (newR - r) * intensity;
    data[i + 1] = g + (newG - g) * intensity;
    data[i + 2] = b + (newB - b) * intensity;
    data[i + 3] = a; // Preserve alpha
  }

  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0);
}
