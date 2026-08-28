import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/elfa-logo.png";
import { Markdown } from "@/components/Markdown";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
import { AI_DISCLAIMER } from "@/lib/tools";

export const Route = createFileRoute("/_app/chat/$threadId")({
  component: ChatThread,
});

const SUGGESTIONS = [
  "Explain photosynthesis like I'm in Grade 10",
  "Help me understand compound interest step by step",
  "How do I structure a university essay introduction?",
];

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function ChatThread() {
  const { threadId } = Route.useParams();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("content")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => row.content as unknown as UIMessage);
    },
  });

  if (isLoading) {
    return (
      <div className="grid h-full place-items-center">
        <Shimmer>Loading conversation...</Shimmer>
      </div>
    );
  }

  return (
    <ChatWindow
      key={threadId}
      threadId={threadId}
      initialMessages={initialMessages ?? []}
      input={input}
      setInput={setInput}
      textareaRef={textareaRef}
      onFirstMessage={() => queryClient.invalidateQueries({ queryKey: ["threads"] })}
    />
  );
}

function ChatWindow({
  threadId,
  initialMessages,
  input,
  setInput,
  textareaRef,
  onFirstMessage,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  input: string;
  setInput: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onFirstMessage: () => void;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (error) => toast.error(error.message || "ELFA could not answer. Please try again."),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status, textareaRef]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    if (messages.length === 0) {
      await supabase
        .from("threads")
        .update({ title: trimmed.slice(0, 60) })
        .eq("id", threadId);
      onFirstMessage();
    }

    setInput("");
    await sendMessage({ text: trimmed });
  };

  return (
    <div className="grid h-full grid-rows-[minmax(0,1fr)_auto]">
      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 && (
            <div className="space-y-5 py-10 text-center">
              <img src={logo} alt="" width={64} height={64} className="mx-auto size-16" />
              <div>
                <h1 className="font-display text-2xl font-bold">How can ELFA help today?</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask about any subject or module. ELFA guides you to the answer instead of just
                  handing it over.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.role === "assistant" ? (
                  <Markdown>{textOf(message)}</Markdown>
                ) : (
                  <p className="whitespace-pre-wrap">{textOf(message)}</p>
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>ELFA is thinking...</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/80 p-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl space-y-2">
          <PromptInput
            onSubmit={(_message, event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask ELFA about your homework, notes or module..."
              maxLength={6000}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={busy || !input.trim()} />
            </PromptInputFooter>
          </PromptInput>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            {AI_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
}
