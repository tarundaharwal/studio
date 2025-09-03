
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
import { CheckCircle, Loader2, XCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { connectToBroker } from '@/services/angelone';
import { useAuthStore } from '@/store/use-auth-store';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { credentials, session, setCredentials, setSession, clearAuth } = useAuthStore();

  const [apiKey, setApiKey] = React.useState(credentials?.apiKey || '');
  const [apiSecret, setApiSecret] = React.useState(credentials?.apiSecret || '');
  const [totpSecret, setTotpSecret] = React.useState(credentials?.totpSecret || '');

  const [isConnecting, setIsConnecting] = React.useState(false);
  const isConnected = session !== null;

  const handleConnect = async () => {
    const currentCredentials = { apiKey, apiSecret, totpSecret };
    if (!currentCredentials.apiKey || !currentCredentials.apiSecret || !currentCredentials.totpSecret) {
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
      setCredentials(currentCredentials);
      
      const newSession = await connectToBroker(currentCredentials);
      setSession(newSession);
      toast({
        title: "Connection Successful!",
        description: "Successfully connected to Angel One broker.",
      });
    } catch (error: any) {
      setSession(null); 
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to the broker. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = () => {
    clearAuth();
    setApiKey('');
    setApiSecret('');
    setTotpSecret('');
    toast({
        title: "Disconnected",
        description: "Your broker session and API keys have been cleared.",
    });
  }

  React.useEffect(() => {
    // Sync local state with store when credentials change (e.g., on load or disconnect)
    setApiKey(credentials?.apiKey || '');
    setApiSecret(credentials?.apiSecret || '');
    setTotpSecret(credentials?.totpSecret || '');
  }, [credentials]);


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
                Manage your broker API keys for live trading. Your keys are stored securely in your browser's local storage.
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
                    <Badge variant={isConnected ? "outline" : "destructive"} className={cn('transition-colors', isConnected ? 'border-green-600 text-green-600' : '')}>
                        {isConnected ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                        {isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">Angel One API Key</Label>
                <Input id="api-key" placeholder="Enter your API key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={isConnected || isConnecting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret">Angel One API Secret</Label>
                <Input id="api-secret" placeholder="Enter your API secret" type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} disabled={isConnected || isConnecting}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totp-secret">Angel One TOTP Secret</Label>
                <Input id="totp-secret" placeholder="Enter your TOTP authenticator secret" type="password" value={totpSecret} onChange={(e) => setTotpSecret(e.target.value)} disabled={isConnected || isConnecting}/>
              </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              {isConnected ? (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <LogOut className="mr-2 h-4 w-4" /> Disconnect
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to disconnect?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This will clear your current session and API keys from local storage. You will need to enter them again to reconnect.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnect}>Confirm Disconnect</AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : 'Save & Connect Broker'}
                </Button>
              )}
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
