"use client";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function SignoutBtn() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    setIsProcessing(true);
    try {
      await signIn.social({ provider: "google" });
    } catch {
      toast.error("Login failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSignout = async () => {
    setIsProcessing(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch {
      toast.error("Sign out failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isPending || isProcessing) {
    return (
      <Button disabled aria-busy="true">
        Loading...
      </Button>
    );
  }

  if (!session) {
    return (
      <Button className="cursor-pointer" onClick={handleLogin}>
        Login
      </Button>
    );
  }

  return (
    <Button className="cursor-pointer" onClick={handleSignout}>
      Sign Out
    </Button>
  );
}
