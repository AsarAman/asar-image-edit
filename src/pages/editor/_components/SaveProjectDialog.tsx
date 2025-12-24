import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { trackProjectSave } from "@/lib/analytics";

interface SaveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId: Id<"projects"> | null;
  currentProjectName: string;
  onSave: (projectId: Id<"projects">, name: string) => void;
  generateProjectData: () => {
    images: Array<{ storageId: Id<"_storage">; order: number }>;
    settings: {
      layout: "single" | "horizontal" | "vertical" | "grid" | "collage1" | "collage2" | "overlay" | "diagonal" | "circular" | "stacked" | "mosaic";
      canvasWidth: number;
      canvasHeight: number;
      backgroundColor: string;
      [key: string]: unknown;
    };
  };
}

export default function SaveProjectDialog({
  open,
  onOpenChange,
  currentProjectId,
  currentProjectName,
  onSave,
  generateProjectData,
}: SaveProjectDialogProps) {
  const [projectName, setProjectName] = useState(currentProjectName || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const data = generateProjectData();
    
    if (data.images.length === 0) {
      toast.error("Please upload at least one image before saving");
      return;
    }

    setIsSaving(true);
    try {
      if (currentProjectId) {
        // Update existing project
        await updateProject({
          projectId: currentProjectId,
          name: projectName,
          images: data.images,
          settings: data.settings,
        });
        toast.success("Project updated");
        trackProjectSave(currentProjectId);
        onSave(currentProjectId, projectName);
      } else {
        // Create new project
        const newProjectId = await createProject({
          name: projectName,
          images: data.images,
          settings: data.settings,
        });
        toast.success("Project saved");
        trackProjectSave(newProjectId);
        onSave(newProjectId, projectName);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Save project error:", error);
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(`Save failed: ${message}`);
      } else if (error instanceof Error) {
        toast.error(`Failed to save project: ${error.message}`);
      } else {
        toast.error("Failed to save project");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentProjectId ? "Update Project" : "Save Project"}
          </DialogTitle>
          <DialogDescription>
            {currentProjectId
              ? "Update your project with the current settings"
              : "Save your work so you can continue later"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="My Project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : currentProjectId ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
