"use client";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function SignoutBtn() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  const handleLogin = async () => {
    await signIn.social({
      provider: "google",
    });
  };

  const handleSignout = async () =>
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });

  if (isPending) {
    return (
      <Button className="" disabled>
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
