import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import { useState } from "react";
import { ConvexError } from "convex/values";
import { trackCheckoutStarted } from "@/lib/analytics";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpgradeDialog({
  open,
  onOpenChange,
}: UpgradeDialogProps) {
  const [isUpgradingPro, setIsUpgradingPro] = useState(false);
  const [isUpgradingLifetime, setIsUpgradingLifetime] = useState(false);
  const createCheckout = useAction(api.payments.createCheckoutUrl);

  const handleUpgrade = async (tier: "pro" | "lifetime") => {
    const setLoading = tier === "pro" ? setIsUpgradingPro : setIsUpgradingLifetime;
    setLoading(true);
    try {
      trackCheckoutStarted(tier);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-primary" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Unlock unlimited exports and all premium features
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 my-6">
          {/* Pro Tier */}
          <div className="border-2 border-primary rounded-lg p-6 space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                Most Popular
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                Pro
                <Crown className="h-5 w-5 text-primary" />
              </h3>
              <div className="text-3xl font-bold">$9</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  Unlimited exports
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Up to 8 images</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">HD quality</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">GIF animations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            <Button 
              onClick={() => handleUpgrade("pro")} 
              disabled={isUpgradingPro || isUpgradingLifetime}
              className="w-full"
            >
              {isUpgradingPro ? (
                "Loading..."
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </>
              )}
            </Button>
          </div>

          {/* Lifetime Tier */}
          <div className="border-2 border-yellow-500 rounded-lg p-6 space-y-4 bg-gradient-to-br from-yellow-50 to-yellow-100 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Best Value
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                Lifetime
                <Crown className="h-5 w-5 text-yellow-600" />
              </h3>
              <div className="text-3xl font-bold">$120</div>
              <p className="text-sm text-muted-foreground">one-time payment</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  Everything in Pro
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  Lifetime access
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm">All future updates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm">Brand customization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <span className="text-sm">Dedicated support</span>
              </li>
            </ul>
            <Button 
              onClick={() => handleUpgrade("lifetime")} 
              disabled={isUpgradingPro || isUpgradingLifetime}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isUpgradingLifetime ? (
                "Loading..."
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Get Lifetime Deal
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
