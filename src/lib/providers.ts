import type { HistoryItem } from "./agent";
import { trimExchanges } from "./session";

export interface ProviderKeys { groqKey?: string; groqKey2?: string; geminiKey?: string; openRouterKey?: string }
export function providerKeys(): ProviderKeys {
  return { groqKey: process.env.GROQ_API_KEY, groqKey2: process.env.GROQ_API_KEY_2, geminiKey: process.env.GEMINI_API_KEY, openRouterKey: process.env.OPENROUTER_API_KEY };
}
export function providerStatus(keys = providerKeys()) {
  if (keys.groqKey?.trim() || keys.groqKey2?.trim()) return { hasKey: true, provider: "Groq", model: process.env.GROQ_MODEL || "openai/gpt-oss-120b" };
  if (keys.geminiKey) return { hasKey: true, provider: "Gemini", model: process.env.GEMINI_MODEL || "gemini-3.8-flash" };
  if (keys.openRouterKey) return { hasKey: true, provider: "OpenRouter", model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free" };
  return { hasKey: false, provider: null, model: null };
}

/** Runtime information is authoritative server metadata, not a project claim. */
export function assistantInformation(question: string, status = providerStatus()): string | null {
  const q = question.trim().replace(/[?.!]+$/, "").replace(/\s+/g, " ");
  if (!/^(?:who|what) are you$|^(?:what|which) (?:ai )?(?:model|llm|provider) (?:are you(?: using)?|you are|do you use|powers you|is powering you)(?: (?:currently|right now|for this chat))?$|^(?:are you using|do you use|are you powered by) (?:groq|gemini|openrouter|an? (?:ai|llm|model))(?: (?:currently|right now|for this chat))?$/i.test(q)) return null;
  return status.hasKey ? `I'm Balamurugan's portfolio assistant, configured to use ${status.provider} with ${status.model}. I retrieve relevant portfolio, GitHub, resume and certificate evidence before asking the model to compose an answer. Each generated reply shows the provider and model actually used, with citations.` : "I'm Balamurugan's portfolio assistant. I retrieve relevant portfolio evidence, but no language-model provider is currently configured.";
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
  const groqKeys = [...new Set([keys.groqKey, keys.groqKey2].map(key => key?.trim()).filter((key): key is string => !!key))];
  const attempts: { provider: string; model: string; key: string; url: string; gemini?: boolean }[] = [];
  for (const model of new Set([process.env.GROQ_MODEL || "openai/gpt-oss-120b", "openai/gpt-oss-20b"])) {
    for (const key of groqKeys) attempts.push({ provider: "Groq", model, key, url: "https://api.groq.com/openai/v1/chat/completions" });
  }
  if (keys.geminiKey) attempts.push({ provider: "Gemini", model: process.env.GEMINI_MODEL || "gemini-3.8-flash", key: keys.geminiKey, url: "https://generativelanguage.googleapis.com/v1beta/models/", gemini: true });
  if (keys.openRouterKey) attempts.push({ provider: "OpenRouter", model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free", key: keys.openRouterKey, url: "https://openrouter.ai/api/v1/chat/completions" });
  if (!attempts.length) throw new Error("no-key");
  const blockedKeys = new Set<string>();
  for (const attempt of attempts) {
    signal?.throwIfAborted();
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    const keyIdentity = `${attempt.provider}:${attempt.key}`;
    if (blockedKeys.has(keyIdentity)) continue;
    const timeout = AbortSignal.timeout(Math.min(remaining, attempt.provider === "Groq" && groqKeys.length > 1 ? 3000 : 6500));
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    try {
      const response = await request(attempt.gemini ? `${attempt.url}${encodeURIComponent(attempt.model)}:generateContent` : attempt.url, {
        method: "POST",
        signal: combined,
        headers: { "Content-Type": "application/json", ...(attempt.gemini ? { "x-goog-api-key": attempt.key } : { Authorization: `Bearer ${attempt.key}` }) },
        body: JSON.stringify(attempt.gemini ? {
          systemInstruction: { parts: [{ text: system }] },
          contents: [...trimExchanges(history).messages.map(h => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.text }] })), { role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1600, ...(options.schema ? { responseMimeType: "application/json" } : {}) },
        } : {
          model: attempt.model,
          temperature: 0.1,
          max_completion_tokens: options.schema ? 1600 : 1200,
          ...(attempt.provider === "Groq" && attempt.model.startsWith("openai/gpt-oss-") ? { reasoning_effort: "low" } : {}),
          ...(options.schema && attempt.provider === "Groq" && attempt.model.startsWith("openai/gpt-oss-") ? { response_format: { type: "json_schema", json_schema: { name: "portfolio_answer", strict: true, schema: options.schema } } } : {}),
          messages: [{ role: "system", content: system }, ...trimExchanges(history).messages.map(h => ({ role: h.role, content: h.text })), { role: "user", content: prompt }],
        }),
      });
      if (!response.ok) {
        // Try the other key before downgrading the model. Invalid credentials
        // disable only that key for this request, leaving its backup usable.
        // Keys from one organization still share that organization's quotas.
        if ([401, 403].includes(response.status)) blockedKeys.add(keyIdentity);
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
