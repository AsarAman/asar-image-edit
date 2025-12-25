import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignInButton } from "@/components/ui/signin";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Star, Quote, ArrowLeft, Layers } from "lucide-react";
import { ConvexError } from "convex/values";

function StarRating({ rating, onRatingChange, readonly = false }: { rating: number; onRatingChange?: (rating: number) => void; readonly?: boolean }) {
  console.log(import.meta.env.VITE_OIDC_AUTHORITY);
console.log(import.meta.env.VITE_OIDC_CLIENT_ID);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`h-6 w-6 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function TestimonialForm() {
  const [rating, setRating] = useState(5);
  const [testimonial, setTestimonial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTestimonial = useMutation(api.testimonials.create);
  const existingTestimonial = useQuery(api.testimonials.getCurrentUserTestimonial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testimonial.trim()) {
      toast.error("Please write your testimonial");
      return;
    }

    if (testimonial.trim().length < 20) {
      toast.error("Testimonial must be at least 20 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTestimonial({ rating, testimonial: testimonial.trim() });
      toast.success("Thank you for your testimonial! It will be reviewed by our team.");
      setTestimonial("");
      setRating(5);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to submit testimonial");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingTestimonial) {
    return (
      <Card className="border-2 border-black shadow-neo">
        <CardHeader>
          <CardTitle className="font-black uppercase">Your Testimonial</CardTitle>
          <CardDescription className="font-medium">
            {existingTestimonial.approved 
              ? "Thank you! Your testimonial has been published."
              : "Your testimonial is pending review by our team."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="font-bold">Your Rating</Label>
              <StarRating rating={existingTestimonial.rating} readonly />
            </div>
            <div>
              <Label className="font-bold">Your Testimonial</Label>
              <p className="text-sm font-medium mt-2">
                {existingTestimonial.testimonial}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-black shadow-neo">
      <CardHeader>
        <CardTitle className="font-black uppercase">Share Your Experience</CardTitle>
        <CardDescription className="font-medium">
          Tell us about your experience with FixMyImage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-bold">Your Rating</Label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial" className="font-bold">Your Testimonial</Label>
            <Textarea
              id="testimonial"
              placeholder="Share your thoughts about FixMyImage..."
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              rows={5}
              required
              className="border-2 border-black"
            />
            <p className="text-xs font-medium text-muted-foreground">
              Minimum 20 characters
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-black text-white border-2 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-bold"
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT TESTIMONIAL"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ testimonial }: { testimonial: { userName: string; userEmail?: string; rating: number; testimonial: string } }) {
  // Generate avatar from name
  const avatarText = testimonial.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="h-full border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-neo-yellow border-2 border-black flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-black">
              {avatarText}
            </span>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-black">{testimonial.userName}</h3>
              <StarRating rating={testimonial.rating} readonly />
            </div>
            <div className="relative">
              <Quote className="absolute -left-2 -top-2 h-8 w-8 text-primary/20" />
              <p className="font-medium pl-6">
                {testimonial.testimonial}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialsContent() {
  return (
    <div className="max-w-2xl mx-auto">
      <Authenticated>
        <TestimonialForm />
      </Authenticated>

      <Unauthenticated>
        <Card className="border-2 border-black shadow-neo">
          <CardHeader>
            <CardTitle className="font-black uppercase">Share Your Experience</CardTitle>
            <CardDescription className="font-medium">
              Sign in to leave a testimonial
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignInButton className="bg-black text-white border-2 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-bold" />
          </CardContent>
        </Card>
      </Unauthenticated>
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              size="icon" 
              className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Testimonials</h1>
          </div>
          
          <Link to="/" className="flex items-center gap-2 bg-neo-yellow border-2 border-black px-3 py-2 shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <Layers className="h-5 w-5" />
            <span className="font-black text-sm uppercase tracking-tighter">FixMyImage</span>
          </Link>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-block bg-neo-pink border-2 border-black px-4 py-1 transform -rotate-1 mb-4">
            <span className="font-bold text-sm uppercase tracking-wider text-white">Share Your Review</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            TELL US WHAT YOU THINK
          </h2>
          <p className="text-lg font-semibold">Your feedback helps us improve FixMyImage</p>
        </div>

        <AuthLoading>
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-96 border-2 border-black" />
          </div>
        </AuthLoading>
        <Authenticated>
          <TestimonialsContent />
        </Authenticated>
        <Unauthenticated>
          <TestimonialsContent />
        </Unauthenticated>
      </main>
    </div>
  );
}
