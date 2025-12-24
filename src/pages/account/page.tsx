import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useAuth } from "@/hooks/use-auth";
import { 
  Crown, 
  Download, 
  Calendar,
  ArrowLeft,
  Zap,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import UserProfileDropdown from "@/components/UserProfileDropdown";

export default function AccountPage() {
  const { user } = useAuth();
  const subscriptionStatus = useQuery(api.subscriptions.getSubscriptionStatus);
  const canExport = useQuery(api.subscriptions.canExport);
  const createCheckout = useAction(api.payments.createCheckoutUrl);
  const [isUpgradingPro, setIsUpgradingPro] = useState(false);
  const [isUpgradingLifetime, setIsUpgradingLifetime] = useState(false);

  const handleUpgrade = async (tier: "pro" | "lifetime") => {
    const setLoading = tier === "pro" ? setIsUpgradingPro : setIsUpgradingLifetime;
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

  const getTierDisplay = (tier: string | undefined) => {
    if (tier === "premium") return "Pro";
    if (tier === "lifetime") return "Lifetime";
    return "Free";
  };

  const getTierColor = (tier: string | undefined) => {
    if (tier === "premium") return "bg-primary text-primary-foreground";
    if (tier === "lifetime") return "bg-yellow-500 text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 bg-neo-yellow border-2 border-black px-3 py-2 shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <span className="font-black text-lg uppercase tracking-tighter">FixMyImage</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button 
              size="sm"
              variant="outline"
              className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
              asChild
            >
              <Link to="/editor">OPEN EDITOR</Link>
            </Button>
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 font-bold"
          asChild
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Account Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            My Account
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Manage your subscription and view usage
          </p>
        </div>

        {!subscriptionStatus || !canExport ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <Card className="border-2 border-black shadow-neo">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-black uppercase flex items-center gap-2">
                      Current Plan
                      {(subscriptionStatus.tier === "premium" || subscriptionStatus.tier === "lifetime") && (
                        <Crown className="h-5 w-5 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription className="font-medium">
                      Your active subscription
                    </CardDescription>
                  </div>
                  <Badge className={`${getTierColor(subscriptionStatus.tier)} font-bold text-sm px-3 py-1`}>
                    {getTierDisplay(subscriptionStatus.tier)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      <span className="font-bold">Exports</span>
                    </div>
                    {canExport.tier === "lifetime" ? (
                      <span className="font-bold text-primary">Unlimited</span>
                    ) : canExport.tier === "premium" ? (
                      <span className="font-bold">
                        {canExport.exportsRemaining} / {canExport.exportsLimit} remaining
                      </span>
                    ) : (
                      <span className="font-bold">
                        {canExport.exportsRemaining} / {canExport.exportsLimit} remaining
                      </span>
                    )}
                  </div>

                  {canExport.tier !== "lifetime" && (
                    <>
                      <Progress 
                        value={(canExport.exportsUsed / (canExport.exportsLimit || 1)) * 100} 
                        className="h-3"
                      />
                      <p className="text-sm text-muted-foreground font-medium">
                        {canExport.exportsUsed} of {canExport.exportsLimit} exports used this month
                      </p>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Quality</p>
                        <p className="text-sm text-muted-foreground">
                          {canExport.isPremium ? "HD Quality" : "Standard"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FolderOpen className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Projects</p>
                        <p className="text-sm text-muted-foreground">Unlimited</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Section */}
            {subscriptionStatus.tier === "free" && (
              <Card className="border-2 border-black shadow-neo bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="font-black uppercase flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Upgrade Your Plan
                  </CardTitle>
                  <CardDescription className="font-medium">
                    Get unlimited exports and premium features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Pro Plan */}
                    <div className="border-2 border-primary rounded-lg p-4 space-y-3 bg-white relative">
                      <div className="absolute top-2 right-2">
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                          Popular
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-lg uppercase">Pro</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black">$9</span>
                          <span className="text-sm text-muted-foreground font-medium">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">80 exports/month</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>8 images per project</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>No watermark</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>Priority support</span>
                        </li>
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade("pro")}
                        disabled={isUpgradingPro || isUpgradingLifetime}
                        className="w-full font-bold"
                      >
                        {isUpgradingPro ? "Loading..." : "Upgrade to Pro"}
                      </Button>
                    </div>

                    {/* Lifetime Plan */}
                    <div className="border-2 border-yellow-500 rounded-lg p-4 space-y-3 bg-gradient-to-br from-yellow-50 to-yellow-100 relative">
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          Best Value
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-lg uppercase">Lifetime</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black">$120</span>
                          <span className="text-sm text-muted-foreground font-medium">one-time</span>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Unlimited exports</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">8 images per project</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Lifetime access</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                          <span>All future updates</span>
                        </li>
                      </ul>
                      <Button 
                        onClick={() => handleUpgrade("lifetime")}
                        disabled={isUpgradingPro || isUpgradingLifetime}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                      >
                        {isUpgradingLifetime ? "Loading..." : "Get Lifetime Deal"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Info */}
            <Card className="border-2 border-black shadow-neo">
              <CardHeader>
                <CardTitle className="font-black uppercase">Account Details</CardTitle>
                <CardDescription className="font-medium">
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-bold text-sm">Name</span>
                    <span className="text-sm">{user?.profile.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-bold text-sm">Email</span>
                    <span className="text-sm">{user?.profile.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-bold text-sm">Status</span>
                    <Badge variant={subscriptionStatus.status === "active" ? "default" : "secondary"}>
                      {subscriptionStatus.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
