import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarClock,
  LibraryBig,
  Mail,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  Telescope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TOOL_LIST, AI_DISCLAIMER } from "@/lib/tools";

export const Route = createFileRoute("/_auth/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ELFA Easy Learning For All" },
      {
        name: "description",
        content: "Your ELFA study dashboard: AI homework help, notes, planning, research and saved work.",
      },
      { property: "og:title", content: "ELFA study dashboard" },
      { property: "og:description", content: "All your AI study tools in one place." },
    ],
  }),
  component: Dashboard,
});

const ICONS = {
  BookOpenCheck,
  NotebookPen,
  CalendarClock,
  Telescope,
  Mail,
} as const;

function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [outputs, threads] = await Promise.all([
        supabase.from("study_outputs").select("id, title, tool, created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("threads").select("id", { count: "exact", head: true }),
      ]);
      return {
        recent: outputs.data ?? [],
        savedCount: outputs.data?.length ?? 0,
        threadCount: threads.count ?? 0,
      };
    },
  });

  const firstName =
    (user?.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "student";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-12">
      <section className="overflow-hidden rounded-3xl bg-hero-gradient p-6 text-primary-foreground shadow-lift sm:p-10">
        <p className="text-sm uppercase tracking-widest text-primary-foreground/70">
          Easy Learning For All
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Sawubona, {firstName} 👋
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/85">
          Pick a tool below, or open Study Chat to talk through a problem step by step. ELFA is
          built to help you understand your work — the thinking still has to be yours.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link to="/chat">
              <MessagesSquare className="size-4" /> Start a study chat
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/tools/homework">Get homework help</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Study chats</p>
          <p className="mt-1 font-display text-3xl font-bold">{stats?.threadCount ?? 0}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Saved outputs</p>
          <p className="mt-1 font-display text-3xl font-bold">{stats?.savedCount ?? 0}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">AI tools ready</p>
          <p className="mt-1 font-display text-3xl font-bold">{TOOL_LIST.length}</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Your study tools</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_LIST.map((tool) => {
            const Icon = ICONS[tool.icon as keyof typeof ICONS];
            return (
              <Link
                key={tool.id}
                to="/tools/$toolId"
                params={{ toolId: tool.id }}
                className="card-surface group flex flex-col gap-3 p-5 transition-transform hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-gradient text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="font-display text-base font-semibold">{tool.name}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{tool.tagline}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {stats?.recent && stats.recent.length > 0 && (
        <section>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate font-display text-xl font-bold">Recently saved</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/library">
                <LibraryBig className="size-4" /> Library
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {stats.recent.map((item) => (
              <Link
                key={item.id}
                to="/library"
                className="card-surface flex min-w-0 flex-col gap-1 p-4 hover:shadow-lift"
              >
                <span className="truncate font-medium">{item.title}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.tool} · {new Date(item.created_at).toLocaleDateString("en-ZA")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent-foreground" />
        <div className="min-w-0 text-sm leading-relaxed">
          <p className="font-semibold">Use ELFA responsibly</p>
          <p className="mt-1 text-muted-foreground">{AI_DISCLAIMER}</p>
          <Link to="/responsible-ai" className="mt-2 inline-block font-medium text-primary underline">
            Read our academic integrity &amp; POPIA commitments
          </Link>
        </div>
      </section>
    </div>
  );
}
