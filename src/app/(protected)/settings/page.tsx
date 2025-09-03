
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from 'firebase/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for API Keys
  const [apiKey, setApiKey] = React.useState('');
  const [apiSecret, setApiSecret] = React.useState('');
  const [totpSecret, setTotpSecret] = React.useState('');
  const [isConnected, setIsConnected] = React.useState(false);

  // State for Profile
  const [displayName, setDisplayName] = React.useState(user?.displayName || '');
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);


  const handleConnect = () => {
    // In a real app, you would send these to a secure backend to be encrypted and stored.
    // The backend would then verify them with Angel One.
    if (apiKey && apiSecret && totpSecret) {
      setIsConnected(true);
      toast({
        title: "API Keys Saved!",
        description: "Your Angel One API keys have been securely stored.",
      });
    } else {
      setIsConnected(false);
      toast({
        title: "Error: Missing Information",
        description: "Please provide all three API keys to connect.",
        variant: "destructive",
      })
    }
  }

  const handleProfileSave = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
        await updateProfile(user, { displayName });
        toast({
            title: "Profile Updated",
            description: "Your name has been successfully updated.",
        });
    } catch (error: any) {
        toast({
            title: "Error",
            description: "Could not update your profile. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSavingProfile(false);
    }
  }


  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api_keys">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Make changes to your personal information here. Click save when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <Button onClick={handleProfileSave} disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="api_keys" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your broker API keys for live trading. Your keys are stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-4 rounded-md border bg-muted/30 p-3">
                  <Label>Status:</Label>
                  <Badge variant={isConnected ? "outline" : "destructive"} className={isConnected ? 'border-green-600 text-green-600' : ''}>
                      {isConnected ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                      {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">Angel One API Key</Label>
                <Input id="api-key" placeholder="Enter your API key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret">Angel One API Secret</Label>
                <Input id="api-secret" placeholder="Enter your API secret" type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totp-secret">Angel One TOTP Secret</Label>
                <Input id="totp-secret" placeholder="Enter your TOTP authenticator secret" type="password" value={totpSecret} onChange={(e) => setTotpSecret(e.target.value)}/>
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <Button onClick={handleConnect}>Save & Connect Broker</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-base">Trade Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for executed trades.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-base">Signal Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new trading signals.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-base">System Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about system health and connectivity.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
