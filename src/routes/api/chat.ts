import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

const SYSTEM = `You are the Murandasi Market shopping assistant for a Rwandan multi-vendor marketplace (murandasi.com).
Help visitors find products, understand ordering, delivery tracking, payments held 2 days for buyer protection, and how to become a seller (platform keeps 13%, seller keeps 87%).
Be short, friendly and practical. Reply in the visitor's language (Kinyarwanda, English or French).
For urgent help, suggest the WhatsApp support button (+250 788 723 098). Never invent prices or stock. Use plain text only, no markdown symbols like ** or #.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI is not configured", { status: 500 });
        let messages: UIMessage[];
        try { ({ messages } = (await request.json()) as { messages: UIMessage[] }); }
        catch { return new Response("Invalid request", { status: 400 }); }
        if (!Array.isArray(messages) || messages.length > 60) return new Response("Invalid request", { status: 400 });
        const openai = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        const result = streamText({
          model: openai.responses("openai/gpt-6-astra"),
          system: SYSTEM,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          maxRetries: 0,
          providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
        });
        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onError: (e) => {
            const s = (e as { statusCode?: number })?.statusCode;
            if (s === 429) return "Too many requests right now, please try again shortly.";
            if (s === 402) return "The assistant is unavailable right now (AI credits).";
            return "The assistant could not answer. Please try again.";
          },
        });
      },
    },
  },
});
