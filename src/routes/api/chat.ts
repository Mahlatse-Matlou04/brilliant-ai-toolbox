import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";

type ChatRequestBody = { messages?: unknown; threadId?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = (await request.json()) as ChatRequestBody;

        if (!Array.isArray(messages) || typeof threadId !== "string" || !threadId) {
          return new Response("Invalid request", { status: 400 });
        }

        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
        const supabaseKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const { data: thread } = await supabase
          .from("threads")
          .select("id")
          .eq("id", threadId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!thread) return new Response("Conversation not found", { status: 404 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const uiMessages = messages as UIMessage[];
        const lastMessage = uiMessages[uiMessages.length - 1];
        if (lastMessage?.role === "user") {
          const { error: insertError } = await supabase.from("messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            content: lastMessage as unknown as Record<string, unknown>,
            client_message_id: lastMessage.id,
          });
          if (insertError) console.error("Failed to save user message", insertError);
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(apiKey, initialRunId);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: CHAT_SYSTEM_PROMPT,
            messages: convertToModelMessages(uiMessages),
          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: uiMessages,
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
            onFinish: async ({ responseMessage }) => {
              const { error } = await supabase.from("messages").insert({
                thread_id: threadId,
                user_id: userId,
                role: "assistant",
                content: responseMessage as unknown as Record<string, unknown>,
                client_message_id: responseMessage.id,
              });
              if (error) console.error("Failed to save assistant message", error);
              await supabase
                .from("threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId)
                .eq("user_id", userId);
            },
          });

          return withLovableAiGatewayRunIdHeader(response, gateway);
        } catch (error) {
          console.error("Chat error", error);
          return new Response("ELFA could not answer right now. Please try again.", { status: 502 });
        }
      },
    },
  },
});
