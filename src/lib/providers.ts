import type { HistoryItem } from "./agent";

export interface ProviderKeys { groqKey?: string; geminiKey?: string; openRouterKey?: string }
export function providerKeys(): ProviderKeys {
  return { groqKey: process.env.GROQ_API_KEY, geminiKey: process.env.GEMINI_API_KEY, openRouterKey: process.env.OPENROUTER_API_KEY };
}
export function providerStatus(keys = providerKeys()) {
  if (keys.groqKey) return { hasKey: true, provider: "Groq", model: process.env.GROQ_MODEL || "openai/gpt-oss-120b" };
  if (keys.geminiKey) return { hasKey: true, provider: "Gemini", model: process.env.GEMINI_MODEL || "gemini-3.8-flash" };
  if (keys.openRouterKey) return { hasKey: true, provider: "OpenRouter", model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free" };
  return { hasKey: false, provider: null, model: null };
}

export async function generateAnswer(
  system: string,
  prompt: string,
  history: HistoryItem[],
  keys = providerKeys(),
  signal?: AbortSignal,
  request: typeof fetch = fetch,
  options: { schema?: Record<string, unknown> } = {},
): Promise<{ text: string; provider: string; model: string }> {
  const deadline = Date.now() + 12_000;
  const attempts: { provider: string; model: string; key: string; url: string; gemini?: boolean }[] = [];
  if (keys.groqKey) {
    for (const model of new Set([process.env.GROQ_MODEL || "openai/gpt-oss-120b", "openai/gpt-oss-20b"])) attempts.push({ provider: "Groq", model, key: keys.groqKey, url: "https://api.groq.com/openai/v1/chat/completions" });
  }
  if (keys.geminiKey) attempts.push({ provider: "Gemini", model: process.env.GEMINI_MODEL || "gemini-3.8-flash", key: keys.geminiKey, url: "https://generativelanguage.googleapis.com/v1beta/models/", gemini: true });
  if (keys.openRouterKey) attempts.push({ provider: "OpenRouter", model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free", key: keys.openRouterKey, url: "https://openrouter.ai/api/v1/chat/completions" });
  if (!attempts.length) throw new Error("no-key");
  const blockedProviders = new Set<string>();
  for (const attempt of attempts) {
    signal?.throwIfAborted();
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    if (blockedProviders.has(attempt.provider)) continue;
    const timeout = AbortSignal.timeout(Math.min(remaining, 6500));
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    try {
      const response = await request(attempt.gemini ? `${attempt.url}${encodeURIComponent(attempt.model)}:generateContent` : attempt.url, {
        method: "POST",
        signal: combined,
        headers: { "Content-Type": "application/json", ...(attempt.gemini ? { "x-goog-api-key": attempt.key } : { Authorization: `Bearer ${attempt.key}` }) },
        body: JSON.stringify(attempt.gemini ? {
          systemInstruction: { parts: [{ text: system }] },
          contents: [...history.slice(-6).map(h => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.text }] })), { role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1600, ...(options.schema ? { responseMimeType: "application/json" } : {}) },
        } : {
          model: attempt.model,
          temperature: 0.1,
          max_completion_tokens: options.schema ? 1600 : 1200,
          ...(attempt.provider === "Groq" && attempt.model.startsWith("openai/gpt-oss-") ? { reasoning_effort: "low" } : {}),
          ...(options.schema && attempt.provider === "Groq" && attempt.model.startsWith("openai/gpt-oss-") ? { response_format: { type: "json_schema", json_schema: { name: "portfolio_answer", strict: true, schema: options.schema } } } : {}),
          messages: [{ role: "system", content: system }, ...history.slice(-6).map(h => ({ role: h.role, content: h.text })), { role: "user", content: prompt }],
        }),
      });
      if (!response.ok) {
        // Quotas can be model-specific. A throttled primary may still use the
        // configured secondary model; invalid credentials block the provider.
        if ([401, 403].includes(response.status)) blockedProviders.add(attempt.provider);
        await response.body?.cancel();
        continue;
      }
      const data = await response.json();
      const text = attempt.gemini ? data.candidates?.[0]?.content?.parts?.map((p: {text?: string}) => p.text ?? "").join("").trim() : data.choices?.[0]?.message?.content?.trim();
      if (typeof text === "string" && text.length && text.length <= 5000) return { text, provider: attempt.provider, model: attempt.model };
    } catch {
      signal?.throwIfAborted();
      // Bounded fallback. Provider error bodies may contain sensitive metadata;
      // never forward them to visitors or logs.
    }
  }
  throw new Error("provider-unavailable");
}
