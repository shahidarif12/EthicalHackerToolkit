import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, User, Bell, Shield, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // These states would be connected to real APIs in a production app
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    scan: true,
    report: true,
    security: true
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    session: true,
    apiAccess: false
  });

  const handleProfileSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your profile settings have been updated successfully."
      });
    }, 1000);
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityToggle = (key: keyof typeof security) => {
    setSecurity(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API Access</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    defaultValue={user?.username} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">
                    Your username cannot be changed.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your Name" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input 
                    id="company" 
                    placeholder="Your Company" 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>
                  Customize your account preferences and settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes.
                    </p>
                  </div>
                  <Switch id="theme" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred time zone for reports and scans.
                    </p>
                  </div>
                  <div className="w-[180px]">
                    <select className="w-full rounded-md border border-input px-3 py-1 text-sm">
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>EST (Eastern Standard Time)</option>
                      <option>PST (Pacific Standard Time)</option>
                      <option>GMT (Greenwich Mean Time)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="language">Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred language.
                    </p>
                  </div>
                  <div className="w-[180px]">
                    <select className="w-full rounded-md border border-input px-3 py-1 text-sm">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Delivery Methods</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email.
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={() => handleNotificationToggle('email')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive in-browser push notifications.
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.browser}
                      onCheckedChange={() => handleNotificationToggle('browser')}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Scan Completion</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when security scans are completed.
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.scan}
                      onCheckedChange={() => handleNotificationToggle('scan')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Report Generation</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when new reports are generated.
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.report}
                      onCheckedChange={() => handleNotificationToggle('report')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify about critical security issues detected.
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.security}
                      onCheckedChange={() => handleNotificationToggle('security')}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <Switch 
                      checked={security.twoFactor}
                      onCheckedChange={() => handleSecurityToggle('twoFactor')}
                    />
                  </div>
                  
                  {security.twoFactor && (
                    <Alert className="mt-2">
                      <AlertTitle>Setup required</AlertTitle>
                      <AlertDescription>
                        You need to configure an authenticator app to complete two-factor setup.
                        <Button variant="link" className="p-0 h-auto ml-2">
                          Configure now
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Session Management</Label>
                        <p className="text-sm text-muted-foreground">
                          Stay logged in on this device.
                        </p>
                      </div>
                      <Switch 
                        checked={security.session}
                        onCheckedChange={() => handleSecurityToggle('session')}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full sm:w-auto">
                      Change Password
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      It's a good practice to change your password regularly.
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full sm:w-auto text-destructive">
                      Log Out Of All Devices
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will sign you out from all browsers and devices.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Save Security Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* API Access Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Manage access to the SecureTest API for integrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Enable API Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow programmatic access to your account via API.
                      </p>
                    </div>
                    <Switch 
                      checked={security.apiAccess}
                      onCheckedChange={() => handleSecurityToggle('apiAccess')}
                    />
                  </div>

                  {security.apiAccess ? (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-1">
                        <Label htmlFor="api-key">API Key</Label>
                        <div className="flex">
                          <Input
                            id="api-key"
                            type="password"
                            value="••••••••••••••••••••••••••••••"
                            readOnly
                            className="rounded-r-none"
                          />
                          <Button
                            variant="outline"
                            className="rounded-l-none border-l-0"
                          >
                            Show
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline">
                          Generate New API Key
                        </Button>
                        <Button variant="destructive">
                          Revoke API Key
                        </Button>
                      </div>

                      <Alert>
                        <Database className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          Your API key provides full access to your account. Never share it publicly or include it in client-side code.
                        </AlertDescription>
                      </Alert>

                      <div className="pt-4 border-t">
                        <h3 className="text-base font-medium mb-2">API Documentation</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Learn how to use the SecureTest API to integrate security testing into your workflow.
                        </p>
                        <Button variant="outline">
                          View API Documentation
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertTitle>API Access Disabled</AlertTitle>
                      <AlertDescription>
                        Enable API access to generate API keys and integrate with other services.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleProfileSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Save API Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}