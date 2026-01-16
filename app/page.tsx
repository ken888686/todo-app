import { TodoList } from "@/components/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Todo App",
  description: "My Todo List",
};

export default function Home() {
  const items = prisma.item.findMany({
    orderBy: [{ status: "asc" }, { title: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex h-dvh flex-col items-center p-4 font-sans">
      <Card className="flex h-full w-full max-w-xl flex-col">
        <CardHeader>
          <CardTitle>My Todo List</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <Suspense
            fallback={
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-10 w-1/12" />
                </div>
                <div className="min-h-0 flex-1 rounded-md border">
                  <div className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            }
          >
            <TodoList initialItems={items} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
