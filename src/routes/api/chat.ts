import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool, type UIMessage } from "ai";
import { z } from "zod";

const SYSTEM = `You are the Murandasi Market shopping assistant for a Rwandan multi-vendor marketplace (murandasi.com).
Help visitors find products, understand ordering, delivery tracking, payments held 2 days for buyer protection, and how to become a seller (platform keeps 10%, seller keeps 90%).
Be short, friendly and practical. Reply in the visitor's language (Kinyarwanda, English or French).
For urgent help, suggest the WhatsApp support button (+250 788 723 098). Never invent prices or stock. Use plain text only, no markdown symbols like ** or #.
When a visitor wants or asks about a product (for example a charger), ALWAYS call findProducts with short search words (try English words too) instead of describing products yourself. The app shows the results as cards with Add to cart and Buy now buttons, so just add one short sentence; do not repeat the product list.
If findProducts returns nothing, say it is not in stock now and suggest WhatsApp.
When the visitor clearly asks you to add a listed product, call addToCart with its id, quantity and chosen options (use null when there are none). If a product has options and the visitor did not choose, ask first.
When the visitor wants to pay or finish, call goToCheckout; payment and delivery details are completed on the checkout page.`;

const tools = {
  findProducts: tool({ description: "Search in-stock Murandasi products. Results are shown to the visitor as buyable cards.", inputSchema: z.object({ query: z.string() }), outputSchema: z.any() }),
  addToCart: tool({ description: "Add a product returned by findProducts to the visitor's cart.", inputSchema: z.object({ productId: z.string(), qty: z.number().int(), options: z.array(z.object({ name: z.string(), value: z.string() })).nullable() }), outputSchema: z.any() }),
  goToCheckout: tool({ description: "Open the checkout page so the visitor can pay for the cart.", inputSchema: z.object({}), outputSchema: z.any() }),
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
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
          tools,
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
