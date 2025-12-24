import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Layers, FileText } from "lucide-react";

export default function TermsAndConditions() {
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
          <div className="inline-flex items-center gap-3 bg-neo-green border-2 border-black px-6 py-3 shadow-neo">
            <FileText className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-black uppercase">Terms & Conditions</h1>
          </div>
          <p className="text-lg font-medium">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="border-2 border-black shadow-neo">
          <CardContent className="pt-6">
            <p className="font-medium text-lg">
              Welcome to FixMyImage! By accessing or using our service, you agree to be bound by these Terms and Conditions. Please read them carefully before using our platform.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-yellow/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                By creating an account and using FixMyImage, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
              </p>
              <p className="font-medium">
                If you do not agree to these terms, please do not use our service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-pink/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                FixMyImage is a web-based image editing platform that allows users to merge, edit, and enhance multiple images with various tools and effects.
              </p>
              <p className="font-medium">
                We offer both free and paid subscription tiers with different feature sets and usage limits.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-blue/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>You must be at least 13 years old to use our service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>You are responsible for maintaining the security of your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>You must provide accurate and complete information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>One person or entity may maintain only one free account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>You are responsible for all activity under your account</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-green/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">4. Subscription and Payment</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-black text-lg mb-2">Pricing Plans</h3>
                <ul className="space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-green border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span><strong>Free Plan:</strong> 10 exports per month with basic features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-green border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span><strong>Pro Plan:</strong> $9/month with unlimited exports and all features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-green border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span><strong>Lifetime Plan:</strong> $120 one-time payment for lifetime access</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-black text-lg mb-2">Billing Terms</h3>
                <ul className="space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-green border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span>Pro subscriptions renew automatically each month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-green border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span>You can cancel your subscription at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-green border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span>We reserve the right to change pricing with 30 days notice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-neo-green border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                    <span>All payments are processed securely through Paddle</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-purple/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">5. User Content and Ownership</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                <strong>Your Content:</strong> You retain all ownership rights to the images you upload and create using FixMyImage. We claim no ownership over your content.
              </p>
              <p className="font-medium">
                <strong>License to Us:</strong> By uploading content, you grant us a limited license to store, process, and display your content solely for the purpose of providing our service.
              </p>
              <p className="font-medium">
                <strong>Your Responsibility:</strong> You are solely responsible for ensuring you have the right to upload and edit any images. Do not upload content that infringes on others' intellectual property rights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-yellow/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">6. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <p className="font-medium mb-3">You agree not to use FixMyImage to:</p>
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Upload illegal, harmful, or offensive content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Violate any intellectual property rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Attempt to hack, disrupt, or compromise our service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Use automated tools to access our service (bots, scrapers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Resell or redistribute our service without permission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-yellow border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>Circumvent usage limits or access controls</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-pink/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">7. Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We strive to provide reliable service, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of our service at any time.
              </p>
              <p className="font-medium">
                We are not liable for any loss or damage resulting from service downtime or unavailability.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-blue/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                FixMyImage is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our service.
              </p>
              <p className="font-medium">
                Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-green/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We reserve the right to suspend or terminate your account at any time for violation of these terms or for any reason at our discretion.
              </p>
              <p className="font-medium">
                You may delete your account at any time. Upon termination, your right to use the service will immediately cease.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-purple/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We may update these Terms and Conditions from time to time. Continued use of our service after changes constitutes acceptance of the new terms.
              </p>
              <p className="font-medium">
                We will notify you of significant changes via email or through our service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-yellow/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">11. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-pink/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                If you have any questions about these Terms and Conditions, please contact us through our website.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <Card className="border-4 border-black shadow-neo bg-neo-green/20">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="font-black text-xl uppercase">Questions About Our Terms?</p>
            <Button 
              className="bg-neo-blue text-white border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all font-bold"
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
