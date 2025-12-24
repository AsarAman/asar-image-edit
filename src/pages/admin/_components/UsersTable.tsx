import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Edit, Trash2, Crown, Shield } from "lucide-react";
import UserDetailsDialog from "./UserDetailsDialog";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

export default function UsersTable() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.listUsers,
    {},
    { initialNumItems: 20 }
  );

  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleEditUser = (userId: Id<"users">) => {
    setSelectedUserId(userId);
    setDetailsDialogOpen(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">User</TableHead>
                <TableHead className="min-w-[150px]">Email</TableHead>
                <TableHead className="min-w-[80px]">Role</TableHead>
                <TableHead className="min-w-[100px]">Subscription</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Joined</TableHead>
                <TableHead className="text-right min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results && results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                results?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.name || "Anonymous"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || "No email"}
                    </TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscriptionTier === "premium" ? (
                        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscriptionStatus === "active" ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : user.subscriptionStatus === "cancelled" ? (
                        <Badge variant="secondary">Cancelled</Badge>
                      ) : (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user._creationTime)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user._id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-0">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Showing {results?.length || 0} users
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMore(20)}
              disabled={status !== "CanLoadMore"}
              className="flex-1 sm:flex-none"
            >
              {status === "LoadingMore" ? (
                "Loading..."
              ) : (
                <>
                  Load More
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <UserDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        userId={selectedUserId}
      />
    </>
  );
}
