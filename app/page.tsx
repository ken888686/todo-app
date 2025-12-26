import { TodoList } from "@/components/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex h-screen flex-col items-center bg-zinc-50 p-4 font-sans dark:bg-black">
      <Card className="flex h-full w-full max-w-xl flex-col">
        <CardHeader>
          <CardTitle>My Shopping List</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
          <TodoList initialItems={items} />
        </CardContent>
      </Card>
    </div>
  );
}
