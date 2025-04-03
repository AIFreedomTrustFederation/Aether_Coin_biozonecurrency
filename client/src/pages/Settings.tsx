import { NotificationSettings } from "../components/dashboard/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Bell, Shield, User } from "lucide-react";

export default function Settings() {
  return (
    <div className="container py-4 max-w-6xl mx-auto">
      <Header
        heading="Account Settings"
        subheading="Manage your account settings and preferences"
      />
      <Separator className="my-6" />
      
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
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
    </div>
  );
}