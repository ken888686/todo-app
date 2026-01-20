"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn, useSession } from "@/lib/auth-client";
import { Google } from "@deemlol/next-icons";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <p className="text-secondary-foreground">Loading user info...</p>
      </div>
    );
  }

  const handleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    await signIn.social({
      provider: "google",
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
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

          <div className="grid gap-2">
            <Button variant="outline" className="w-full" disabled>
              Other login options (under construction)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
