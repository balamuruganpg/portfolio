import type { Doc, Section } from "./corpus";

const STOP = new Set(
  "a an the is are was were be been of to in on for and or with by at as it its this that these those what which who whom how why when where do does did can could would should will his he him her she they them their you your me my i we our about tell show give list any some all from into than then there here has have had just also please use used using project projects".split(
    " ",
  ),
);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t));
}

interface Intent {
  re: RegExp;
  boost: (d: Doc) => number;
}

const hasCat = (d: Doc, c: string) => !!d.project?.categories.includes(c as never);

const INTENTS: Intent[] = [
  { re: /\b(live|deployed|deploy|demo|demos|hosted|online|try|running)\b/, boost: (d) => (d.project?.live || d.project?.pypi ? 8 : 0) },
  { re: /\b(featured|best|top|main|flagship|strongest)\b/, boost: (d) => (d.project?.featured ? 6 : 0) },
  { re: /\b(intern|internship|internships|experience|worked|work|company|companies)\b/, boost: (d) => (d.section === "experience" ? 8 : 0) },
  { re: /\b(education|college|degree|cgpa|gpa|university|school|study|studies|studying|grade|marks|rank|12th)\b/, boost: (d) => (d.section === "education" ? 8 : 0) },
  { re: /\b(cert|certs|certification|certifications|certificate|certified|course|courses)\b/, boost: (d) => (d.section === "certs" ? 8 : 0) },
  { re: /\b(skill|skills|know|knows|languages?|expertise|technologies|tools)\b/, boost: (d) => (d.section === "skills" ? 6 : 0) },
  { re: /\b(open to|hire|hiring|available|availability|roles?|job|jobs|opportunit\w*|looking)\b/, boost: (d) => (d.section === "profile" ? 8 : 0) },
  { re: /\b(who\b|who is|about (him|balamurugan|bpg)|balamurugan|bpg|location|located|based in|where is he)\b/, boost: (d) => (d.section === "profile" ? 6 : 0) },
  { re: /\b(projects?|built|repos?|repositories|work)\b/, boost: (d) => (d.section === "project" ? (d.project?.featured ? 8 : 5) : 0) },
  { re: /\b(agent|agents|agentic|multi-agent)\b/, boost: (d) => (hasCat(d, "Agents") ? 4 : 0) },
  { re: /\b(vision|image|images|x-ray|xray|cnn|medical)\b/, boost: (d) => (hasCat(d, "Computer Vision") ? 4 : 0) },
  { re: /\b(dashboard|dashboards|streamlit)\b/, boost: (d) => (hasCat(d, "Dashboards") || /streamlit/i.test(d.text) ? 4 : 0) },
  { re: /\b(deep learning|neural|dl)\b/, boost: (d) => (hasCat(d, "Deep Learning") ? 4 : 0) },
  { re: /\b(cluster|clustering|unsupervised)\b/, boost: (d) => (hasCat(d, "Clustering") ? 4 : 0) },
  { re: /\b(eda|exploratory)\b/, boost: (d) => (hasCat(d, "EDA") ? 4 : 0) },
  { re: /\b(web|website|full-stack|fullstack|frontend|backend)\b/, boost: (d) => (hasCat(d, "Web") ? 4 : 0) },
];

/** Requests that are clearly not about the portfolio, unless they name something on it. */
const OFF_TOPIC = /\b(poem|story|joke|essay|recipe|weather|news|translate|capital of|president|stock price|bitcoin|homework|lyrics|movie|write (me )?(a|some)|generate (a|an) )\b/;

export interface Retrieval {
  docs: Doc[];
  scores: number[];
  aliasHit: boolean;
  offTopic: boolean;
}

export const MIN_SCORE = 4;

export function retrieve(query: string, corpus: Doc[], k = 6): Retrieval {
  const q = query.toLowerCase();
  const qTokens = tokenize(query);
  let aliasHit = false;

  const scored = corpus.map((d) => {
    let s = 0;
    // 1. alias phrases (project names, "medrag", "ipo", ...)
    for (const a of d.aliases) {
      const re = new RegExp(`(^|[^a-z0-9])${a.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}([^a-z0-9]|$)`);
      if (re.test(q)) {
        s += a === d.title.toLowerCase() || (d.project && a === d.project.slug) ? 14 : 6;
        if (d.section === "project") aliasHit = true;
      }
    }
    // 2. keyword overlap: title tokens weigh more than body tokens
    const titleT = new Set(tokenize(d.title));
    const bodyT = tokenize(d.text);
    for (const t of qTokens) {
      if (titleT.has(t)) s += 4;
      const n = bodyT.filter((b) => b === t).length;
      s += Math.min(n, 2);
    }
    // 3. section intents
    for (const it of INTENTS) if (it.re.test(q)) s += it.boost(d);
    return { d, s };
  });

  scored.sort((a, b) => b.s - a.s);
  const top = scored[0]?.s ?? 0;
  const offTopic = OFF_TOPIC.test(q) && !aliasHit;
  if (top < MIN_SCORE || offTopic) return { docs: [], scores: [], aliasHit, offTopic };

  const cut = Math.max(MIN_SCORE, top * 0.45);
  const kept = scored.filter((x) => x.s >= cut).slice(0, k);
  return { docs: kept.map((x) => x.d), scores: kept.map((x) => x.s), aliasHit, offTopic };
}

export interface Citation {
  label: string;
  href: string;
  section: Section;
}

export function citationsFor(docs: Doc[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const d of docs) {
    const label = d.project ? d.project.name : d.title;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, href: d.href, section: d.section });
  }
  return out;
}

/** Answer composed purely from retrieved text — used when the model is offline or its answer fails the guard. */
export function extractiveAnswer(docs: Doc[]): string {
  return docs.map((d) => `• ${d.project ? d.project.name : d.title}: ${d.summary}`).join("\n");
}

/** Numbers in `answer` that never appear in the context (e.g. an invented "95%"). */
export function unsupportedNumbers(answer: string, context: string): string[] {
  // Strip list item numbering (e.g., "1. ", "2) ", "(3) ") before checking
  const cleaned = answer
    .replace(/(?:^|\n|\s)(?:\d{1,2}[.)]|\(\d{1,2}\))\s+/g, " ");

  const norm = (s: string) => (s.match(/\d+(?:[.,]\d+)*%?/g) ?? []).map((n) => n.replace(/,/g, ""));
  const ctx = new Set(norm(context));
  return [...new Set(norm(cleaned))].filter((n) => {
    if (ctx.has(n)) return false;
    if (/^[1-5]$/.test(n)) return false;
    return true;
  });
}

/** Claim types the model must never introduce unless the context has them. */
export function unsupportedClaims(answer: string, context: string): string[] {
  const words = ["paper", "publication", "published in", "arxiv", "journal", "conference", "patent", "citations", "stars", "downloads", "award"];
  const a = answer.toLowerCase();
  const c = context.toLowerCase();
  return words.filter((w) => a.includes(w) && !c.includes(w));
}
