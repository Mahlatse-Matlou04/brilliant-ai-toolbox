import { useServerFn } from "@tanstack/react-start";
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarClock,
  Copy,
  Loader2,
  Mail,
  NotebookPen,
  Save,
  Sparkle,
  Telescope,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { runStudyTool } from "@/lib/study.functions";
import { AI_DISCLAIMER, TOOLS, type ToolId } from "@/lib/tools";

const ICONS = { BookOpenCheck, NotebookPen, CalendarClock, Telescope, Mail } as const;

const isToolId = (value: string): value is ToolId => value in TOOLS;

export const Route = createFileRoute("/_auth/tools/$toolId")({
  beforeLoad: ({ params }) => {
    if (!isToolId(params.toolId)) throw notFound();
  },
  head: ({ params }) => {
    const tool = isToolId(params.toolId) ? TOOLS[params.toolId] : undefined;
    const title = tool ? `${tool.name} — ELFA` : "Study tool — ELFA";
    const description = tool?.tagline ?? "AI study tools for South African students.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { toolId } = Route.useParams();
  const tool = TOOLS[toolId as ToolId];
  const Icon = ICONS[tool.icon as keyof typeof ICONS];
  const run = useServerFn(runStudyTool);

  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const setValue = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const missing = tool.fields.filter((f) => f.required && !(values[f.name] ?? "").trim());
    if (missing.length > 0) {
      toast.error(`Please complete: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setBusy(true);
    setResult("");
    try {
      const response = await run({ data: { tool: tool.id, fields: values } });
      setResult(response.text);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSaving(false);
      toast.error("Please sign in again to save.");
      return;
    }
    const firstField = tool.fields[0]?.name ?? "";
    const title = (values[firstField] ?? tool.name).slice(0, 80);
    const { error } = await supabase.from("study_outputs").insert({
      user_id: userId,
      tool: tool.id,
      title,
      content: result,
      input: JSON.stringify(values).slice(0, 8000),
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save to your library.");
      return;
    }
    toast.success("Saved to your library");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-gradient text-accent-foreground">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{tool.name}</h1>
          <p className="text-sm text-muted-foreground">{tool.tagline}</p>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="card-surface h-fit space-y-5 p-6">
          {tool.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="ml-1 text-destructive">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  id={field.name}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder ?? ""}
                  maxLength={300}
                  onChange={(e) => setValue(field.name, e.target.value)}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder ?? ""}
                  maxLength={12000}
                  rows={field.name === "notes" || field.name === "source" ? 10 : 5}
                  onChange={(e) => setValue(field.name, e.target.value)}
                />
              )}

              {field.type === "select" && (
                <Select
                  value={values[field.name] ?? ""}
                  onValueChange={(value) => setValue(field.name, value)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.helper && <p className="text-xs text-muted-foreground">{field.helper}</p>}
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkle className="size-4" />}
            {busy ? "ELFA is thinking..." : `Generate ${tool.outputTitle.toLowerCase()}`}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">{AI_DISCLAIMER}</p>
        </form>

        <section className="card-surface min-h-[320px] p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate font-display text-lg font-bold">{tool.outputTitle}</h2>
            {result && (
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(result);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="size-4" /> Save
                </Button>
              </div>
            )}
          </div>

          <div className="mt-5">
            {busy && (
              <p className="animate-pulse text-sm text-muted-foreground">
                Working through your request...
              </p>
            )}
            {!busy && !result && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Fill in the form and ELFA will build your {tool.outputTitle.toLowerCase()} here.
                Everything stays private to your account.
              </p>
            )}
            {result && <Markdown>{result}</Markdown>}
          </div>
        </section>
      </div>
    </div>
  );
}
