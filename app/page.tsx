import { TodoList } from "@/components/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping List",
  description: "My Shopping List",
};

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: [{ status: "asc" }, { title: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex h-dvh flex-col items-center p-4 font-sans">
      <Card className="flex h-full w-full max-w-xl flex-col">
        <CardHeader>
          <CardTitle>My Shopping List</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <TodoList initialItems={items} />
        </CardContent>
      </Card>
    </div>
  );
}
