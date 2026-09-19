import SignoutBtn from "@/components/signout-btn";
import { TodoList, TodoListSkeleton } from "@/components/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getItemPage, normalizeItemSearch } from "@/lib/item-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { q } = await searchParams;
  const search = normalizeItemSearch(q);
  const itemPage = getItemPage(session.user.id, search);

  return (
    <main className="flex h-dvh flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl flex-1 border-2 shadow-[4px_4px_0px_0px_var(--foreground)]">
        <CardHeader className="flex items-center justify-between border-b-2 pb-4">
          <CardTitle className="text-xl font-bold">
            {session?.user.name} の Shopping List
          </CardTitle>
          <SignoutBtn />
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <Suspense fallback={<TodoListSkeleton />}>
            <TodoList
              key={search}
              initialPage={itemPage}
              initialQuery={search}
            />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
