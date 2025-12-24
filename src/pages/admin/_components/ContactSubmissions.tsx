import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

type ContactStatus = "new" | "read" | "replied";

export default function ContactSubmissions() {
  const submissions = useQuery(api.admin.getAllContactSubmissions);
  const updateStatus = useMutation(api.admin.updateContactSubmissionStatus);

  const handleStatusChange = async (
    submissionId: Id<"contactSubmissions">,
    status: ContactStatus
  ) => {
    try {
      await updateStatus({ submissionId, status });
      toast.success("Status updated");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  if (!submissions) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No contact submissions yet
      </div>
    );
  }

  const getStatusVariant = (status: ContactStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
      case "read":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
      case "replied":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission._id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">{submission.name}</p>
                    <Badge className={getStatusVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{submission.email}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(submission._creationTime).toLocaleString()}
                  </div>
                </div>
                <Select
                  value={submission.status}
                  onValueChange={(value) =>
                    handleStatusChange(submission._id, value as ContactStatus)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Subject:</p>
                <p className="text-sm text-muted-foreground">{submission.subject}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Message:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {submission.message}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={`mailto:${submission.email}?subject=Re: ${submission.subject}`}>
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
