import { profile } from "@/data/site";

const facts = [
  ["Location", profile.location],
  ["Education", "B.E. CSE · 2023–2027"],
  ["Rank", "First Rank in CSE, NIT · 2025–2026"],
  ["Focus", "ML, Deep Learning, LLMs & Agents"],
  ["Availability", profile.availability],
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-12 lg:gap-16 md:py-24">
      <div className="lg:col-span-7">
        <p className="label text-accent">The person behind the projects</p>
        <h2 id="about-title" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">About me</h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
          <p>I’m pursuing B.E. Computer Science and Engineering at Nehru Institute of Technology, Coimbatore (2023–2027).</p>
          <p>I hold a CGPA of 90.6% and earned First Rank in CSE, NIT for 2025–2026.</p>
          <p>My focus spans ML & Deep Learning, LLMs & Agents, and Evaluation & Engineering.</p>
          <p>I interned remotely at Neo Zeno Talent (May–Aug 2026) and Yuva Intern in Automotive AI (Mar–Apr 2026). I’m based in Coimbatore and open to AI/ML internships and junior roles.</p>
        </div>
        <a href="#experience" className="link mt-6 inline-block text-sm text-accent">Experience & education ↓</a>
      </div>
      <aside className="rounded-2xl border border-line bg-surface p-6 lg:col-span-5 md:p-8" aria-label="Quick facts">
        <h3 className="font-mono text-sm font-semibold text-ink">Quick facts</h3>
        <dl className="mt-4 divide-y divide-line">
          {facts.map(([label, value]) => <div key={label} className="grid grid-cols-[6rem_1fr] gap-3 py-3 text-sm"><dt className="text-muted">{label}</dt><dd className="min-w-0 leading-relaxed text-ink">{value}</dd></div>)}
          <div className="grid grid-cols-[6rem_1fr] gap-3 pt-3 text-sm"><dt className="text-muted">Contact</dt><dd className="min-w-0"><a href={`mailto:${profile.email}`} className="link break-all">{profile.email}</a></dd></div>
        </dl>
      </aside>
    </section>
  );
}
