import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsManagement() {
  const testimonials = useQuery(api.admin.getAllTestimonials);
  const updateStatus = useMutation(api.admin.updateTestimonialStatus);

  const handleApprove = async (testimonialId: Id<"testimonials">) => {
    try {
      await updateStatus({ testimonialId, approved: true });
      toast.success("Testimonial approved");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to approve testimonial");
      }
    }
  };

  const handleReject = async (testimonialId: Id<"testimonials">) => {
    try {
      await updateStatus({ testimonialId, approved: false });
      toast.success("Testimonial rejected");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to reject testimonial");
      }
    }
  };

  if (!testimonials) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No testimonials submitted yet
      </div>
    );
  }

  const pending = testimonials.filter((t) => !t.approved);
  const approved = testimonials.filter((t) => t.approved);

  return (
    <div className="space-y-6">
      {/* Pending Testimonials */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending Approval ({pending.length})</h3>
          <div className="space-y-4">
            {pending.map((testimonial) => (
              <Card key={testimonial._id} className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {testimonial.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{testimonial.userName}</p>
                            {testimonial.userEmail && (
                              <p className="text-sm text-muted-foreground">{testimonial.userEmail}</p>
                            )}
                          </div>
                        </div>
                        <StarRating rating={testimonial.rating} />
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm">{testimonial.testimonial}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(testimonial._id)}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(testimonial._id)}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved Testimonials */}
      {approved.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Approved ({approved.length})</h3>
          <div className="space-y-4">
            {approved.map((testimonial) => (
              <Card key={testimonial._id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {testimonial.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{testimonial.userName}</p>
                            {testimonial.userEmail && (
                              <p className="text-sm text-muted-foreground">{testimonial.userEmail}</p>
                            )}
                          </div>
                        </div>
                        <StarRating rating={testimonial.rating} />
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                        Approved
                      </Badge>
                    </div>
                    <p className="text-sm">{testimonial.testimonial}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(testimonial._id)}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Unapprove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
