import { streamText } from "ai";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { buildToolPrompt } from "./prompts";
import type { ToolId } from "./tools";

export async function runStudyToolOnGateway(tool: ToolId, fields: Record<string, string>) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error("AI is not configured for this app yet. Please try again later.");
  }

  const { system, prompt } = buildToolPrompt(tool, fields);
  const gateway = createLovableAiGatewayProvider(apiKey);

  try {
    const result = streamText({
      model: gateway("google/gemini-3.7-flash"),
      system,
      prompt,
    });

    const text = await result.text;
    return { text };
  } catch (error) {
    const status = (error as { statusCode?: number; status?: number })?.statusCode ??
      (error as { status?: number })?.status;
    if (status === 429) {
      throw new Error("ELFA is busy right now (too many requests). Please wait a moment and try again.");
    }
    if (status === 402) {
      throw new Error("The AI usage allowance for this app has run out. The app owner needs to top up AI credits.");
    }
    console.error("ELFA tool error", error);
    throw new Error("ELFA could not generate a response. Please try again.");
  }
}
