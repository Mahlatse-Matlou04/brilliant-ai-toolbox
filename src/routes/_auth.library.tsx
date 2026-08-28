import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, LibraryBig, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS, type ToolId } from "@/lib/tools";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_auth/library")({
  head: () => ({
    meta: [
      { title: "My Library — ELFA" },
      {
        name: "description",
        content: "Every study summary, plan and research brief you have saved in ELFA, in one place.",
      },
      { property: "og:title", content: "My ELFA study library" },
      { property: "og:description", content: "Your saved AI study outputs." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["study-outputs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_outputs")
        .select("id, title, tool, content, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_outputs").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      if (selectedId === id) setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ["study-outputs"] });
      toast.success("Deleted");
    },
    onError: () => toast.error("Could not delete that item."),
  });

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  const download = () => {
    if (!selected) return;
    const blob = new Blob([selected.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected.title.replace(/[^\w\s-]/g, "").slice(0, 50) || "elfa"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-gradient text-accent-foreground">
          <LibraryBig className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">My Library</h1>
          <p className="text-sm text-muted-foreground">
            Everything you have saved from the ELFA study tools.
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search saved work"
            maxLength={80}
          />
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isLoading && filtered.length === 0 && (
            <p className="card-surface p-5 text-sm text-muted-foreground">
              Nothing saved yet. Generate something with a study tool and press Save.
            </p>
          )}
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "card-surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3",
                  selected?.id === item.id && "border-primary",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className="min-w-0 text-left"
                >
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {TOOLS[item.tool as ToolId]?.name ?? item.tool} ·{" "}
                    {new Date(item.created_at).toLocaleDateString("en-ZA")}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${item.title}`}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove.mutate(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <section className="card-surface min-h-[320px] p-6">
          {selected ? (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate font-display text-lg font-bold">{selected.title}</h2>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(selected.content);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="size-4" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={download}>
                    <Download className="size-4" /> Download
                  </Button>
                </div>
              </div>
              <div className="mt-5">
                <Markdown>{selected.content}</Markdown>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a saved item to read it here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
