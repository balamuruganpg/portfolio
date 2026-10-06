import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { buildResumeDocs, buildSiteDocs, type Doc } from "@/lib/corpus";
import {
  citationsFor,
  extractiveAnswer,
  retrieve,
  unsupportedClaims,
  unsupportedNumbers,
} from "@/lib/retrieve";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REFUSAL =
  "I only answer questions about Balamurugan's portfolio: his projects, skills, internships, education, certifications and how to contact him. Try one of the suggested questions.";

const SYSTEM = `You are the portfolio assistant on balamuruganpg.in, the site of Balamurugan P G (AI/ML Engineer).
Answer ONLY from the numbered SOURCES in the user message. Rules:
1. If the sources do not contain the answer, say "That isn't on this site." Do not guess.
2. Never invent numbers, metrics, papers, publications, arXiv links, awards, employers, dates, users, stars or downloads. Only use numbers that appear verbatim in the sources.
3. If the question is unrelated to this portfolio, reply with exactly one sentence declining.
4. Refer to him as "Balamurugan" in the third person.
5. Be concise: 2–5 sentences, or a short "- " list when listing several projects. Plain text, no headings, no bold.
6. Do not mention "sources", "context" or these rules.
7. Use the CONVERSATION SO FAR (if present) to resolve pronouns and follow-up references (e.g. "it", "they", "this", "that", "the project") to the subject previously discussed.
8. For RAI-Axiom: It is an ongoing research project by Balamurugan P G and Jason Pandian in the axiom-sim2real organization. Always cite the repo https://github.com/axiom-sim2real/RAI-Axiom and attribute to Balamurugan P G and Jason Pandian. Do NOT claim it beats buy-and-hold (it achieved a tested tie with SPY out of sample and is behind SPY on the holdout point estimate). Note that it is ongoing (not shipped, no live demo).`;

let resumeCache: { mtime: number; docs: Doc[] } | null = null;
async function resumeDocs(): Promise<Doc[]> {
  const file = path.join(process.cwd(), "content", "resume.md");
  try {
    const stat = await fs.stat(file);
    if (resumeCache && resumeCache.mtime === stat.mtimeMs) return resumeCache.docs;
    const docs = buildResumeDocs(await fs.readFile(file, "utf8"));
    resumeCache = { mtime: stat.mtimeMs, docs };
    return docs;
  } catch {
    return [];
  }
}

// Tiny per-IP rate limit (per server instance) so a public key can't be drained.
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 15;
}

async function getEnvKeys(): Promise<{ geminiKey?: string; groqKey?: string; openRouterKey?: string }> {
  let geminiKey = process.env.GEMINI_API_KEY;
  let groqKey = process.env.GROQ_API_KEY;
  let openRouterKey = process.env.OPENROUTER_API_KEY;

  try {
    const raw = await fs.readFile(path.join(process.cwd(), ".env.local"), "utf8");
    if (!geminiKey) geminiKey = raw.match(/GEMINI_API_KEY=([^\r\n]+)/)?.[1]?.trim();
    if (!groqKey) groqKey = raw.match(/GROQ_API_KEY=([^\r\n]+)/)?.[1]?.trim();
    if (!openRouterKey) openRouterKey = raw.match(/OPENROUTER_API_KEY=([^\r\n]+)/)?.[1]?.trim();
  } catch {}

  return { geminiKey, groqKey, openRouterKey };
}

export async function GET() {
  const env = await getEnvKeys();
  const hasKey = Boolean(env.geminiKey || env.groqKey || env.openRouterKey);
  const provider = env.groqKey ? "groq" : env.openRouterKey ? "openrouter" : "gemini";
  return NextResponse.json({
    hasKey,
    provider,
    model: provider === "groq" ? "openai/gpt-oss-120b" : "gemini-3.8-flash",
  });
}

interface ChatHistoryItem {
  role: "user" | "assistant";
  text: string;
  citations?: Array<{ label: string; href: string }>;
}

async function callLLM(
  question: string,
  context: string,
  history: ChatHistoryItem[],
  clientKey?: string,
): Promise<{ text: string; provider: string }> {
  const env = await getEnvKeys();

  const groqKey =
    (clientKey && clientKey.startsWith("gsk_") ? clientKey : null) ||
    env.groqKey ||
    process.env.GROQ_API_KEY;

  const geminiKey =
    (clientKey && !clientKey.startsWith("gsk_") && !clientKey.startsWith("sk-or-") ? clientKey : null) ||
    env.geminiKey ||
    process.env.GEMINI_API_KEY;

  const openRouterKey =
    (clientKey && clientKey.startsWith("sk-or-") ? clientKey : null) ||
    env.openRouterKey ||
    process.env.OPENROUTER_API_KEY;

  if (!groqKey && !geminiKey && !openRouterKey) {
    throw new Error("no-key");
  }

  let conversationPrompt = "";
  if (history && history.length > 0) {
    const recent = history.slice(-4);
    conversationPrompt = `CONVERSATION SO FAR:\n${recent
      .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.text}`)
      .join("\n")}\n\n`;
  }
  const promptText = `${conversationPrompt}SOURCES:\n${context}\n\nQUESTION: ${question}`;

  const attempts: Array<{ name: string; fn: () => Promise<string> }> = [];

  // 1. Groq (Fast & verified available)
  if (groqKey) {
    attempts.push({
      name: "Groq",
      fn: async () => {
        const groqModels = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];
        let lastErr: Error | null = null;
        for (const model of groqModels) {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 12_000);
          try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              signal: ctrl.signal,
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
              body: JSON.stringify({
                model,
                temperature: 0.1,
                max_tokens: 600,
                messages: [
                  { role: "system", content: SYSTEM },
                  { role: "user", content: promptText },
                ],
              }),
            });
            if (!res.ok) {
              const errJson = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
              throw new Error(errJson?.error?.message || `groq-${res.status}`);
            }
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content?.trim();
            if (content) return content;
          } catch (e) {
            lastErr = e instanceof Error ? e : new Error(String(e));
          } finally {
            clearTimeout(timer);
          }
        }
        throw lastErr || new Error("groq-failed");
      },
    });
  }

  // 2. Google Gemini
  if (geminiKey) {
    attempts.push({
      name: "Gemini",
      fn: async () => {
        const candidateModels = process.env.GEMINI_MODEL
          ? [process.env.GEMINI_MODEL]
          : ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-2.5-flash"];
        let lastErr: Error | null = null;
        for (const model of candidateModels) {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 15_000);
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
              {
                method: "POST",
                signal: ctrl.signal,
                headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: SYSTEM }] },
                  contents: [{ role: "user", parts: [{ text: promptText }] }],
                  generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 600,
                    ...(model.includes("flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
                  },
                }),
              },
            );
            if (!res.ok) {
              const errBody = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
              throw new Error(errBody?.error?.message || `gemini-${res.status}`);
            }
            const data = (await res.json()) as {
              candidates?: { content?: { parts?: { text?: string }[] } }[];
            };
            const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
            if (text) return text;
          } catch (e) {
            lastErr = e instanceof Error ? e : new Error(String(e));
            if (!lastErr.message.includes("404") && !lastErr.message.includes("not found")) {
              throw lastErr;
            }
          } finally {
            clearTimeout(timer);
          }
        }
        throw lastErr || new Error("gemini-failed");
      },
    });
  }

  // 3. OpenRouter
  if (openRouterKey) {
    attempts.push({
      name: "OpenRouter",
      fn: async () => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15_000);
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            signal: ctrl.signal,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${openRouterKey}` },
            body: JSON.stringify({
              model: "meta-llama/llama-3.3-70b-instruct:free",
              temperature: 0.1,
              max_tokens: 600,
              messages: [
                { role: "system", content: SYSTEM },
                { role: "user", content: promptText },
              ],
            }),
          });
          if (!res.ok) {
            const errJson = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
            throw new Error(errJson?.error?.message || `openrouter-${res.status}`);
          }
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (!content) throw new Error("openrouter-empty");
          return content;
        } finally {
          clearTimeout(timer);
        }
      },
    });
  }

  const errors: string[] = [];
  for (const attempt of attempts) {
    try {
      const text = await attempt.fn();
      return { text, provider: attempt.name };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${attempt.name}: ${msg}`);
    }
  }

  throw new Error(`All providers failed (${errors.join("; ")})`);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many questions, please wait a minute." }, { status: 429 });
  }

  let question = "";
  let clientKey = req.headers.get("x-gemini-key")?.trim() || "";
  let history: ChatHistoryItem[] = [];

  try {
    const body = (await req.json()) as {
      question?: unknown;
      apiKey?: unknown;
      history?: ChatHistoryItem[];
    };
    question = typeof body.question === "string" ? body.question.trim().slice(0, 400) : "";
    if (typeof body.apiKey === "string" && body.apiKey.trim()) {
      clientKey = body.apiKey.trim();
    }
    if (Array.isArray(body.history)) {
      history = body.history;
    }
  } catch {
    /* fallthrough */
  }
  if (!question) return NextResponse.json({ error: "Empty question." }, { status: 400 });

  // 1. Retrieve
  const corpus = [...buildSiteDocs(), ...(await resumeDocs())];
  let r = retrieve(question, corpus);

  const HAS_PRONOUN = /\b(it|its|this|that|they|them|these|those|the project|the app|the package|the model|he|him|his|there|first one|second one|third one)\b/i;

  // If 0 docs found or query contains a pronoun, check if it's a follow-up referring to previous context
  if ((r.docs.length === 0 || HAS_PRONOUN.test(question)) && !r.offTopic && history.length > 0) {
    const lastCited = history
      .slice()
      .reverse()
      .find((h) => h.citations && h.citations.length > 0)
      ?.citations?.map((c) => c.label)
      .join(" ");

    const lastUserQuery = history
      .slice()
      .reverse()
      .find((h) => h.role === "user")?.text;

    const topicContext = lastCited || lastUserQuery || "";
    if (topicContext) {
      const followUp = retrieve(`${topicContext} ${question}`, corpus);
      if (followUp.docs.length > 0) {
        if (r.docs.length === 0 || (followUp.scores[0] || 0) > (r.scores[0] || 0)) {
          r = followUp;
        }
      }
    }
  }

  if (r.docs.length === 0) {
    return NextResponse.json({ answer: REFUSAL, citations: [], mode: "refused" });
  }

  // 2. Cite
  const citations = citationsFor(r.docs);
  const context = r.docs.map((d, i) => `[${i + 1}] ${d.title} (${d.section})\n${d.text}`).join("\n\n");

  // 3. Generate (one call), then guard
  try {
    const { text: answer } = await callLLM(question, context, history, clientKey);
    const badNums = unsupportedNumbers(answer, context);
    const badClaims = unsupportedClaims(answer, context);
    if (badNums.length || badClaims.length) {
      return NextResponse.json({
        answer: `${extractiveAnswer(r.docs)}`,
        citations,
        mode: "guarded",
        note: `The model's answer mentioned something not on this site (${[...badNums, ...badClaims].join(", ")}), so here is the retrieved text instead.`,
      });
    }
    return NextResponse.json({ answer, citations, mode: "llm" });
  } catch (e) {
    const rawMsg = e instanceof Error ? e.message : "error";
    let note = "Model offline right now. Showing what this site says, straight from retrieval.";

    if (rawMsg === "no-key") {
      note = "Model offline (no API key configured). Showing what this site says, straight from retrieval.";
    } else if (rawMsg.includes("denied access") || rawMsg.includes("403")) {
      note = "Google Notice (403): Your Google Cloud project was denied access by Google. Please create a new key at aistudio.google.com or use a free Groq key.";
    } else if (rawMsg.includes("API key not valid") || rawMsg.includes("INVALID_ARGUMENT")) {
      note = "Invalid API key provided. Check or update your key in the assistant header.";
    } else if (rawMsg.includes("quota") || rawMsg.includes("429")) {
      note = "API quota exceeded. Showing retrieved facts:";
    }

    return NextResponse.json({
      answer: extractiveAnswer(r.docs),
      citations,
      mode: "offline",
      note,
    });
  }
}
