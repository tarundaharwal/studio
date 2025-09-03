
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { app, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Terminal } from 'lucide-react';

const firebaseReady = isFirebaseConfigured();

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth will only be initialized if firebase is ready
  const auth = firebaseReady && app ? getAuth(app) : null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({
            title: "Firebase Not Configured",
            description: "Please add your Firebase configuration to src/lib/firebase.ts",
            variant: "destructive",
        });
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful!",
        description: "Welcome back to IndMon.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Login Failed",
        description: "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  }

  const handlePasswordReset = async () => {
    if (!auth) {
        toast({ title: "Error", description: "Firebase is not configured.", variant: "destructive" });
        return;
    }
    if (!email) {
        toast({ title: "Email Required", description: "Please enter your email address to reset your password.", variant: "destructive" });
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Password Reset Email Sent",
            description: `A password reset link has been sent to ${email}. Please check your inbox.`,
        });
    } catch (error: any) {
        toast({
            title: "Error Sending Reset Email",
            description: error.message,
            variant: "destructive",
        });
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
            {!firebaseReady && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Action Required: Firebase Not Configured</AlertTitle>
                <AlertDescription>
                  To enable login, please create a Firebase project, enable Email/Password authentication, and paste your Firebase config object into{' '}
                  <code className="font-mono text-xs">src/lib/firebase.ts</code>.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!firebaseReady}/>
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="ml-auto inline-block text-sm underline"
                        disabled={!firebaseReady}
                    >
                        Forgot your password?
                    </button>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={!firebaseReady} />
            </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" disabled={isLoading || !firebaseReady}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline">
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </form>
      </Card>
    </div>
  )
}
