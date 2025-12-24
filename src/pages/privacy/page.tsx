import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Layers, Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
          <div className="inline-flex items-center gap-3 bg-neo-blue border-2 border-black px-6 py-3 shadow-neo">
            <Shield className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-black uppercase">Privacy Policy</h1>
          </div>
          <p className="text-lg font-medium">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="border-2 border-black shadow-neo">
          <CardContent className="pt-6">
            <p className="font-medium text-lg">
              At FixMyImage, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our image editing service.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-yellow/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-black text-lg mb-2">Personal Information</h3>
                <p className="font-medium">
                  When you create an account, we collect your name, email address, and authentication details provided through Google or Microsoft OAuth.
                </p>
              </div>
              <div>
                <h3 className="font-black text-lg mb-2">Usage Data</h3>
                <p className="font-medium">
                  We collect information about your interactions with our service, including projects created, images uploaded, features used, and subscription status.
                </p>
              </div>
              <div>
                <h3 className="font-black text-lg mb-2">Image Data</h3>
                <p className="font-medium">
                  Images you upload to our service are stored securely in our cloud infrastructure. We do not access, view, or use your images for any purpose other than providing our service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-pink/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>To provide, maintain, and improve our image editing service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>To process your payments and manage your subscription</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>To send you service-related notifications and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>To respond to your inquiries and provide customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-pink border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span>To detect, prevent, and address technical issues and security threats</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-green/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">3. Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We implement industry-standard security measures to protect your data. Your images and personal information are stored on secure cloud servers with encryption in transit and at rest.
              </p>
              <p className="font-medium">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-blue/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">4. Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Service Providers:</strong> With trusted third-party services (payment processors, cloud storage, authentication) that help us operate our platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-blue border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition of our company</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-purple/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">5. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-2">
                  <span className="bg-neo-purple border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Access:</strong> Request access to your personal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-purple border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Correction:</strong> Request correction of inaccurate data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-purple border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Deletion:</strong> Request deletion of your account and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-purple border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Export:</strong> Download your projects and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neo-purple border border-black w-6 h-6 flex items-center justify-center shrink-0 font-black">•</span>
                  <span><strong>Opt-out:</strong> Unsubscribe from marketing emails</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-yellow/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">6. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and maintain your session. You can control cookies through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-pink/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-green/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">8. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all">
            <CardHeader className="bg-neo-blue/20 border-b-2 border-black">
              <CardTitle className="font-black uppercase">9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="font-medium">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us through the contact form on our website.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <Card className="border-4 border-black shadow-neo bg-neo-yellow/20">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="font-black text-xl uppercase">Questions About Your Privacy?</p>
            <Button 
              className="bg-neo-pink text-white border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all font-bold"
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
