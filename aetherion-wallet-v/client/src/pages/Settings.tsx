import { NotificationSettings } from "../components/dashboard/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Bell, Shield, User, Home, Menu } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'wouter';
import { appRoutes } from '@/lib/routes';

export default function Settings() {
  return (
    <div className="container px-2 py-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Header
          heading="Settings"
          subheading="Manage your account settings and preferences"
        />
        
        <Link href="/">
          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 flex items-center gap-2 rounded-full"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </Link>
      </div>
      <Separator className="my-4" />
      
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-full sm:max-w-md">
          <TabsTrigger value="profile" className="flex items-center justify-center gap-1 px-1 sm:px-3">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center gap-1 px-1 sm:px-3">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center gap-1 px-1 sm:px-3">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-muted-foreground">
                Profile settings will be implemented in a future update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security preferences and connected devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-muted-foreground">
                Security settings will be implemented in a future update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Back and Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center">
        {/* Back to Home Button */}
        <Link href="/">
          <Button
            variant="secondary"
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 flex items-center gap-2 rounded-full"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
        
        {/* Navigation Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <span>Navigation</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {appRoutes.map(route => (
              <DropdownMenuItem key={route.path} asChild>
                <Link href={route.path}>
                  {route.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Space at the bottom */}
      <div className="h-16"></div>
    </div>
  );
}