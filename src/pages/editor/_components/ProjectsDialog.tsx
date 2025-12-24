import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FolderOpen, Trash2, Edit2, Check, X, Image } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

interface ProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadProject: (projectId: Id<"projects">) => void;
  onProjectDeleted?: (projectId: Id<"projects">) => void;
}

export default function ProjectsDialog({
  open,
  onOpenChange,
  onLoadProject,
  onProjectDeleted,
}: ProjectsDialogProps) {
  const projects = useQuery(api.projects.list);
  const removeProject = useMutation(api.projects.remove);
  const updateProject = useMutation(api.projects.update);
  
  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<Id<"projects"> | null>(null);

  const handleDelete = async (projectId: Id<"projects">) => {
    if (deletingId) return;
    
    setDeletingId(projectId);
    try {
      await removeProject({ projectId });
      toast.success("Project deleted");
      // Notify parent if this was the current project
      if (onProjectDeleted) {
        onProjectDeleted(projectId);
      }
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to delete project");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleRename = async (projectId: Id<"projects">) => {
    if (!editingName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    try {
      await updateProject({ projectId, name: editingName });
      toast.success("Project renamed");
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to rename project");
      }
    }
  };

  const startEditing = (projectId: Id<"projects">, currentName: string) => {
    setEditingId(projectId);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleLoad = (projectId: Id<"projects">) => {
    onLoadProject(projectId);
    onOpenChange(false);
  };

  if (projects === undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Projects</DialogTitle>
            <DialogDescription>Loading your saved projects...</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Projects</DialogTitle>
          <DialogDescription>
            Load or manage your saved projects
          </DialogDescription>
        </DialogHeader>

        {projects.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>
                Save your current work to create your first project
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-24 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {project.imageUrls && project.imageUrls.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
                            {project.imageUrls.slice(0, 4).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url || ""}
                                alt=""
                                className="w-full h-full object-cover rounded-sm"
                              />
                            ))}
                          </div>
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Info and Actions */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {editingId === project._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRename(project._id);
                                } else if (e.key === "Escape") {
                                  cancelEditing();
                                }
                              }}
                              className="h-8"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRename(project._id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <h3 className="font-semibold text-lg truncate">
                            {project.name}
                          </h3>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{project.images.length} images</span>
                          <span>•</span>
                          <span className="capitalize">{project.settings.layout}</span>
                          <span>•</span>
                          <span>
                            {new Date(project._creationTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoad(project._id)}
                        >
                          Load Project
                        </Button>
                        {editingId !== project._id && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(project._id, project.name)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Rename
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(project._id)}
                              disabled={deletingId === project._id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deletingId === project._id ? "Deleting..." : "Delete"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
