import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Authenticated, Unauthenticated } from "convex/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { SignInButton } from "@/components/ui/signin";
import { 
  Layers, Sparkles, Download, Zap, ShieldCheck, FolderOpen, 
  ArrowRight, Image as ImageIcon, Palette, Wand2, Users, Briefcase,
  Globe, TrendingUp, CheckCircle2, Star, Send, Film, Mail, MessageSquare,
  SplitIcon, Crown, Eraser
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import UserProfileDropdown from "@/components/UserProfileDropdown";

function AdminLink() {
  const isAdmin = useQuery(api.admin.isCurrentUserAdmin);

  if (!isAdmin) return null;

  return (
    <Button 
      size="sm" 
      className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
      asChild
    >
      <Link to="/admin">
        <ShieldCheck className="h-4 w-4 mr-2" />
        Admin
      </Link>
    </Button>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContact = useMutation(api.contact.submit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success("Message sent successfully! We'll get back to you soon.");
      
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-black shadow-neo">
      <CardHeader>
        <CardTitle className="font-black uppercase">Send a Message</CardTitle>
        <CardDescription className="font-medium">
          Fill out the form below and we'll get back to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold">Name</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-2 border-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="font-bold">Subject</Label>
            <Input
              id="subject"
              placeholder="What is this regarding?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="border-2 border-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-bold">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us more..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              className="border-2 border-black"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-black text-white border-2 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-bold"
          >
            {isSubmitting ? (
              "SENDING..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                SEND MESSAGE
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



function PricingCards() {
  const createCheckout = useAction(api.payments.createCheckoutUrl);
  const [isLoadingPro, setIsLoadingPro] = useState(false);
  const [isLoadingLifetime, setIsLoadingLifetime] = useState(false);

  const handleUpgrade = async (tier: "pro" | "lifetime") => {
    const setLoading = tier === "pro" ? setIsLoadingPro : setIsLoadingLifetime;
    setLoading(true);
    try {
      const { url } = await createCheckout({ tier });
      window.location.href = url;
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Failed to start checkout");
      }
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <Card className="border-2 border-black shadow-neo">
        <CardHeader>
          <CardTitle className="font-black uppercase">Free</CardTitle>
          <CardDescription>Perfect for trying out</CardDescription>
          <div className="mt-4">
            <span className="text-5xl font-black">$0</span>
            <span className="font-bold">/month</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {["5 exports/month", "Basic features", "Up to 4 images", "Standard quality"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Unauthenticated>
            <SignInButton className="w-full border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all" />
          </Unauthenticated>
          <Authenticated>
            <Button className="w-full" variant="outline" disabled>Current Plan</Button>
          </Authenticated>
        </CardFooter>
      </Card>

      <Card className="border-4 border-black shadow-neo-hover scale-105 bg-neo-pink/10">
        <CardHeader>
          <div className="bg-neo-pink border-2 border-black px-3 py-1 w-fit mb-2 transform -rotate-2">
            <span className="font-black text-sm uppercase">Most Popular</span>
          </div>
          <CardTitle className="font-black uppercase">Pro</CardTitle>
          <CardDescription>For serious creators</CardDescription>
          <div className="mt-4 flex items-baseline gap-3">
            <div>
              <span className="text-5xl font-black">$4.50</span>
              <span className="font-bold">/month</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm line-through text-muted-foreground">$9</span>
              <Badge className="bg-neo-pink text-white border-2 border-black font-black text-xs">50% OFF</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {["80 exports/month", "All features", "Up to 8 images", "No watermark", "HD quality", "Priority support"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Unauthenticated>
            <SignInButton className="w-full bg-neo-pink text-white border-2 border-black shadow-neo hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold" />
          </Unauthenticated>
          <Authenticated>
            <Button
              className="w-full bg-neo-pink text-white border-2 border-black shadow-neo hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
              onClick={() => handleUpgrade("pro")}
              disabled={isLoadingPro}
            >
              {isLoadingPro ? "LOADING..." : "UPGRADE NOW"}
            </Button>
          </Authenticated>
        </CardFooter>
      </Card>

      <Card className="border-2 border-black shadow-neo">
        <CardHeader>
          <div className="bg-neo-yellow border-2 border-black px-3 py-1 w-fit mb-2 transform rotate-2">
            <span className="font-black text-sm uppercase">Best Value</span>
          </div>
          <CardTitle className="font-black uppercase">Lifetime</CardTitle>
          <CardDescription>Pay once, use forever</CardDescription>
          <div className="mt-4 flex items-baseline gap-3">
            <div>
              <span className="text-5xl font-black">$35</span>
              <span className="font-bold text-sm ml-1">one-time</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm line-through text-muted-foreground">$70</span>
              <Badge className="bg-neo-yellow text-black border-2 border-black font-black text-xs">50% OFF</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {["Unlimited exports", "Up to 8 images", "Lifetime access", "All future updates", "No watermark", "Dedicated support"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Unauthenticated>
            <SignInButton className="w-full bg-neo-yellow border-2 border-black shadow-neo hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold" />
          </Unauthenticated>
          <Authenticated>
            <Button
              className="w-full bg-neo-yellow border-2 border-black shadow-neo hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
              onClick={() => handleUpgrade("lifetime")}
              disabled={isLoadingLifetime}
            >
              {isLoadingLifetime ? "LOADING..." : "GET LIFETIME DEAL"}
            </Button>
          </Authenticated>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 bg-neo-yellow border-2 border-black px-3 py-2 shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <Layers className="h-6 w-6" />
            <span className="font-black text-lg uppercase tracking-tighter">FixMyImage</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-3">
            <a href="#features" className="font-bold text-sm hover:text-primary">FEATURES</a>
            <a href="#examples" className="font-bold text-sm hover:text-primary">EXAMPLES</a>
            <a href="#pricing" className="font-bold text-sm hover:text-primary">PRICING</a>
            <Link to="/testimonials" className="font-bold text-sm hover:text-primary">REVIEWS</Link>
            <a href="#contact" className="font-bold text-sm hover:text-primary">CONTACT</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Authenticated>
              <AdminLink />
              <Button 
                className="bg-black text-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-bold"
                asChild
              >
                <Link to="/editor">OPEN EDITOR</Link>
              </Button>
              <UserProfileDropdown />
            </Authenticated>
            <Unauthenticated>
              <SignInButton className="bg-black text-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-bold" />
            </Unauthenticated>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden px-4 py-20">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-48 h-48 bg-neo-purple rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-neo-green rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-neo-pink rounded-full blur-2xl opacity-20"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
          <div className="inline-block bg-black text-white px-4 py-2 transform -rotate-2 border-2 border-black mb-4">
            <span className="font-bold text-sm tracking-widest uppercase">✨ Professional Image Editing</span>
          </div>
          
          <h1 className="font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none uppercase" style={{ letterSpacing: '0.05em' }}>
            Transform Images
            <br />
            <span className="inline-block bg-neo-pink border-4 border-black px-4 py-2 mt-4 transform rotate-1">
              LIKE A PRO
            </span>
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-4 border-black p-6 shadow-neo transform hover:shadow-neo-hover hover:-translate-y-1 transition-all">
              <p className="text-lg md:text-xl font-medium">
                Edit single images or merge multiple with 
                <span className="font-black bg-neo-yellow px-2 mx-1">powerful AI tools</span>
                No design skills needed!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Authenticated>
              <Button 
                size="lg" 
                className="bg-neo-pink text-white border-4 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all font-black text-lg px-8 py-6"
                asChild
              >
                <Link to="/editor">
                  START CREATING FREE
                  <Zap className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Authenticated>
            <Unauthenticated>
              <SignInButton 
                size="lg" 
                className="bg-neo-pink text-white border-4 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all font-black text-lg px-8 py-6"
              />
            </Unauthenticated>
            <Button 
              size="lg" 
              variant="outline"
              className="border-4 border-black shadow-neo hover:bg-neo-blue hover:border-black hover:shadow-neo-hover hover:-translate-y-2 transition-all font-black text-lg px-8 py-6"
              onClick={() => {
                document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              SEE EXAMPLES
            </Button>
          </div>

          {/* Loved by users */}
          <div className="pt-6">
            <div className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full border-2 border-black shadow-neo">
              <div className="flex -space-x-2">
                <img 
                  src="https://images.unsplash.com/photo-1520529277867-dbf8c5e0b340?w=80&h=80&fit=crop&auto=format" 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                <img 
                  src="https://images.unsplash.com/photo-1636031479085-e7e34e7ad857?w=80&h=80&fit=crop&auto=format" 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                <img 
                  src="https://images.unsplash.com/photo-1697551458746-b86ccf5049d4?w=80&h=80&fit=crop&auto=format" 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                <img 
                  src="https://images.unsplash.com/photo-1679466061812-211a6b737175?w=80&h=80&fit=crop&auto=format" 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                <img 
                  src="https://images.unsplash.com/photo-1492448497576-45b1efcdc02c?w=80&h=80&fit=crop&auto=format" 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  loading="lazy"
                  width="40"
                  height="40"
                />
              </div>
              <p className="font-bold text-base">
                Loved by <span className="text-neo-yellow">500+</span> users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Showcase */}
      <section id="examples" className="py-20 bg-gradient-to-br from-neo-blue/20 to-neo-purple/20 border-y-4 border-black">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-neo-pink border-2 border-black px-4 py-2 transform -rotate-1 mb-4">
              <span className="font-bold text-sm tracking-widest uppercase text-white">✨ Real Examples</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Stunning Results
            </h2>
            <p className="text-xl font-medium max-w-2xl mx-auto">
              Drag the slider to see powerful transformations
            </p>
          </div>

          <div className="space-y-12 max-w-5xl mx-auto">
            {/* Example 1 - AI Background Removal */}
            <div className="bg-white border-4 border-black shadow-neo-hover p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neo-cyan border-2 border-black px-3 py-1 flex items-center gap-2">
                  <Eraser className="h-4 w-4" />
                  <span className="font-black text-sm uppercase">AI Background Removal</span>
                </div>
                <Badge className="bg-neo-yellow text-black border-2 border-black font-black">PRO</Badge>
              </div>
              <BeforeAfterSlider
                beforeImage="https://cdn.hercules.app/file_sXrqR2yXQf1ZatIMHlZBWUfy"
                afterImage="https://cdn.hercules.app/file_6P2r3f0FsnWRZN5h1cDLDuwI"
              />
              <p className="font-medium text-sm text-muted-foreground pt-2">
                Remove and replace backgrounds with AI-powered precision in seconds
              </p>
            </div>

            {/* Example 2 - Vibrant Color Boost */}
            <div className="bg-white border-4 border-black shadow-neo-hover p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neo-pink border-2 border-black px-3 py-1 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="font-black text-sm uppercase">Color Enhancement</span>
                </div>
              </div>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75&auto=format"
                afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75&auto=format&sat=50&con=20&bri=10"
              />
              <p className="font-medium text-sm text-muted-foreground pt-2">
                Transform dull photos into vibrant masterpieces with powerful color and contrast controls
              </p>
            </div>

            {/* Example 3 - Black & White Conversion */}
            <div className="bg-white border-4 border-black shadow-neo-hover p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neo-yellow border-2 border-black px-3 py-1 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span className="font-black text-sm uppercase">Artistic Filters</span>
                </div>
              </div>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=75&auto=format"
                afterImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=75&auto=format&mono&con=30"
              />
              <p className="font-medium text-sm text-muted-foreground pt-2">
                Apply stunning black & white, sepia, and artistic filters for timeless, professional looks
              </p>
            </div>

            {/* Example 4 - Portrait Enhancement */}
            <div className="bg-white border-4 border-black shadow-neo-hover p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neo-cyan border-2 border-black px-3 py-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-black text-sm uppercase">Professional Portrait</span>
                </div>
                <Badge className="bg-neo-yellow text-black border-2 border-black font-black">PRO</Badge>
              </div>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=75&auto=format&sat=-20&bri=-10"
                afterImage="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=75&auto=format&sat=20&bri=15&con=15"
              />
              <p className="font-medium text-sm text-muted-foreground pt-2">
                Enhance portraits with 33+ cinematic color grading presets for magazine-quality results
              </p>
            </div>

            {/* Example 5 - Dramatic Mood */}
            <div className="bg-white border-4 border-black shadow-neo-hover p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neo-purple border-2 border-black px-3 py-1 flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span className="font-black text-sm uppercase">Mood & Atmosphere</span>
                </div>
              </div>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=75&auto=format"
                afterImage="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=75&auto=format&sat=-50&con=40&bri=-20"
              />
              <p className="font-medium text-sm text-muted-foreground pt-2">
                Create dramatic moods with advanced brightness, contrast, and saturation adjustments
              </p>
            </div>

            {/* Example 6 - Vintage Look */}
            <div className="bg-white border-4 border-black shadow-neo-hover p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neo-blue border-2 border-black px-3 py-1 flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  <span className="font-black text-sm uppercase">Vintage Style</span>
                </div>
              </div>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=75&auto=format"
                afterImage="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=75&auto=format&sepia&sat=30"
              />
              <p className="font-medium text-sm text-muted-foreground pt-2">
                Give your photos a nostalgic vintage feel with sepia tones and retro color grading
              </p>
            </div>

            {/* Example 7 - Soft Blur Effect */}
            <div className="bg-white border-4 border-black shadow-neo-hover p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neo-pink border-2 border-black px-3 py-1 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-black text-sm uppercase">Blur & Depth</span>
                </div>
              </div>
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=75&auto=format"
                afterImage="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=75&auto=format&blur=200"
              />
              <p className="font-medium text-sm text-muted-foreground pt-2">
                Add professional bokeh, radial, and motion blur effects to create stunning depth of field
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Authenticated>
              <Button 
                size="lg"
                className="bg-neo-pink text-white border-4 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all font-black text-lg px-8 py-6"
                asChild
              >
                <Link to="/editor">
                  START CREATING NOW
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Authenticated>
            <Unauthenticated>
              <SignInButton 
                size="lg"
                className="bg-neo-pink text-white border-4 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all font-black text-lg px-8 py-6"
              />
            </Unauthenticated>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-neo-yellow border-y-4 border-black">
        <div className="max-w-screen-xl mx-auto px-4">
          <p className="text-center font-bold mb-8 uppercase tracking-wider">
            Trusted by creators worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-white border-2 border-black p-4 shadow-neo">
              <p className="text-4xl font-black">500+</p>
              <p className="text-sm font-bold uppercase mt-1">Active Users</p>
            </div>
            <div className="text-center bg-white border-2 border-black p-4 shadow-neo">
              <p className="text-4xl font-black">1000+</p>
              <p className="text-sm font-bold uppercase mt-1">Projects</p>
            </div>
            <div className="text-center bg-white border-2 border-black p-4 shadow-neo">
              <p className="text-4xl font-black">99%</p>
              <p className="text-sm font-bold uppercase mt-1">Satisfaction</p>
            </div>
            <div className="text-center bg-white border-2 border-black p-4 shadow-neo">
              <div className="flex gap-0.5 justify-center mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm font-bold uppercase">4.9/5 Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              POWERFUL FEATURES
            </h2>
            <p className="text-lg font-semibold bg-neo-blue border-2 border-black px-4 py-1 inline-block transform rotate-1">
              Everything you need in one place
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 bg-gradient-to-br from-neo-yellow/20 to-neo-pink/20">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-yellow border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Single Image Edit</CardTitle>
                <CardDescription className="font-medium">
                  Full editing suite for single images - filters, effects, text & more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-pink border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Layers className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">10+ Merge Layouts</CardTitle>
                <CardDescription className="font-medium">
                  Grid, collage, overlay, circular, diagonal & more professional layouts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 bg-gradient-to-br from-neo-purple/20 to-neo-pink/20">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-purple border-2 border-black flex items-center justify-center mb-4 transform rotate-6">
                  <Layers className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">16 Collage Templates</CardTitle>
                <CardDescription className="font-medium">
                  Professional collage layouts - Grid, Story, Magazine, Polaroid & more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:-rotate-1 relative">
              <Badge className="absolute top-3 right-3 bg-neo-yellow text-black border-2 border-black font-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-neo-blue border-2 border-black flex items-center justify-center mb-4 transform rotate-6">
                  <Palette className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Color Grading</CardTitle>
                <CardDescription className="font-medium">
                  33 professional color grading presets - Cinematic, Vintage, Creative & more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-green border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Wand2 className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Text & Stickers</CardTitle>
                <CardDescription className="font-medium">
                  Add text layers, emoji stickers, and drawing annotations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:-rotate-1 relative">
              <Badge className="absolute top-3 right-3 bg-neo-yellow text-black border-2 border-black font-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-neo-yellow border-2 border-black flex items-center justify-center mb-4 transform rotate-6">
                  <Film className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">GIF Animation</CardTitle>
                <CardDescription className="font-medium">
                  Create animated GIFs with smooth transitions, fade effects & more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-purple border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Sparkles className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Image Masks</CardTitle>
                <CardDescription className="font-medium">
                  Apply shape masks (circle, heart, star) & gradient masks with effects
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:-rotate-1 bg-gradient-to-br from-neo-cyan/20 to-neo-blue/20">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-cyan border-2 border-black flex items-center justify-center mb-4 transform rotate-6">
                  <SplitIcon className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Before/After View</CardTitle>
                <CardDescription className="font-medium">
                  Compare original vs edited with side-by-side or interactive slider views
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-pink border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Crop & Transform</CardTitle>
                <CardDescription className="font-medium">
                  Crop images with preset ratios, rotate, flip & reorder layers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-blue border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Zap className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Undo/Redo</CardTitle>
                <CardDescription className="font-medium">
                  Full history management with keyboard shortcuts - never lose work
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:-rotate-1">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-green border-2 border-black flex items-center justify-center mb-4 transform rotate-6">
                  <FolderOpen className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Save Projects</CardTitle>
                <CardDescription className="font-medium">
                  Save & load your projects - continue editing anytime, anywhere
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 relative bg-gradient-to-br from-neo-purple/20 to-neo-cyan/20">
              <Badge className="absolute top-3 right-3 bg-neo-yellow text-black border-2 border-black font-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-neo-purple border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Eraser className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Background Removal</CardTitle>
                <CardDescription className="font-medium">
                  AI-powered background removal with transparent PNG export
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 relative bg-gradient-to-br from-neo-pink/20 to-neo-purple/20">
              <Badge className="absolute top-3 right-3 bg-neo-yellow text-black border-2 border-black font-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-neo-pink border-2 border-black flex items-center justify-center mb-4 transform rotate-3">
                  <Sparkles className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Face Retouch</CardTitle>
                <CardDescription className="font-medium">
                  AI-powered face enhancement, skin smoothing, and blemish removal
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:-rotate-1 relative bg-gradient-to-br from-neo-cyan/20 to-neo-purple/20">
              <Badge className="absolute top-3 right-3 bg-neo-yellow text-black border-2 border-black font-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-neo-cyan border-2 border-black flex items-center justify-center mb-4 transform -rotate-3">
                  <Wand2 className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Magic Eraser</CardTitle>
                <CardDescription className="font-medium">
                  Remove unwanted objects, people, or text by simply brushing over them
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:-rotate-1 relative bg-gradient-to-br from-neo-cyan/20 to-neo-pink/20">
              <Badge className="absolute top-3 right-3 bg-neo-yellow text-black border-2 border-black font-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-neo-cyan border-2 border-black flex items-center justify-center mb-4 transform rotate-6">
                  <Zap className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Glitch Effects</CardTitle>
                <CardDescription className="font-medium">
                  RGB Split, Scanlines, Digital Distortion, Noise & Color Shift effects
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 relative bg-gradient-to-br from-neo-pink/20 to-neo-yellow/20">
              <Badge className="absolute top-3 right-3 bg-neo-yellow text-black border-2 border-black font-black flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-neo-pink border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Sparkles className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Light Leaks & Overlays</CardTitle>
                <CardDescription className="font-medium">
                  Add cinematic light effects - Sun flares, rainbow leaks & vintage overlays
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 relative">
              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-black font-bold shadow-neo">
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-purple-500 border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Layers className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="font-black uppercase">Advanced Shadows</CardTitle>
                <CardDescription className="font-medium">
                  Add depth with drop, inner, angle, or curved shadows for professional effects
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 relative">
              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-black font-bold shadow-neo">
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-indigo-500 border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="font-black uppercase">Bokeh & Depth Effects</CardTitle>
                <CardDescription className="font-medium">
                  Create professional depth-of-field blur to make subjects pop with camera-like focus
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1 relative">
              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-black font-bold shadow-neo">
                PRO
              </Badge>
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-orange-500 border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Palette className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="font-black uppercase">Duotone Effects</CardTitle>
                <CardDescription className="font-medium">
                  Create stylistic two-tone color effects with custom shadows and highlights
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all transform hover:rotate-1">
              <CardHeader>
                <div className="h-14 w-14 bg-neo-yellow border-2 border-black flex items-center justify-center mb-4 transform -rotate-6">
                  <Download className="h-7 w-7" />
                </div>
                <CardTitle className="font-black uppercase">Export & Share</CardTitle>
                <CardDescription className="font-medium">
                  HD quality PNG/JPEG exports & instant social media sharing
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-neo-green/20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-lg font-semibold">Create stunning compositions in 3 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-4 border-black p-8 shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
              <div className="h-16 w-16 bg-neo-pink text-white border-2 border-black flex items-center justify-center text-3xl font-black mx-auto mb-6 transform -rotate-6">
                1
              </div>
              <div className="h-12 w-12 bg-neo-yellow border-2 border-black flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black uppercase mb-3 text-center">Upload Images</h3>
              <p className="text-center font-medium">
                Upload 1-8 images to edit or merge. All formats supported!
              </p>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
              <div className="h-16 w-16 bg-neo-blue text-white border-2 border-black flex items-center justify-center text-3xl font-black mx-auto mb-6 transform rotate-6">
                2
              </div>
              <div className="h-12 w-12 bg-neo-pink border-2 border-black flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black uppercase mb-3 text-center">Edit & Style</h3>
              <p className="text-center font-medium">
                Choose layouts, apply filters, add text & customize everything
              </p>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
              <div className="h-16 w-16 bg-neo-green text-white border-2 border-black flex items-center justify-center text-3xl font-black mx-auto mb-6 transform -rotate-6">
                3
              </div>
              <div className="h-12 w-12 bg-neo-blue border-2 border-black flex items-center justify-center mx-auto mb-4">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black uppercase mb-3 text-center">Export & Share</h3>
              <p className="text-center font-medium">
                Download HD images or create GIFs. Share anywhere!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">
                WHY CHOOSE US?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-neo-yellow/20 border-2 border-black p-4">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black uppercase">Save Hours Weekly</p>
                    <p className="font-medium text-sm">Automate tasks that used to take hours in Photoshop</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-neo-pink/20 border-2 border-black p-4">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black uppercase">Professional Quality</p>
                    <p className="font-medium text-sm">Studio-quality results without expensive software</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-neo-blue/20 border-2 border-black p-4">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black uppercase">Boost Productivity</p>
                    <p className="font-medium text-sm">Create multiple variations in minutes, not hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-neo-green/20 border-2 border-black p-4">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black uppercase">Cloud-Based</p>
                    <p className="font-medium text-sm">Access anywhere, anytime, on any device</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 aspect-square border-4 border-black shadow-neo overflow-hidden">
              <img 
                src="https://cdn.hercules.app/file_mBzyXtELAFiobTv1SQl2ne3Y" 
                alt="FixMyImage editor interface" 
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-neo-purple/10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              PERFECT FOR
            </h2>
            <p className="text-lg font-semibold">Designed for creators & professionals</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: "Social Media Managers", desc: "Create posts, stories & ads for all platforms", color: "neo-pink" },
              { icon: Briefcase, title: "Marketing Agencies", desc: "Deliver stunning visuals for campaigns faster", color: "neo-blue" },
              { icon: Users, title: "Content Creators", desc: "Design thumbnails & promotional graphics", color: "neo-yellow" },
              { icon: TrendingUp, title: "E-commerce Stores", desc: "Beautiful product collages & comparisons", color: "neo-green" },
              { icon: Sparkles, title: "Photographers", desc: "Create portfolios & before/after shots", color: "neo-purple" },
              { icon: Zap, title: "Small Businesses", desc: "Professional marketing materials easily", color: "neo-pink" },
            ].map((item, idx) => (
              <Card key={idx} className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
                <CardHeader>
                  <div className={`h-12 w-12 bg-${item.color} border-2 border-black flex items-center justify-center mb-3`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-black text-lg uppercase">{item.title}</CardTitle>
                  <CardDescription className="font-medium">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              SIMPLE PRICING
            </h2>
            <p className="text-lg font-semibold bg-neo-yellow border-2 border-black px-4 py-1 inline-block">
              Choose what works for you
            </p>
          </div>
          
          <PricingCards />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-neo-blue/10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              WHAT USERS SAY
            </h2>
            <p className="text-lg font-semibold">Join thousands of happy creators</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { 
                name: "Sarah Chen", 
                role: "Content Creator", 
                text: "This tool is a game changer! I can now create stunning collages for my Instagram in minutes. The color grading presets are absolutely perfect.", 
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format",
                platform: "twitter"
              },
              { 
                name: "Marcus Williams", 
                role: "Marketing Manager", 
                text: "We were using Photoshop for hours to create social media assets. FixMyImage cut our workflow time by 80%. The batch processing is incredible!", 
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
                platform: "producthunt"
              },
              { 
                name: "Priya Sharma", 
                role: "Photographer", 
                text: "The before/after slider is perfect for showcasing my editing work to clients. Professional quality without the expensive software subscription.", 
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
                platform: "linkedin"
              },
              { 
                name: "Jake Morrison", 
                role: "E-commerce Store Owner", 
                text: "Creating product collages used to take forever. Now I can do it in under 5 minutes. This has seriously boosted our conversion rates!", 
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
                platform: "producthunt"
              },
              { 
                name: "Emma Rodriguez", 
                role: "Social Media Manager", 
                text: "The GIF animation feature is pure gold. We create animated posts that get 3x more engagement. Best $9/month I've ever spent.", 
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format",
                platform: "twitter"
              },
              { 
                name: "David Kim", 
                role: "Graphic Designer", 
                text: "Honestly blown away by the quality. The background removal is better than tools 10x the price. Highly recommend for any creative professional.", 
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format",
                platform: "linkedin"
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all bg-white p-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full border-2 border-black object-cover"
                        loading="lazy"
                        width="48"
                        height="48"
                      />
                      <div>
                        <p className="font-black text-sm">{testimonial.name}</p>
                        <p className="text-xs font-medium text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      {testimonial.platform === "twitter" && (
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      )}
                      {testimonial.platform === "producthunt" && (
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.604 9.113h-3.301V12.2h3.301c.851 0 1.543-.692 1.543-1.543s-.692-1.544-1.543-1.544zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.604 14.658h-3.301v3.301H7.845V6.041h5.759c2.409 0 4.301 1.892 4.301 4.301s-1.892 4.316-4.301 4.316z"/>
                        </svg>
                      )}
                      {testimonial.platform === "linkedin" && (
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
              FAQ
            </h2>
            <p className="text-lg font-semibold">Everything you need to know</p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "Do I need design skills?", a: "Not at all! Our intuitive interface is designed for everyone. Upload, choose a layout, and customize." },
              { q: "Can I cancel anytime?", a: "Yes! Cancel your subscription at any time with no questions asked." },
              { q: "What formats are supported?", a: "We support JPG, PNG, WebP and more. Export in PNG or JPEG, plus animated GIFs!" },
              { q: "Do you offer refunds?", a: "Yes! We offer a 14-day money-back guarantee on all paid plans." },
            ].map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-2 border-black shadow-neo-sm">
                <AccordionTrigger className="px-4 font-bold hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="px-4 pb-4 font-medium">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-neo-yellow/20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              GET IN TOUCH
            </h2>
            <p className="text-lg font-semibold bg-neo-pink border-2 border-black px-4 py-1 inline-block transform -rotate-1">
              We'd love to hear from you
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-2 border-black shadow-neo">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-black uppercase">
                    <MessageSquare className="h-5 w-5" />
                    Feedback Welcome
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    We value your input and use it to improve FixMyImage
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            READY TO START?
          </h2>
          <p className="text-xl font-medium">
            Join thousands creating stunning image compositions today
          </p>
          <div className="flex justify-center">
            <Authenticated>
              <Button 
                size="lg" 
                className="bg-neo-yellow text-black border-4 border-white shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all font-black text-lg"
                asChild
              >
                <Link to="/editor">
                  START CREATING NOW
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Authenticated>
            <Unauthenticated>
              <SignInButton 
                size="lg" 
                className="bg-neo-yellow text-black border-4 border-white shadow-neo hover:shadow-neo-hover hover:-translate-y-2 transition-all font-black text-lg"
              />
            </Unauthenticated>
          </div>
          <p className="text-sm opacity-75 font-medium">No credit card required • Free forever plan</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 bg-neo-yellow border-2 border-black px-3 py-2 w-fit">
                <Layers className="h-5 w-5" />
                <span className="font-black uppercase">FixMyImage</span>
              </div>
              <p className="text-sm font-medium">
                Professional image editing made easy
              </p>
            </div>

            <div>
              <h3 className="font-black uppercase mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="font-medium hover:underline">Features</a></li>
                <li><a href="#pricing" className="font-medium hover:underline">Pricing</a></li>
                <li><Link to="/testimonials" className="font-medium hover:underline">Reviews</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-black uppercase mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="font-medium hover:underline">About</a></li>
                <li><a href="#contact" className="font-medium hover:underline">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-black uppercase mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="font-medium hover:underline">Privacy</Link></li>
                <li><Link to="/terms" className="font-medium hover:underline">Terms</Link></li>
                <li><Link to="/refund" className="font-medium hover:underline">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-black pt-8 text-center">
            <p className="text-sm font-medium">
              &copy; {new Date().getFullYear()} FixMyImage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
