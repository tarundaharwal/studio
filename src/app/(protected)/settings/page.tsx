
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
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { connectToBroker, Session } from '@/services/angelone';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for API Keys
  const [apiKey, setApiKey] = React.useState('');
  const [apiSecret, setApiSecret] = React.useState('');
  const [totpSecret, setTotpSecret] = React.useState('');

  // State for Connection Status
  const [session, setSession] = React.useState<Session | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const isConnected = session !== null;

  const handleConnect = async () => {
    if (!apiKey || !apiSecret || !totpSecret) {
      toast({
        title: "Error: Missing Information",
        description: "Please provide all three API keys to connect.",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    setSession(null);

    try {
      const credentials = { apiKey, apiSecret, totpSecret };
      const newSession = await connectToBroker(credentials);
      setSession(newSession);
      toast({
        title: "Connection Successful!",
        description: "Successfully connected to Angel One broker.",
      });
    } catch (error: any) {
      setSession(null);
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to the broker.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      <Tabs defaultValue="api_keys" className="space-y-4">
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
                This is your personal information. Your name is permanent after sign up.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user?.displayName || 'Not Set'} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
            </CardContent>
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
                  {isConnecting ? (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                      </Badge>
                  ) : (
                    <Badge variant={isConnected ? "outline" : "destructive"} className={isConnected ? 'border-green-600 text-green-600' : ''}>
                        {isConnected ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                        {isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  )}
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
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : 'Save & Connect Broker'}
              </Button>
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
