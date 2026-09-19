import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    </main>
  );
}
