import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OnboardingStep {
  title: string;
  description: string;
  target?: string; // CSS selector for the element to highlight
  placement?: "top" | "bottom" | "left" | "right";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to FixMyImage! 🎨",
    description: "Let's take a quick tour of the editor. You can skip this anytime by clicking the X or pressing ESC.",
  },
  {
    title: "Step 1: Upload Images",
    description: "Start by uploading 1-8 images. You can drag and drop, reorder them, or remove any you don't need.",
    target: ".onboarding-upload",
  },
  {
    title: "Step 2: Remove Backgrounds",
    description: "Use AI to automatically remove backgrounds from your images. This works best for photos with clear subjects.",
    target: ".onboarding-remove-bg",
  },
  {
    title: "Step 3: Change Backgrounds",
    description: "Add new backgrounds! Choose from solid colors, gradients, patterns, or preset images. You can also upload your own.",
    target: ".onboarding-change-bg",
  },
  {
    title: "Step 4: Apply Effects",
    description: "Explore filters, crop tools, transforms, masks, text layers, stickers, and more to perfect your images.",
  },
  {
    title: "Step 5: Export & Share",
    description: "When you're done, click Export to download your creation or Share to post directly to social media.",
    target: ".onboarding-export",
  },
  {
    title: "You're Ready! 🚀",
    description: "That's it! Start creating amazing images. Need help? Just click the home button to return to the homepage.",
  },
];

const ONBOARDING_KEY = "fixmyimage_onboarding_completed";

interface OnboardingProps {
  onComplete?: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      // Small delay to let the page load
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setIsVisible(false);
        onComplete?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isVisible, onComplete]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Onboarding Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] max-w-2xl"
          >
            <Card className="border-4 border-black shadow-neo">
              <CardHeader className="relative bg-neo-yellow border-b-4 border-black p-6 sm:p-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="absolute top-4 right-4 h-10 w-10 sm:h-12 sm:w-12 border-2 border-black hover:bg-white hover:shadow-neo-sm transition-all"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-black uppercase pr-12 sm:pr-16 leading-tight">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-base sm:text-lg font-bold text-foreground/80 mt-2">
                  Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-foreground/90 min-h-[4rem] sm:min-h-[5rem]">
                  {step.description}
                </p>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 sm:gap-3 py-4">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2.5 sm:h-3 rounded-full transition-all border-2 border-black ${
                        index === currentStep
                          ? "w-10 sm:w-12 bg-neo-pink"
                          : index < currentStep
                          ? "w-2.5 sm:w-3 bg-black"
                          : "w-2.5 sm:w-3 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between gap-3 sm:gap-4 pt-2">
                  {!isFirstStep ? (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleSkip}
                      className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto"
                    >
                      Skip Tour
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    className="ml-auto bg-neo-pink text-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto"
                  >
                    {isLastStep ? (
                      "Get Started"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Highlight target element */}
          {step.target && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[99] pointer-events-none"
              style={{
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
              }}
            >
              <HighlightTarget selector={step.target} />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// Helper component to highlight target elements
function HighlightTarget({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const element = document.querySelector(selector);
      if (element) {
        const domRect = element.getBoundingClientRect();
        setRect(domRect);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    // Update on interval in case elements move
    const interval = setInterval(updateRect, 100);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      clearInterval(interval);
    };
  }, [selector]);

  if (!rect) return null;

  return (
    <div
      className="absolute bg-transparent border-4 border-neo-yellow rounded animate-pulse"
      style={{
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }}
    />
  );
}
