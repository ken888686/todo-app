import { TodoList } from "@/components/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Card>
        <CardHeader>
          <CardTitle>My Todo List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TodoList initialItems={items} />
        </CardContent>
      </Card>
    </div>
  );
}
