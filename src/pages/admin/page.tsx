
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@/components/ui/signin";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Users, MessageSquare, Mail, ArrowLeft } from "lucide-react";
import UsersTable from "./_components/UsersTable";
import PlatformStats from "./_components/PlatformStats";
import TestimonialsManagement from "./_components/TestimonialsManagement";
import ContactSubmissions from "./_components/ContactSubmissions";

function AdminDashboardInner() {
  const isAdmin = useQuery(api.admin.isCurrentUserAdmin);

  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64 border-2 border-black" />
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 border-2 border-black" />
            ))}
          </div>
          <Skeleton className="h-96 border-2 border-black" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" asChild className="border-2 border-black hover:shadow-neo-sm transition-all">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 bg-neo-blue border-2 border-black px-3 py-2 shadow-neo-sm">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              <h1 className="text-sm sm:text-lg font-black uppercase">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="border-4 border-black p-6 shadow-neo bg-neo-yellow/20">
          <h2 className="text-2xl sm:text-3xl font-black mb-2 uppercase">Platform Overview</h2>
          <p className="text-sm sm:text-base font-medium">
            Manage users, subscriptions, and monitor platform activity
          </p>
        </div>

        <PlatformStats />

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto border-2 border-black shadow-neo">
            <TabsTrigger value="users" className="gap-2 font-bold data-[state=active]:bg-neo-pink data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">USERS</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2 font-bold data-[state=active]:bg-neo-blue data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">REVIEWS</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2 font-bold data-[state=active]:bg-neo-green data-[state=active]:text-white">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">CONTACT</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-2 border-black shadow-neo">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-black uppercase">User Management</CardTitle>
                <CardDescription className="text-sm font-medium">
                  View and manage all users and their subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <UsersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <Card className="border-2 border-black shadow-neo">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-black uppercase">Testimonials Management</CardTitle>
                <CardDescription className="text-sm font-medium">
                  Review and approve user testimonials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TestimonialsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card className="border-2 border-black shadow-neo">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-black uppercase">Contact Submissions</CardTitle>
                <CardDescription className="text-sm font-medium">
                  View and respond to user inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactSubmissions />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Card className="max-w-md w-full border-4 border-black shadow-neo">
            <CardHeader>
              <CardTitle className="font-black uppercase">Admin Access Required</CardTitle>
              <CardDescription className="font-medium">
                Please sign in to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInButton className="bg-neo-blue text-white border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-y-1 transition-all font-bold" />
            </CardContent>
          </Card>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Skeleton className="h-96 w-full max-w-4xl border-4 border-black" />
        </div>
      </AuthLoading>
      <Authenticated>
        <AdminDashboardInner />
      </Authenticated>
    </>
  );
}
