import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Shield, FolderOpen, Download, Calendar, Trash2, AlertTriangle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users"> | null;
}

export default function UserDetailsDialog({
  open,
  onOpenChange,
  userId,
}: UserDetailsDialogProps) {
  const userDetails = useQuery(
    api.admin.getUserDetails,
    userId ? { userId } : "skip"
  );
  const updateSubscription = useMutation(api.admin.updateUserSubscription);
  const updateRole = useMutation(api.admin.updateUserRole);
  const deleteUser = useMutation(api.admin.deleteUser);

  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "premium" | "lifetime">("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "cancelled" | "expired" | "paused">("active");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (userDetails?.user) {
      setSubscriptionTier(userDetails.user.subscriptionTier);
      setSubscriptionStatus(userDetails.user.subscriptionStatus);
      setRole(userDetails.user.role);
    }
  }, [userDetails]);

  const handleUpdateSubscription = async () => {
    if (!userId) return;

    setIsUpdating(true);
    try {
      await updateSubscription({
        userId,
        subscriptionTier,
        subscriptionStatus,
      });
      toast.success("Subscription updated");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update subscription");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!userId) return;

    setIsUpdating(true);
    try {
      await updateRole({ userId, role });
      toast.success("Role updated");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return;

    setIsUpdating(true);
    try {
      await deleteUser({ userId });
      toast.success("User deleted");
      onOpenChange(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and manage user information and subscription
          </DialogDescription>
        </DialogHeader>

        {!userDetails ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* User Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{userDetails.user.name || "Anonymous"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{userDetails.user.email || "No email"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Joined</Label>
                  <p className="font-medium text-sm">
                    {formatDate(userDetails.user._creationTime)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="font-mono text-xs">{userDetails.user._id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Activity Stats */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Activity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm">Projects</span>
                  </div>
                  <p className="text-2xl font-bold">{userDetails.projectCount}</p>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Total Exports</span>
                  </div>
                  <p className="text-2xl font-bold">{userDetails.totalExports}</p>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">This Month</span>
                  </div>
                  <p className="text-2xl font-bold">{userDetails.thisMonthExports}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Role Management */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Role Management</h3>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label>User Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as "user" | "admin")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpdateRole}
                  disabled={isUpdating || role === userDetails.user.role}
                >
                  Update Role
                </Button>
              </div>
            </div>

            <Separator />

            {/* Subscription Management */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Subscription Management</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select
                    value={subscriptionTier}
                    onValueChange={(v) => setSubscriptionTier(v as "free" | "premium" | "lifetime")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={subscriptionStatus}
                    onValueChange={(v) =>
                      setSubscriptionStatus(v as "active" | "cancelled" | "expired" | "paused")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleUpdateSubscription}
                disabled={
                  isUpdating ||
                  (subscriptionTier === userDetails.user.subscriptionTier &&
                    subscriptionStatus === userDetails.user.subscriptionStatus)
                }
                className="w-full"
              >
                Update Subscription
              </Button>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h3>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
              ) : (
                <div className="space-y-3 border border-destructive rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete the user and all their data (projects, exports).
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteUser}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      {isUpdating ? "Deleting..." : "Confirm Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
