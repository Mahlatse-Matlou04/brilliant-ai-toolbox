import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_auth/chat")({
  head: () => ({
    meta: [
      { title: "Study Chat — ELFA" },
      {
        name: "description",
        content: "Chat with ELFA, your AI study coach, and keep every conversation saved to your account.",
      },
      { property: "og:title", content: "ELFA Study Chat" },
      { property: "og:description", content: "Socratic AI tutoring for South African students." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("threads")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createThread = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("threads")
        .insert({ user_id: userId, title: "New study chat" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: async (id) => {
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
      void navigate({ to: "/chat/$threadId", params: { threadId: id } });
    },
    onError: () => toast.error("Could not start a new chat."),
  });

  const deleteThread = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("threads").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      await queryClient.invalidateQueries({ queryKey: ["threads"] });
      if (params.threadId === id) void navigate({ to: "/chat" });
    },
    onError: () => toast.error("Could not delete that chat."),
  });

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-rows-[auto_minmax(0,1fr)] lg:h-screen lg:grid-cols-[280px_minmax(0,1fr)] lg:grid-rows-1">
      <aside className="flex min-h-0 flex-col gap-3 border-b border-border bg-muted/40 p-4 lg:border-b-0 lg:border-r">
        <Button onClick={() => createThread.mutate()} disabled={createThread.isPending}>
          <Plus className="size-4" /> New chat
        </Button>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {threads.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted-foreground">No conversations yet.</p>
          )}
          {threads.map((thread) => {
            const active = params.threadId === thread.id;
            return (
              <div
                key={thread.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-lg px-1 transition-colors hover:bg-background",
                  active && "bg-background shadow-soft",
                )}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: thread.id }}
                  className="min-w-0 truncate px-2 py-2 text-sm"
                >
                  {thread.title}
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${thread.title}`}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteThread.mutate(thread.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </aside>

      <div className="min-h-0 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
