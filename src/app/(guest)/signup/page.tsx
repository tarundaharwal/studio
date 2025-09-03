'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const auth = getAuth(app);


    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseReady) return;
        setIsLoading(true);
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast({
                title: "Account Created!",
                description: "You have been successfully signed up.",
              });
            router.push('/dashboard');
        } catch (error: any) {
            setError(error.message);
            toast({
                title: "Signup Failed",
                description: "Please check the Firebase configuration or try again.",
                variant: "destructive",
              });
        } finally {
            setIsLoading(false);
        }
    }

  return (
     <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
            <CardContent className="grid gap-4">
            {!firebaseReady && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  Firebase is not configured. Please add your Firebase configuration to{" "}
                  <code className="font-mono text-xs">src/lib/firebase.ts</code> to enable sign-up.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="Your Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!firebaseReady}/>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!firebaseReady}/>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={!firebaseReady}/>
            </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" disabled={isLoading || !firebaseReady}>
                {isLoading ? 'Creating Account...' : 'Create account'}
            </Button>
            <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardFooter>
        </form>
      </Card>
     </div>
  )
}
