"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn, useSession } from "@/lib/auth-client";
import { Google } from "@deemlol/next-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginClient() {
  const router = useRouter();
  const { isPending } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (isPending) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-secondary-foreground">Loading...</p>
      </div>
    );
  }

  const handleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      await signIn.social({
        provider: "google",
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(
              ctx.error.message || ctx.error.statusText || "Login failed",
            );
          },
        },
      });
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex h-dvh items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <p className="text-muted-foreground text-sm">
            Choose a way to login your account
          </p>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignIn}
            type="button"
            disabled={isSigningIn}
            aria-busy={isSigningIn}
          >
            <Google size={24} />
            Google Login
          </Button>

          <div className="relative">
            <Separator />
            <span className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase">
              Or continue with
            </span>
          </div>

          <p className="text-muted-foreground text-center text-xs">
            More login options coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
