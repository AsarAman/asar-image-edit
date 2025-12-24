import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { SignInButton } from "@/components/ui/signin";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ArrowLeft, Layers, FolderOpen, Save, Download, ShieldCheck, Share2, Undo, Redo, FilePlus } from "lucide-react";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useHistory } from "@/hooks/use-history";
import ImageUpload, { type UploadedImage } from "./_components/ImageUpload";
import LayoutSelector, { type LayoutType } from "./_components/LayoutSelector";
import Canvas from "./_components/Canvas";
import OverlayControls, { type OverlaySettings } from "./_components/OverlayControls";
import BlendModeSelector, { type BlendMode } from "./_components/BlendModeSelector";
import TransparencyControls, { type ImageTransparency } from "./_components/TransparencyControls";
import CanvasSettings, { type CanvasSettingsData } from "./_components/CanvasSettings";
import VisualEffects, { type VisualEffectsData } from "./_components/VisualEffects";
import ImageTransform, { type ImageTransformData } from "./_components/ImageTransform";
import Filters, { type FilterSettings } from "./_components/Filters";
import TextLayers, { type TextLayer } from "./_components/TextLayers";
import Stickers, { type StickerLayer } from "./_components/Stickers";
import Templates, { type TemplateSettings } from "./_components/Templates";
import CollageTemplates, { type CollageTemplate } from "./_components/CollageTemplates";
import CropTool, { type CropData } from "./_components/CropTool";
import ImageMasks, { type ImageMask } from "./_components/ImageMasks";
import DrawingTools, { type DrawingStroke, type DrawingToolType } from "./_components/DrawingTools";
import AnimationSettingsComponent, { type AnimationSettings } from "./_components/AnimationSettings";
import GlitchEffects, { type GlitchEffectsData } from "./_components/GlitchEffects";
import BackgroundRemoval from "./_components/BackgroundRemoval";
import FaceRetouch from "./_components/FaceRetouch";
import MagicEraser from "./_components/MagicEraser";
import BackgroundChanger from "./_components/BackgroundChanger";
import BeforeAfterComparison from "./_components/BeforeAfterComparison";
import DoubleExposure from "./_components/DoubleExposure";
import LightLeaks from "./_components/LightLeaks";
import Shadows, { type ShadowSettings } from "./_components/Shadows";
import BokehEffects, { type BokehSettings } from "./_components/BokehEffects";
import Duotone, { type DuotoneSettings } from "./_components/Duotone";
import type { DoubleExposureSettings, LightLeakOverlay } from "./_components/canvas-utils";
import Onboarding from "./_components/Onboarding";
import ProjectsDialog from "./_components/ProjectsDialog";
import SaveProjectDialog from "./_components/SaveProjectDialog";
import ExportDialog from "./_components/ExportDialog";
import ShareDialog from "./_components/ShareDialog";
import SubscriptionBanner from "./_components/SubscriptionBanner";
import { toast } from "sonner";
import { 
  trackLayoutChange, 
  trackFeatureUsage, 
  trackTemplateUsed,
  trackProjectLoad,
  trackCheckoutStarted
} from "@/lib/analytics";

// Editor state type for history management
interface EditorState {
  images: UploadedImage[];
  originalImages: UploadedImage[]; // Store originals for before/after comparison
  layout: LayoutType;
  overlaySettings: OverlaySettings;
  blendMode: BlendMode;
  transparencies: ImageTransparency[];
  canvasSettings: CanvasSettingsData;
  visualEffects: VisualEffectsData;
  imageTransforms: ImageTransformData[];
  crops: CropData[];
  masks: ImageMask[];
  filterSettings: FilterSettings;
  textLayers: TextLayer[];
  stickerLayers: StickerLayer[];
  drawingStrokes: DrawingStroke[];
  animationSettings: AnimationSettings;
  glitchEffects: GlitchEffectsData;
  doubleExposureSettings: DoubleExposureSettings;
  lightLeakOverlays: LightLeakOverlay[];
  shadowSettings: ShadowSettings;
  bokehSettings: BokehSettings;
  duotoneSettings: DuotoneSettings;
}

function AdminLink() {
  const isAdmin = useQuery(api.admin.isCurrentUserAdmin);

  if (!isAdmin) return null;

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="hidden sm:flex border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold">
        <Link to="/admin">
          <ShieldCheck className="h-4 w-4 mr-2" />
          ADMIN
        </Link>
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" asChild className="sm:hidden h-7 w-7 border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <Link to="/admin">
              <ShieldCheck className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Admin Dashboard</TooltipContent>
      </Tooltip>
    </>
  );
}

function EditorInner() {
  // Initialize editor state with history
  const initialState: EditorState = {
    images: [],
    originalImages: [],
    layout: "single",
    overlaySettings: {
      opacity: 0.8,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    },
    blendMode: "normal",
    transparencies: [],
    canvasSettings: {
      width: 1200,
      height: 800,
      backgroundColor: "#ffffff",
    },
    visualEffects: {
      borderWidth: 0,
      borderColor: "#000000",
      cornerRadius: 0,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "#000000",
      margin: 20,
    },
    imageTransforms: [],
    crops: [],
    masks: [],
    filterSettings: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hueRotate: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    },
    textLayers: [],
    stickerLayers: [],
    drawingStrokes: [],
    animationSettings: {
      enabled: false,
      duration: 1.5,
      transition: "fade",
      transitionDuration: 0.5,
      loop: true,
      loopCount: 0,
      fps: 30,
    },
    glitchEffects: {
      enabled: false,
      rgbSplit: { enabled: false, intensity: 5 },
      scanlines: { enabled: false, intensity: 50, count: 100 },
      distortion: { enabled: false, intensity: 10, frequency: 5 },
      noise: { enabled: false, intensity: 20 },
      colorShift: { enabled: false, hueShift: 0, saturationShift: 0 },
    },
    doubleExposureSettings: {
      enabled: false,
      baseImageIndex: 0,
      overlayImageIndex: 1,
      blendMode: "screen",
      opacity: 70,
      overlayScale: 100,
      overlayX: 0,
      overlayY: 0,
      overlayRotation: 0,
      invert: false,
    },
    lightLeakOverlays: [],
    shadowSettings: {
      enabled: false,
      type: "drop",
      blur: 10,
      offsetX: 5,
      offsetY: 5,
      color: "#000000",
      opacity: 50,
      spread: 0,
      angle: 45,
      distance: 20,
      curve: 50,
    },
    bokehSettings: {
      enabled: false,
      intensity: 50,
      focalPoint: {
        x: 50,
        y: 50,
      },
      focalSize: 30,
      shape: "circle",
      quality: "medium",
    },
    duotoneSettings: {
      enabled: false,
      shadowColor: "#001F3F",
      highlightColor: "#FF851B",
      intensity: 100,
      contrast: 100,
    },
  };

  const {
    state: editorState,
    set: setEditorState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<EditorState>(initialState, { maxHistory: 50 });

  // Extract individual states for easier access
  const images = editorState.images;
  const originalImages = editorState.originalImages;
  const layout = editorState.layout;
  const overlaySettings = editorState.overlaySettings;
  const blendMode = editorState.blendMode;
  const transparencies = editorState.transparencies;
  const canvasSettings = editorState.canvasSettings;
  const visualEffects = editorState.visualEffects;
  const imageTransforms = editorState.imageTransforms;
  const crops = editorState.crops;
  const masks = editorState.masks;
  const filterSettings = editorState.filterSettings;
  const textLayers = editorState.textLayers;
  const stickerLayers = editorState.stickerLayers;
  const drawingStrokes = editorState.drawingStrokes;
  const animationSettings = editorState.animationSettings;
  const glitchEffects = editorState.glitchEffects;
  const doubleExposureSettings = editorState.doubleExposureSettings;
  const lightLeakOverlays = editorState.lightLeakOverlays;
  const shadowSettings = editorState.shadowSettings;
  const bokehSettings = editorState.bokehSettings;
  const duotoneSettings = editorState.duotoneSettings;

  // Create setter functions that update history
  const setImages = useCallback(
    (images: UploadedImage[]) => {
      const newState = { ...editorState, images };
      
      // Update originalImages when:
      // 1. They're empty and we have new images
      // 2. The number of images changes (upload/remove scenario)
      const imageCountChanged = editorState.images.length !== images.length;
      const shouldUpdateOriginals = 
        (editorState.originalImages.length === 0 && images.length > 0) ||
        imageCountChanged;
      
      if (shouldUpdateOriginals) {
        // Store images with original preview URLs for before/after comparison
        newState.originalImages = images.map(img => ({
          ...img,
          // Use originalPreview if available, otherwise use current preview
          preview: img.originalPreview || img.preview,
        }));
      }
      
      setEditorState(newState);
    },
    [editorState, setEditorState]
  );

  const setLayout = useCallback(
    (layout: LayoutType) => {
      setEditorState({ ...editorState, layout });
      trackLayoutChange(layout);
    },
    [editorState, setEditorState]
  );

  const setOverlaySettings = useCallback(
    (overlaySettings: OverlaySettings) => {
      setEditorState({ ...editorState, overlaySettings });
    },
    [editorState, setEditorState]
  );

  const setBlendMode = useCallback(
    (blendMode: BlendMode) => {
      setEditorState({ ...editorState, blendMode });
    },
    [editorState, setEditorState]
  );

  const setTransparencies = useCallback(
    (transparencies: ImageTransparency[]) => {
      setEditorState({ ...editorState, transparencies });
    },
    [editorState, setEditorState]
  );

  const setCanvasSettings = useCallback(
    (canvasSettings: CanvasSettingsData) => {
      setEditorState({ ...editorState, canvasSettings });
    },
    [editorState, setEditorState]
  );

  const setVisualEffects = useCallback(
    (visualEffects: VisualEffectsData) => {
      setEditorState({ ...editorState, visualEffects });
    },
    [editorState, setEditorState]
  );

  const setImageTransforms = useCallback(
    (imageTransforms: ImageTransformData[]) => {
      setEditorState({ ...editorState, imageTransforms });
    },
    [editorState, setEditorState]
  );

  const setCrops = useCallback(
    (crops: CropData[]) => {
      setEditorState({ ...editorState, crops });
    },
    [editorState, setEditorState]
  );

  const setMasks = useCallback(
    (masks: ImageMask[]) => {
      setEditorState({ ...editorState, masks });
    },
    [editorState, setEditorState]
  );

  const setFilterSettings = useCallback(
    (filterSettings: FilterSettings) => {
      setEditorState({ ...editorState, filterSettings });
    },
    [editorState, setEditorState]
  );

  const setTextLayers = useCallback(
    (textLayers: TextLayer[]) => {
      setEditorState({ ...editorState, textLayers });
    },
    [editorState, setEditorState]
  );

  const setStickerLayers = useCallback(
    (stickerLayers: StickerLayer[]) => {
      setEditorState({ ...editorState, stickerLayers });
    },
    [editorState, setEditorState]
  );

  const setDrawingStrokes = useCallback(
    (drawingStrokes: DrawingStroke[]) => {
      setEditorState({ ...editorState, drawingStrokes });
    },
    [editorState, setEditorState]
  );

  const setAnimationSettings = useCallback(
    (animationSettings: AnimationSettings) => {
      setEditorState({ ...editorState, animationSettings });
    },
    [editorState, setEditorState]
  );

  const setGlitchEffects = useCallback(
    (glitchEffects: GlitchEffectsData) => {
      setEditorState({ ...editorState, glitchEffects });
    },
    [editorState, setEditorState]
  );

  const setDoubleExposureSettings = useCallback(
    (doubleExposureSettings: DoubleExposureSettings) => {
      setEditorState({ ...editorState, doubleExposureSettings });
    },
    [editorState, setEditorState]
  );

  const setLightLeakOverlays = useCallback(
    (lightLeakOverlays: LightLeakOverlay[]) => {
      setEditorState({ ...editorState, lightLeakOverlays });
    },
    [editorState, setEditorState]
  );

  const setShadowSettings = useCallback(
    (shadowSettings: ShadowSettings) => {
      setEditorState({ ...editorState, shadowSettings });
    },
    [editorState, setEditorState]
  );

  const setBokehSettings = useCallback(
    (bokehSettings: BokehSettings) => {
      setEditorState({ ...editorState, bokehSettings });
    },
    [editorState, setEditorState]
  );

  const setDuotoneSettings = useCallback(
    (duotoneSettings: DuotoneSettings) => {
      setEditorState({ ...editorState, duotoneSettings });
    },
    [editorState, setEditorState]
  );

  // Project management state
  const [currentProjectId, setCurrentProjectId] = useState<Id<"projects"> | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [projectsDialogOpen, setProjectsDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentDrawingTool, setCurrentDrawingTool] = useState<DrawingToolType | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingToolSettings, setDrawingToolSettings] = useState({
    tool: "pen" as DrawingToolType,
    color: "#FF0000",
    size: 3,
    opacity: 1,
  });
  const [resetKey, setResetKey] = useState(0);

  // Check URL for project parameter
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Load project from URL parameter on mount
  useEffect(() => {
    const projectId = searchParams.get("project");
    if (projectId) {
      setCurrentProjectId(projectId as Id<"projects">);
      // Clear the URL parameter after loading
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Load project data if we have a project ID
  const projectData = useQuery(
    api.projects.get,
    currentProjectId ? { projectId: currentProjectId } : "skip"
  );

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast.success("Undo");
        }
      }
      // Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac) or Ctrl+Shift+Z
      else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        (e.ctrlKey && e.key === "y")
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.success("Redo");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Load project when projectData is available
  useEffect(() => {
    if (!projectData) return;

    // Set project name
    setCurrentProjectName(projectData.name);

    // Load images
    const loadedImages: UploadedImage[] = projectData.images.map((img, index) => {
      const imageUrl = projectData.imageUrls?.[index]?.url || "";
      return {
        file: new File([], "loaded-image"),
        preview: imageUrl,
        originalPreview: imageUrl, // Set original preview for before/after comparison
        storageId: img.storageId,
        order: img.order,
      };
    });

    // Load settings
    const settings = projectData.settings;
    
    // Replace entire state at once to avoid multiple history entries
    setEditorState({
      images: loadedImages,
      originalImages: loadedImages.map(img => ({ ...img })), // Store originals
      layout: settings.layout as LayoutType,
      canvasSettings: {
        width: settings.canvasWidth,
        height: settings.canvasHeight,
        backgroundColor: settings.backgroundColor,
      },
      blendMode: (settings.blendMode as BlendMode) || "normal",
      overlaySettings: settings.overlaySettings || editorState.overlaySettings,
      transparencies: settings.transparencies || [],
      visualEffects: settings.visualEffects || editorState.visualEffects,
      imageTransforms: settings.imageTransforms || [],
      crops: (settings.crops as CropData[]) || [],
      masks: (settings.masks as ImageMask[]) || [],
      filterSettings: settings.filters || editorState.filterSettings,
      textLayers: (settings.textLayers as TextLayer[]) || [],
      stickerLayers: (settings.stickerLayers as StickerLayer[]) || [],
      drawingStrokes: (settings.drawingStrokes as DrawingStroke[]) || [],
      animationSettings: (settings.animationSettings as AnimationSettings) || editorState.animationSettings,
      glitchEffects: ((settings as Record<string, unknown>).glitchEffects as GlitchEffectsData) || editorState.glitchEffects,
      doubleExposureSettings: ((settings as Record<string, unknown>).doubleExposureSettings as DoubleExposureSettings) || editorState.doubleExposureSettings,
      lightLeakOverlays: ((settings as Record<string, unknown>).lightLeakOverlays as LightLeakOverlay[]) || [],
      shadowSettings: ((settings as Record<string, unknown>).shadowSettings as ShadowSettings) || editorState.shadowSettings,
      bokehSettings: ((settings as Record<string, unknown>).bokehSettings as BokehSettings) || editorState.bokehSettings,
      duotoneSettings: ((settings as Record<string, unknown>).duotoneSettings as DuotoneSettings) || editorState.duotoneSettings,
    });

    toast.success("Project loaded");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData]);

  const generateProjectData = () => {
    return {
      images: images
        .filter((img) => img.storageId)
        .map((img) => ({
          storageId: img.storageId as Id<"_storage">,
          order: img.order,
        })),
      settings: {
        layout,
        canvasWidth: canvasSettings.width,
        canvasHeight: canvasSettings.height,
        backgroundColor: canvasSettings.backgroundColor,
        blendMode,
        overlaySettings,
        transparencies,
        visualEffects,
        imageTransforms,
        crops,
        masks,
        filters: filterSettings,
        textLayers,
        stickerLayers,
        drawingStrokes,
        animationSettings,
        glitchEffects,
        doubleExposureSettings,
        lightLeakOverlays,
        shadowSettings,
        bokehSettings,
        duotoneSettings,
      },
    };
  };

  const handleSaveProject = (projectId: Id<"projects">, name: string) => {
    setCurrentProjectId(projectId);
    setCurrentProjectName(name);
  };

  const handleLoadProject = (projectId: Id<"projects">) => {
    setCurrentProjectId(projectId);
    trackProjectLoad(projectId);
  };

  const handleProjectDeleted = (projectId: Id<"projects">) => {
    // If the deleted project is the current one, clear it
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
      setCurrentProjectName("");
      setEditorState(initialState);
      toast.info("Current project was deleted. Starting fresh.");
    }
  };

  // Auto-switch to single layout when there's only 1 image
  useEffect(() => {
    if (images.length === 1 && layout !== "single") {
      setLayout("single");
    }
  }, [images.length, layout, setLayout]);

  const handleNewProject = () => {
    // Reset to initial state
    setEditorState(initialState);
    setCurrentProjectId(null);
    setCurrentProjectName("");
    setResetKey((prev) => prev + 1); // Force ImageUpload to remount
    toast.success("New project created");
  };

  const handleApplyTemplate = (template: TemplateSettings) => {
    // Apply all template settings at once
    const newState = { ...editorState };
    
    // Apply canvas settings
    newState.canvasSettings = template.canvasSettings;

    // Apply layout if specified
    if (template.layout) {
      newState.layout = template.layout;
    }

    // Apply visual effects if specified
    if (template.visualEffects) {
      newState.visualEffects = {
        ...newState.visualEffects,
        ...template.visualEffects,
      };
    }

    // Apply filters if specified
    if (template.filters) {
      newState.filterSettings = {
        ...newState.filterSettings,
        ...template.filters,
      };
    }

    // Apply blend mode if specified
    if (template.blendMode) {
      newState.blendMode = template.blendMode;
    }

    setEditorState(newState);
    toast.success(`Applied template: ${template.name}`);
  };

  const handleApplyCollageTemplate = (template: CollageTemplate) => {
    // Apply collage template settings
    const newState = { ...editorState };
    
    // Apply canvas settings
    newState.canvasSettings = template.canvasSettings;

    // Apply layout
    newState.layout = template.layout;

    setEditorState(newState);
    toast.success(`Applied collage: ${template.name}`);
    trackTemplateUsed(template.name);
  };

  const handleImageUpdate = useCallback(
    (index: number, newPreview: string, isTransparent = false) => {
      const updatedImages = [...images];
      if (updatedImages[index]) {
        if (isTransparent) {
          // Store as transparent version
          updatedImages[index] = {
            ...updatedImages[index],
            transparentPreview: newPreview,
            preview: newPreview, // Also update preview
            // Preserve originalPreview for before/after comparison
          };
        } else {
          // Regular preview update (for background changes)
          updatedImages[index] = {
            ...updatedImages[index],
            preview: newPreview,
            // Preserve originalPreview for before/after comparison
          };
        }
        setImages(updatedImages);
      }
    },
    [images, setImages]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 border-2 border-black hover:shadow-neo-sm transition-all">
                  <Link to="/">
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to Home</TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 bg-neo-yellow border-2 border-black px-2 py-1 shadow-neo-sm">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <h1 className="text-xs sm:text-sm md:text-lg font-black truncate uppercase">
                <span className="hidden xs:inline">FixMyImage</span>
                <span className="xs:hidden">EDITOR</span>
              </h1>
              {currentProjectName && (
                <span className="text-xs sm:text-sm font-bold truncate hidden md:inline">
                  • {currentProjectName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <AdminLink />
            
            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 border-r-2 border-black pr-0.5 sm:pr-2 mr-0.5 sm:mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={undo}
                    disabled={!canUndo}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-black hover:shadow-neo-sm transition-all"
                  >
                    <Undo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={redo}
                    disabled={!canRedo}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-black hover:shadow-neo-sm transition-all"
                  >
                    <Redo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewProject}
                  className="hidden sm:flex border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  NEW
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create new project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNewProject}
                  className="sm:hidden h-7 w-7 border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create new project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProjectsDialogOpen(true)}
                  className="hidden sm:flex border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  OPEN
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open existing project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setProjectsDialogOpen(true)}
                  className="sm:hidden h-7 w-7 border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open existing project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveDialogOpen(true)}
                  className="hidden sm:flex border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  SAVE
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSaveDialogOpen(true)}
                  className="sm:hidden h-7 w-7 border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setExportDialogOpen(true)}
                  disabled={images.length === 0}
                  className="hidden sm:flex bg-neo-pink text-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold onboarding-export"
                >
                  <Download className="h-4 w-4 mr-2" />
                  EXPORT
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as image or video</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={() => setExportDialogOpen(true)}
                  disabled={images.length === 0}
                  className="sm:hidden h-7 w-7 bg-neo-pink text-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all onboarding-export"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as image or video</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShareDialogOpen(true)}
                  disabled={images.length === 0}
                  className="hidden sm:flex border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  SHARE
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share to social media</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShareDialogOpen(true)}
                  disabled={images.length === 0}
                  className="sm:hidden h-7 w-7 border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share to social media</TooltipContent>
            </Tooltip>
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 bg-white">
        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Two-Column Layout for Desktop */}
        <div className="lg:flex lg:gap-6 lg:items-start">
          {/* Left Column - Controls (Scrollable) */}
          <div className="lg:flex-1 lg:max-w-2xl space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Image Upload */}
              <div className="md:col-span-2 onboarding-upload">
                <ImageUpload
                  key={resetKey}
                  onImagesChange={setImages}
                  maxImages={8}
                />
              </div>

              {/* Templates & Presets */}
              <div className="md:col-span-2">
                <Templates onApplyTemplate={handleApplyTemplate} />
              </div>

              {/* Collage Templates */}
              {images.length >= 1 && (
                <div className="md:col-span-2">
                  <CollageTemplates 
                    onApplyTemplate={handleApplyCollageTemplate}
                    currentImageCount={images.length}
                  />
                </div>
              )}

              {/* Layout Selector */}
              <div className="md:col-span-2">
                <LayoutSelector
                  selectedLayout={layout}
                  onLayoutChange={setLayout}
                  imageCount={images.length}
                />
              </div>

              {/* Canvas Settings */}
              {images.length >= 1 && (
                <CanvasSettings
                  settings={canvasSettings}
                  onChange={setCanvasSettings}
                />
              )}

              {/* Visual Effects */}
              {images.length >= 1 && (
                <VisualEffects
                  settings={visualEffects}
                  onChange={setVisualEffects}
                />
              )}

              {/* Image Transform */}
              {images.length >= 1 && (
                <ImageTransform
                  imageCount={images.length}
                  transforms={imageTransforms}
                  onChange={setImageTransforms}
                />
              )}

              {/* Crop Tool */}
              {images.length >= 1 && (
                <CropTool
                  imageCount={images.length}
                  crops={crops}
                  images={images}
                  onChange={setCrops}
                />
              )}

              {/* Background Removal */}
              {images.length >= 1 && (
                <div className="md:col-span-2 onboarding-remove-bg">
                  <BackgroundRemoval
                    images={images}
                    onImageUpdate={handleImageUpdate}
                  />
                </div>
              )}

              {/* Face Retouch */}
              {images.length >= 1 && (
                <div className="md:col-span-2">
                  <FaceRetouch
                    images={images}
                    onImageUpdate={handleImageUpdate}
                  />
                </div>
              )}

              {/* Magic Eraser */}
              {images.length >= 1 && (
                <div className="md:col-span-2">
                  <MagicEraser
                    images={images}
                    onImageUpdate={handleImageUpdate}
                  />
                </div>
              )}

              {/* Background Changer */}
              {images.length >= 1 && (
                <div className="md:col-span-2 onboarding-change-bg">
                  <BackgroundChanger
                    images={images}
                    onImageUpdate={handleImageUpdate}
                  />
                </div>
              )}

              {/* Double Exposure */}
              {images.length >= 2 && (
                <div className="md:col-span-2">
                  <DoubleExposure
                    images={images}
                    settings={doubleExposureSettings}
                    onChange={setDoubleExposureSettings}
                  />
                </div>
              )}

              {/* Image Masks */}
              {images.length >= 1 && (
                <ImageMasks
                  imageCount={images.length}
                  masks={masks}
                  onChange={setMasks}
                />
              )}

              {/* Overlay Controls */}
              {layout === "overlay" && images.length >= 2 && (
                <OverlayControls
                  settings={overlaySettings}
                  onChange={setOverlaySettings}
                />
              )}

              {/* Blend Mode */}
              {images.length >= 2 && (
                <BlendModeSelector
                  blendMode={blendMode}
                  onChange={setBlendMode}
                />
              )}

              {/* Transparency Controls */}
              {images.length >= 1 && (
                <TransparencyControls
                  imageCount={images.length}
                  transparencies={transparencies}
                  onChange={setTransparencies}
                />
              )}

              {/* Filters */}
              {images.length >= 1 && (
                <Filters
                  settings={filterSettings}
                  onChange={setFilterSettings}
                />
              )}

              {/* Glitch Effects */}
              {images.length >= 1 && (
                <GlitchEffects
                  effects={glitchEffects}
                  onChange={setGlitchEffects}
                />
              )}

              {/* Light Leaks & Overlays */}
              {images.length >= 1 && (
                <div className="md:col-span-2">
                  <LightLeaks
                    overlays={lightLeakOverlays}
                    onChange={setLightLeakOverlays}
                  />
                </div>
              )}

              {/* Shadows */}
              {images.length >= 1 && (
                <div className="md:col-span-2 hidden">
                  <Shadows
                    settings={shadowSettings}
                    onChange={setShadowSettings}
                  />
                </div>
              )}

              {/* Bokeh & Depth Effects */}
              {images.length >= 1 && (
                <div className="md:col-span-2">
                  <BokehEffects
                    settings={bokehSettings}
                    onChange={setBokehSettings}
                  />
                </div>
              )}

              {/* Duotone */}
              {images.length >= 1 && (
                <div className="md:col-span-2">
                  <Duotone
                    settings={duotoneSettings}
                    onChange={setDuotoneSettings}
                  />
                </div>
              )}

              {/* Before/After Comparison */}
              {images.length >= 1 && originalImages.length >= 1 && (
                <div className="md:col-span-2">
                  <BeforeAfterComparison
                    images={images}
                    originalImages={originalImages}
                    layout={layout}
                    canvasSettings={canvasSettings}
                    visualEffects={visualEffects}
                    imageTransforms={imageTransforms}
                    crops={crops}
                    masks={masks}
                    filterSettings={filterSettings}
                    overlaySettings={overlaySettings}
                    blendMode={blendMode}
                    transparencies={transparencies}
                    textLayers={textLayers}
                    stickerLayers={stickerLayers}
                    drawingStrokes={drawingStrokes}
                    glitchEffects={glitchEffects}
                    lightLeakOverlays={lightLeakOverlays}
                  />
                </div>
              )}

              {/* Text Layers */}
              <div className="md:col-span-2">
                <TextLayers
                  textLayers={textLayers}
                  onChange={setTextLayers}
                />
              </div>

              {/* Stickers */}
              <div className="md:col-span-2">
                <Stickers
                  stickerLayers={stickerLayers}
                  onChange={setStickerLayers}
                />
              </div>

              {/* Drawing Tools */}
              <div className="md:col-span-2">
                <DrawingTools
                  strokes={drawingStrokes}
                  onChange={setDrawingStrokes}
                  onToolSelect={(tool) => {
                    setCurrentDrawingTool(tool);
                  }}
                  onSettingsChange={(settings) => {
                    setDrawingToolSettings(settings);
                  }}
                  isDrawingMode={isDrawingMode}
                  onDrawingModeChange={setIsDrawingMode}
                />
              </div>

              {/* Animation Settings */}
              <div className="md:col-span-2">
                <AnimationSettingsComponent
                  images={images}
                  canvasSettings={canvasSettings}
                  visualEffects={visualEffects}
                  imageTransforms={imageTransforms}
                  crops={crops}
                  filterSettings={filterSettings}
                  textLayers={textLayers}
                  stickerLayers={stickerLayers}
                  settings={animationSettings}
                  onChange={setAnimationSettings}
                />
              </div>
            </div>

            {/* Export Button (Bottom of Controls on Desktop) */}
            {images.length >= 2 && (
              <div className="flex justify-center pt-4 lg:hidden">
                <Button
                  size="lg"
                  onClick={() => setExportDialogOpen(true)}
                  disabled={images.length === 0}
                  className="w-full sm:w-auto bg-neo-pink text-white border-4 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all font-black uppercase"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Image
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Canvas Preview (Sticky on Desktop) */}
          <div className="lg:flex-1 lg:sticky lg:top-20 mt-6 lg:mt-0">
            <Canvas
              images={images}
              layout={layout}
              canvasSettings={canvasSettings}
              visualEffects={visualEffects}
              imageTransforms={imageTransforms}
              crops={crops}
              masks={masks}
              filterSettings={filterSettings}
              overlaySettings={overlaySettings}
              blendMode={blendMode}
              transparencies={transparencies}
              textLayers={textLayers}
              stickerLayers={stickerLayers}
              drawingStrokes={drawingStrokes}
              glitchEffects={glitchEffects}
              doubleExposureSettings={doubleExposureSettings}
              lightLeakOverlays={lightLeakOverlays}
              shadowSettings={shadowSettings}
              bokehSettings={bokehSettings}
              duotoneSettings={duotoneSettings}
              onDrawingStrokesChange={setDrawingStrokes}
              currentDrawingTool={currentDrawingTool}
              drawingToolSettings={drawingToolSettings}
              isDrawingEnabled={isDrawingMode}
            />
            
            {/* Export Button (Sticky with Canvas on Desktop) */}
            {images.length >= 1 && (
              <div className="hidden lg:flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => setExportDialogOpen(true)}
                  disabled={images.length === 0}
                  className="w-full bg-neo-pink text-white border-4 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all font-black uppercase"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ProjectsDialog
        open={projectsDialogOpen}
        onOpenChange={setProjectsDialogOpen}
        onLoadProject={handleLoadProject}
        onProjectDeleted={handleProjectDeleted}
      />
      
      <SaveProjectDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        currentProjectId={currentProjectId}
        currentProjectName={currentProjectName}
        onSave={handleSaveProject}
        generateProjectData={generateProjectData}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        images={images}
        layout={layout}
        canvasSettings={canvasSettings}
        visualEffects={visualEffects}
        imageTransforms={imageTransforms}
        crops={crops}
        masks={masks}
        filterSettings={filterSettings}
        overlaySettings={overlaySettings}
        blendMode={blendMode}
        transparencies={transparencies}
        textLayers={textLayers}
        stickerLayers={stickerLayers}
        drawingStrokes={drawingStrokes}
        glitchEffects={glitchEffects}
        doubleExposureSettings={doubleExposureSettings}
        lightLeakOverlays={lightLeakOverlays}
        shadowSettings={shadowSettings}
        bokehSettings={bokehSettings}
        duotoneSettings={duotoneSettings}
        projectName={currentProjectName || "fixmyimage"}
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        images={images}
        layout={layout}
        canvasSettings={canvasSettings}
        visualEffects={visualEffects}
        imageTransforms={imageTransforms}
        crops={crops}
        masks={masks}
        filterSettings={filterSettings}
        overlaySettings={overlaySettings}
        blendMode={blendMode}
        transparencies={transparencies}
        textLayers={textLayers}
        stickerLayers={stickerLayers}
        drawingStrokes={drawingStrokes}
        glitchEffects={glitchEffects}
        projectName={currentProjectName || "fixmyimage"}
      />

      {/* Onboarding */}
      <Onboarding />
    </div>
  );
}

export default function EditorPage() {
  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center space-y-6 max-w-md border-4 border-black p-8 shadow-neo">
            <div className="h-16 w-16 bg-neo-yellow border-2 border-black flex items-center justify-center mx-auto transform -rotate-6">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase">Sign in to continue</h2>
              <p className="mt-2 font-medium">
                You need to be signed in to use the FixMyImage editor
              </p>
            </div>
            <SignInButton size="lg" className="bg-neo-pink text-white border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all font-bold" />
            <Button variant="ghost" asChild className="border-2 border-black hover:shadow-neo-sm transition-all">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Unauthenticated>

      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <div className="space-y-4 w-full max-w-md px-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        <EditorInner />
      </Authenticated>
    </>
  );
}
