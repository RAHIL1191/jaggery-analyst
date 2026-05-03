import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const JAGGERY_SYSTEM_PROMPT = `You are an expert jaggery (gur) commodity market analyst and advisor for Indian traders. You have deep expertise in:

- Indian jaggery markets: Muzaffarnagar (UP), Kolhapur (Maharashtra), Erode (Tamil Nadu), Belagavi (Karnataka), Sangli (MH), Varanasi (UP)
- Seasonal price cycles: Jan-Mar = peak harvest, lowest prices (best buy); Oct-Nov = festival peak, highest prices (best sell)
- Festival demand patterns and timing: Diwali (+30%), Chhath (+18%), Ganesh Chaturthi (+22%), Pongal (+20%), Makar Sankranti (+18%)
- Quality grades: A (golden, >75% sucrose, premium export), B (standard domestic), C (dark, economy)
- Jaggery varieties: Khandsari UP, Kolhapuri (GI tagged), TN Vellam, Organic Certified, Shakkar Gur
- Export markets: Bangladesh (largest volume), UAE (grade A premium), UK/USA (organic premium 48-55%), Sri Lanka, Malaysia
- Sugar-jaggery spread dynamics and substitute demand effects
- Government policies: MSP (₹3,600/qtl 2025-26), APEDA schemes, GST (0% bulk, 5% packaged), state subsidies
- Cold storage rates, transport costs, landed price calculations
- NABARD credit schemes, Kisan Credit Card at 4% effective interest

CURRENT MARKET CONTEXT:
{CONTEXT}

RESPONSE RULES:
- Be direct, specific, and actionable — traders need to make money decisions
- Quote prices in ₹ per quintal (100kg)
- Keep responses under 200 words unless the question requires detailed breakdown
- Use ₹ symbol, not "Rs." or "INR"
- Include specific numbers (prices, quantities, percentages)
- Give a clear recommendation at the end of complex analyses
- If you don't know something specific, say so honestly rather than guessing`;

function buildSystemPrompt(context: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) {
    return JAGGERY_SYSTEM_PROMPT.replace("{CONTEXT}", "Market data not available. Use general jaggery market knowledge.");
  }

  const {
    currentPrice, recommendation, confidence, harvestPhase, harvestRegion,
    harvestEffect, upcomingFestival, festivalDays, festivalBoost, seasonalMonth,
    seasonalSignal, mandiPrices,
  } = context;

  const contextStr = [
    `Current Market Price: ₹${currentPrice}/quintal`,
    `Signal: ${recommendation} (${confidence}% confidence)`,
    `Harvest Phase: ${harvestPhase} (${harvestRegion}) — ${harvestEffect} price effect`,
    seasonalMonth ? `Seasonal (${seasonalMonth}): Historically a "${seasonalSignal}" month` : null,
    upcomingFestival ? `Upcoming Festival: ${upcomingFestival} in ${festivalDays} days (+${festivalBoost}% demand boost)` : "No major festivals in next 30 days",
    mandiPrices ? `Regional Prices: ${mandiPrices}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return JAGGERY_SYSTEM_PROMPT.replace("{CONTEXT}", contextStr);
}

type Message = { role: "user" | "assistant" | "system"; content: string };

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Message[],
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 600,
      temperature: 0.65,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Message[],
): Promise<string> {
  const userMessages = messages.filter((m) => m.role !== "system");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-3-haiku-20240307",
      max_tokens: 600,
      system: systemPrompt,
      messages: userMessages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    content: { type: string; text: string }[];
  };
  return data.content[0]?.text ?? "";
}

router.post("/ai/chat", async (req: Request, res: Response) => {
  const { messages, provider, apiKey, model, context } = req.body as {
    messages: Message[];
    provider: string;
    apiKey: string;
    model: string;
    context?: Record<string, unknown>;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  if (!provider || !["openai", "anthropic"].includes(provider)) {
    res.status(400).json({
      error:
        "provider must be 'openai' or 'anthropic'. For Ollama/local LLM, call the endpoint directly from the mobile app.",
    });
    return;
  }

  if (!apiKey || apiKey.trim().length < 10) {
    res.status(400).json({ error: "apiKey is required" });
    return;
  }

  const systemPrompt = buildSystemPrompt(context ?? {});

  try {
    let content = "";

    if (provider === "openai") {
      content = await callOpenAI(apiKey, model, systemPrompt, messages);
    } else if (provider === "anthropic") {
      content = await callAnthropic(apiKey, model, systemPrompt, messages);
    }

    res.json({ content, provider, model: model || "default" });
  } catch (err) {
    req.log.error({ err }, "AI proxy error");
    const message = err instanceof Error ? err.message : "AI proxy error";
    const status = message.includes("401") ? 401 : message.includes("429") ? 429 : 500;
    res.status(status).json({ error: message });
  }
});

router.get("/ai/models", (_req: Request, res: Response) => {
  res.json({
    openai: [
      { id: "gpt-4o", label: "GPT-4o", description: "Most capable, best analysis" },
      { id: "gpt-4o-mini", label: "GPT-4o Mini", description: "Fast & affordable" },
      { id: "gpt-4-turbo", label: "GPT-4 Turbo", description: "Powerful, detailed" },
      { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Budget option" },
    ],
    anthropic: [
      { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", description: "Best reasoning" },
      { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", description: "Fast & cheap" },
      { id: "claude-3-haiku-20240307", label: "Claude 3 Haiku", description: "Budget option" },
    ],
    ollama: [
      { id: "llama3.2", label: "Llama 3.2", description: "Meta's latest, great for chat" },
      { id: "llama3.1", label: "Llama 3.1", description: "Solid all-rounder" },
      { id: "phi4", label: "Phi-4", description: "Microsoft, efficient & smart" },
      { id: "gemma2", label: "Gemma 2", description: "Google, good for reasoning" },
      { id: "mistral", label: "Mistral 7B", description: "Lightweight & fast" },
      { id: "qwen2.5", label: "Qwen 2.5", description: "Alibaba, multilingual" },
    ],
    custom: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini (default)", description: "Or enter any model ID" },
    ],
  });
});

export default router;
