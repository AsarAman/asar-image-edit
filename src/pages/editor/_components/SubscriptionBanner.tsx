import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { useState } from "react";
import UpgradeDialog from "./UpgradeDialog";

export default function SubscriptionBanner() {
  const canExportData = useQuery(api.subscriptions.canExport);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  if (!canExportData) return null;

  const { isPremium, exportsUsed, exportsLimit, exportsRemaining } =
    canExportData;

  if (isPremium) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 mb-6">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Premium Member</p>
              <p className="text-xs text-muted-foreground">
                Unlimited exports, no watermarks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLow = exportsRemaining !== null && exportsRemaining <= 3;
  const isOut = exportsRemaining === 0;

  return (
    <>
      <Card
        className={
          isOut
            ? "border-destructive/50 bg-destructive/5 mb-6"
            : isLow
              ? "border-orange-500/50 bg-orange-500/5 mb-6"
              : "border-border mb-6"
        }
      >
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium">
                Free Tier - {exportsUsed} / {exportsLimit} exports used
              </p>
              {isOut && (
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  Limit Reached
                </span>
              )}
              {isLow && !isOut && (
                <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">
                  Low
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOut
                ? "Upgrade to premium for unlimited exports"
                : `${exportsRemaining} exports remaining this month`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setUpgradeDialogOpen(true)}
            className="ml-4"
          >
            <Zap className="h-4 w-4 mr-1" />
            Upgrade
          </Button>
        </CardContent>
      </Card>

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
      />
    </>
  );
}
