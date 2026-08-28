import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarClock,
  MessagesSquare,
  Mail,
  NotebookPen,
  ShieldCheck,
  Telescope,
} from "lucide-react";

import logo from "@/assets/elfa-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AI_DISCLAIMER, TOOL_LIST } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELFA — AI study help for South African students" },
      {
        name: "description",
        content:
          "EASY LEARNING FOR ALL (ELFA) is an AI study platform for South African learners and tertiary students: homework guidance, notes, planners and research briefs.",
      },
      { property: "og:title", content: "ELFA — Easy Learning For All" },
      {
        property: "og:description",
        content: "AI study help built to teach, not to cheat. Free for South African students.",
      },
    ],
  }),
  component: Landing,
});

const ICONS = { BookOpenCheck, NotebookPen, CalendarClock, Telescope, Mail } as const;

const STEPS = [
  { title: "Tell ELFA where you are", body: "Pick your subject or module and your study level, from Grade 8 to postgraduate." },
  { title: "Get guided, not spoon-fed", body: "ELFA explains the method, works through examples and asks you to try the next step." },
  { title: "Save and revise", body: "Keep every plan, summary and brief in your private library and come back before the test." },
];

function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="ELFA logo" width={44} height={44} className="size-11 shrink-0" />
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-none">ELFA</span>
            <span className="block truncate text-xs text-muted-foreground">Easy Learning For All</span>
          </span>
        </div>
        <Button asChild>
          <Link to={user ? "/dashboard" : "/auth"}>{user ? "Open dashboard" : "Sign in"}</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:pb-20 lg:pt-10">
          <div className="overflow-hidden rounded-3xl bg-hero-gradient px-6 py-14 text-primary-foreground shadow-lift sm:px-12 lg:py-20">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
              Built for South African students
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Homework help that actually teaches you.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/85">
              ELFA is one AI study platform for CAPS, NSC, TVET and university work — step-by-step
              homework guidance, lecture-note summaries, realistic study plans, research briefs and
              a Socratic study chat. Honest by design, POPIA-aware by default.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to={user ? "/dashboard" : "/auth"}>Start learning free</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to={user ? "/chat" : "/auth"}>
                  <MessagesSquare className="size-4" /> Try Study Chat
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Five tools, one platform</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each tool uses carefully engineered prompts with built-in integrity and accuracy rules.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_LIST.map((tool) => {
              const Icon = ICONS[tool.icon as keyof typeof ICONS];
              return (
                <article key={tool.id} className="card-surface p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent-gradient text-accent-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.tagline}</p>
                </article>
              );
            })}
            <article className="card-surface flex flex-col justify-between bg-hero-gradient p-6 text-primary-foreground">
              <div>
                <span className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15">
                  <MessagesSquare className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">Study Chat</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
                  A tutor that asks questions back. Every conversation is saved to your account.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">How it works</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="card-surface p-6">
                  <span className="grid size-9 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="card-surface grid gap-6 p-8 lg:grid-cols-[auto_minmax(0,1fr)]">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-gradient text-accent-foreground">
              <ShieldCheck className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold">Responsible by design</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{AI_DISCLAIMER}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• POPIA-aware: minimal data, private to your account, delete it any time.</li>
                <li>• Integrity first: ELFA refuses to write live test or exam answers for you.</li>
                <li>• No invented sources, statistics or citations — uncertainty is flagged.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 text-xs text-muted-foreground sm:px-6">
          <p className="min-w-0 truncate">
            © {new Date().getFullYear()} ELFA — Easy Learning For All. Made for South African students.
          </p>
          <Link to="/auth" className="shrink-0 font-medium text-primary underline">
            Get started
          </Link>
        </div>
      </footer>
    </div>
  );
}
