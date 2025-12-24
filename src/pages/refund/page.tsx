import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Layers, DollarSign } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 bg-neo-yellow border-2 border-black px-3 py-2 shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <Layers className="h-6 w-6" />
            <span className="font-black text-lg uppercase tracking-tighter">FixMyImage</span>
          </Link>
          
          <Button 
            variant="ghost" 
            asChild 
            className="border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK TO HOME
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-neo-pink border-2 border-black px-6 py-3 shadow-neo">
            <DollarSign className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-black uppercase">Refund Policy</h1>
          </div>
          <p className="text-lg font-medium">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="border-2 border-black shadow-neo">
          <CardContent className="pt-6">
            <p className="font-medium text-lg">
              At FixMyImage, we stand behind our product and want you to be completely satisfied. This Refund Policy explains when you may be eligible for a refund and how to request one.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-yellow/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">14-Day Money-Back Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We offer a <strong>14-day money-back guarantee</strong> on all paid plans. If you're not satisfied with FixMyImage for any reason, you can request a full refund within 14 days of your purchase.
              </p>
              <div className="bg-neo-yellow/30 border-2 border-black p-4">
                <p className="font-black text-lg mb-2">Applies To:</p>
                <ul className="space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span>Pro monthly subscription ($9/month)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span>Lifetime plan ($120 one-time)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-pink/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">How to Request a Refund</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                To request a refund, follow these simple steps:
              </p>
              <ol className="space-y-3 font-medium">
                <li className="flex items-start gap-3">
                  <span className="bg-neo-pink border border-black w-8 h-8 flex items-center justify-center shrink-0 font-black">1</span>
                  <span>Contact us through our contact form or email within 14 days of purchase</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-neo-pink border border-black w-8 h-8 flex items-center justify-center shrink-0 font-black">2</span>
                  <span>Include your account email and reason for refund (optional but helpful)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-neo-pink border border-black w-8 h-8 flex items-center justify-center shrink-0 font-black">3</span>
                  <span>We'll process your refund within 3-5 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-neo-pink border border-black w-8 h-8 flex items-center justify-center shrink-0 font-black">4</span>
                  <span>Refund will be issued to your original payment method</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-blue/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">Refund Processing Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Approval:</strong> Refund requests are typically approved within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Processing:</strong> Refunds are processed within 3-5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Bank/Card:</strong> May take an additional 5-10 business days to appear in your account depending on your payment provider</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-green/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">Monthly Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-black text-lg mb-2">First Payment</h3>
                <p className="font-medium">
                  Your first monthly payment is eligible for a full refund within 14 days.
                </p>
              </div>
              <div>
                <h3 className="font-black text-lg mb-2">Renewal Payments</h3>
                <p className="font-medium">
                  Monthly renewal payments are generally not refundable. However, we evaluate each case individually. If you believe you deserve a refund on a renewal, please contact us.
                </p>
              </div>
              <div>
                <h3 className="font-black text-lg mb-2">Cancellation</h3>
                <p className="font-medium">
                  You can cancel your subscription at any time. You'll retain access until the end of your current billing period.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-purple/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">Lifetime Plan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                The Lifetime plan is eligible for a full refund if requested within 14 days of purchase. After 14 days, the purchase is final and non-refundable.
              </p>
              <p className="font-medium">
                We believe our Lifetime plan offers exceptional value, and we encourage you to try our Pro monthly plan first if you're uncertain.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-yellow/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">Special Circumstances</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium mb-3">
                We understand that special situations may arise. We may grant refunds outside our standard policy for:
              </p>
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Extended service outages affecting your ability to use our platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Billing errors or duplicate charges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Technical issues preventing access to purchased features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Other exceptional circumstances reviewed on a case-by-case basis</span>
                </li>
              </ul>
              <p className="font-medium">
                Contact us to discuss your situation, and we'll work with you to find a fair solution.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-pink/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">Non-Refundable Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <p className="font-medium mb-3">The following are not eligible for refunds:</p>
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Refund requests made after 14 days (unless special circumstances apply)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Accounts terminated for violation of our Terms of Service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Partial month refunds on monthly subscriptions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-blue/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">After a Refund</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Your subscription will be immediately downgraded to the free plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>You'll retain access to your projects but lose premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>You can upgrade again at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Your account and data remain active</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-green/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">Questions About Refunds?</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                If you have any questions about our refund policy or need assistance with a refund request, please don't hesitate to contact us. We're here to help!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <Card className="border-4 border-black shadow-neo bg-neo-pink/20">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="font-black text-xl uppercase">Need Help With a Refund?</p>
            <Button 
              className="bg-neo-green text-white border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all font-bold"
              asChild
            >
              <Link to="/#contact">CONTACT US</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black py-8 mt-12">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} FixMyImage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
