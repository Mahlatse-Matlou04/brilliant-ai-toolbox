import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";

import logo from "@/assets/elfa-logo.png";

export const Route = createFileRoute("/_auth/chat/")({
  component: ChatEmptyState,
});

function ChatEmptyState() {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <img src={logo} alt="" width={72} height={72} className="mx-auto size-18" />
        <h1 className="font-display text-2xl font-bold">Study Chat</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Start a new chat to work through a problem with ELFA. Ask about a concept, a past paper
          question or a module you are stuck on — ELFA will guide you, step by step.
        </p>
        <p className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
          <MessagesSquare className="size-4" /> Tap “New chat” to begin
        </p>
      </div>
    </div>
  );
}
