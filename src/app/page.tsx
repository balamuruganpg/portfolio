"use client";

import { motion } from "framer-motion";
import Assistant from "@/components/Assistant";
import CommandPalette from "@/components/CommandPalette";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Projects from "@/components/Projects";
import SkillsSection from "@/components/SkillsSection";
import { Arrow, AskButton, Ext } from "@/components/ui";
import {
  EASE,
  Magnetic,
  Marquee,
  Reveal,
  onSpot,
} from "@/components/motion";
import {
  certifications,
  education,
  experience,
  profile,
  projects,
  skills,
} from "@/data/site";

const CASE_ORDER = ["rai-axiom", "verascan", "bull-bear-autopilot", "lungscan-ai", "ai-leetcode-agent"];
const caseRows = CASE_ORDER.map((s) => projects.find((p) => p.slug === s)!).filter((p) => p?.caseStudy);

const MARQUEE_TECH = [
  "RAI-Axiom (PPO Sim-to-Real)",
  "VeraScan on PyPI",
  "DenseNet121 & MobileNetV2",
  "Grad-CAM Explainability",
  "Train/Eval Contamination Detection",
  "13-Gram & Semantic Overlap",
  "Multi-Agent Indian IPO Analysis",
  "Deterministic Fact-Checking",
  "568 Automated Tests",
  "5-Provider LLM Fallback",
  "Playwright Browser Workers",
  "FastAPI + React + Supabase",
  "Streamlit Dashboards",
  "GCP & OCI Cloud",
  "Python Packaging",
];

function SectionHead({
  id,
  index,
  title,
  sub,
}: {
  id: string;
  index: string;
  title: string;
  sub?: string;
}) {
  return (
    <div id={id} className="mb-10 pt-16">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-accent tracking-widest">
            {index}
          </span>
          <span className="h-px w-8 bg-accent/40" />
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {title}
          </h2>
        </div>
        {sub && (
          <p className="mt-3 max-w-2xl text-lg font-light tracking-tight text-ink/80 md:text-xl">
            {sub}
          </p>
        )}
      </Reveal>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bg text-ink selection:bg-accent selection:text-bg">
      <Nav />

      <main>
        {/* HERO SECTION */}
        <Hero />

        {/* TECH MARQUEE STRIP */}
        <div className="border-y border-line/70 bg-surface/50 py-3.5 backdrop-blur-sm">
          <Marquee items={MARQUEE_TECH} duration={48} />
        </div>

        <div className="mx-auto max-w-6xl px-5">
          {/* SECTION 01: FEATURED WORK */}
          <section className="pb-24">
            <SectionHead
              id="featured"
              index="01"
              title="Featured Work"
              sub="Problem, method, and empirical numbers from each repository. Zero inflated claims."
            />

            <div className="space-y-6">
              {caseRows.map((p, idx) => (
                <Reveal key={p.slug} delay={idx * 0.1}>
                  <article
                    id={`case-${p.slug}`}
                    onMouseMove={onSpot}
                    className="spot group relative overflow-hidden rounded-2xl border border-line bg-surface/80 p-6 md:p-8 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                  >
                    <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                      {/* Left: Project Identity & Links */}
                      <div className="lg:col-span-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-accent">0{idx + 1}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-line" />
                          <span className="font-mono text-xs text-muted">CASE STUDY</span>
                          {p.status === "Ongoing" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Ongoing
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors duration-200">
                          {p.name}
                        </h3>

                        {p.authors && (
                          <p className="mt-1 font-mono text-[11px] text-accent/90">
                            {p.authors}
                          </p>
                        )}

                        <p className="mt-2.5 text-xs leading-relaxed text-muted line-clamp-3">
                          {p.summary}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {p.stack.map((s) => (
                            <span
                              key={s}
                              className="rounded border border-line/60 bg-raised/70 px-2 py-0.5 font-mono text-[10.5px] text-muted"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                          <Ext
                            href={p.repo}
                            data-kind="repo"
                            className="group/arrow inline-flex items-center gap-1.5 rounded-full border border-line bg-raised/50 px-3.5 py-1.5 text-xs text-ink transition hover:border-accent/50 hover:text-accent"
                          >
                            GitHub <Arrow className="h-3 w-3" />
                          </Ext>
                          {p.live && (
                            <Ext
                              href={p.live}
                              data-kind="live"
                              className="group/arrow inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent transition hover:bg-accent hover:text-bg hover:shadow-[0_0_16px_rgba(61,220,132,0.4)]"
                            >
                              Live App <Arrow className="h-3 w-3" />
                            </Ext>
                          )}
                          {p.pypi && (
                            <Ext
                              href={p.pypi}
                              data-kind="pypi"
                              className="group/arrow inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent transition hover:bg-accent hover:text-bg hover:shadow-[0_0_16px_rgba(61,220,132,0.4)]"
                            >
                              PyPI <Arrow className="h-3 w-3" />
                            </Ext>
                          )}
                        </div>
                      </div>

                      {/* Center: Problem & Method */}
                      <div className="grid gap-4 border-t border-line/60 pt-5 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
                        <div>
                          <p className="label !text-[10px] text-accent/90 mb-1 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-accent" />
                            PROBLEM STATEMENT
                          </p>
                          <p className="text-sm leading-relaxed text-ink/90 font-light">
                            {p.caseStudy!.problem}
                          </p>
                        </div>
                        <div>
                          <p className="label !text-[10px] text-muted mb-1 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-muted" />
                            TECHNICAL METHOD
                          </p>
                          <p className="text-xs leading-relaxed text-muted">
                            {p.caseStudy!.method}
                          </p>
                        </div>
                      </div>

                      {/* Right: Key Result Metric */}
                      <div className="flex flex-col justify-between rounded-xl border border-line/60 bg-raised/40 p-5 lg:col-span-3 lg:text-right">
                        <div>
                          <span className="label !text-[10px] text-faint">VERIFIED RESULT</span>
                          <p
                            className={`mt-1 font-mono font-bold tracking-tight text-accent ${
                              p.caseStudy!.result.length > 8 ? "text-xl" : "text-4xl"
                            }`}
                          >
                            {p.caseStudy!.result}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {p.caseStudy!.resultLabel}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-line/40">
                          <AskButton
                            q={`What is ${p.name}?`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition hover:text-accent"
                          >
                            <span>Ask assistant</span>
                            <span className="text-accent">→</span>
                          </AskButton>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          {/* SECTION 02: ALL PROJECTS */}
          <section className="pb-24">
            <SectionHead
              id="projects"
              index="02"
              title={`All ${projects.length} Repositories`}
              sub="Explore all public codebases across autonomous agents, deep learning, computer vision and analytics."
            />
            <Projects />
          </section>

          {/* SECTION 03: EXPERIENCE & EDUCATION */}
          <section className="pb-24">
            <SectionHead
              id="experience"
              index="03"
              title="Experience & Education"
              sub="Formal computer science education and verified AI/ML engineering internships."
            />

            <div className="grid gap-8 md:grid-cols-2">
              {/* Internships */}
              <Reveal>
                <div
                  onMouseMove={onSpot}
                  className="spot h-full rounded-2xl border border-line bg-surface/80 p-7 backdrop-blur-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <p className="label flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      INTERNSHIPS
                    </p>
                    <span className="rounded-full bg-raised px-2.5 py-0.5 font-mono text-[11px] text-muted">
                      {experience.length} ROLES
                    </span>
                  </div>

                  <div className="relative space-y-8 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-line">
                    {experience.map((e) => (
                      <div key={e.org} className="relative">
                        <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full border-2 border-accent bg-bg shadow-[0_0_8px_rgba(61,220,132,0.6)]" />
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h4 className="font-semibold text-ink">{e.org}</h4>
                          <span className="font-mono text-xs text-accent">{e.period}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted font-medium">
                          {e.role} {e.detail ? `· ${e.detail}` : ""} · {e.mode}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Education */}
              <Reveal delay={0.15}>
                <div
                  onMouseMove={onSpot}
                  className="spot h-full rounded-2xl border border-line bg-surface/80 p-7 backdrop-blur-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <p className="label flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      ACADEMIC BACKGROUND
                    </p>
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent">
                      CGPA 90.6%
                    </span>
                  </div>

                  <div className="relative space-y-8 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-line">
                    {education.map((ed) => (
                      <div key={ed.degree} className="relative">
                        <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full border-2 border-accent bg-bg shadow-[0_0_8px_rgba(61,220,132,0.6)]" />
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <h4 className="font-semibold text-ink">{ed.degree}</h4>
                          {ed.period && (
                            <span className="font-mono text-xs text-muted">{ed.period}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted">{ed.school}</p>
                        <p className="mt-1 font-mono text-xs text-accent/90">{ed.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* SECTION 04: SKILLS */}
          <section className="pb-24">
            <SectionHead
              id="skills"
              index="04"
              title="Technical Matrix"
              sub="Applied competencies across the full AI lifecycle from architecture to production evaluation."
            />

            <SkillsSection />
          </section>

          {/* SECTION 05: CERTIFICATIONS */}
          <section className="pb-24">
            <SectionHead
              id="certs"
              index="05"
              title={`Certifications (${certifications.length})`}
              sub="Verified industry and professional credentials in data science, generative AI, and machine learning."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((c, idx) => (
                <Reveal key={c} delay={idx * 0.04}>
                  <div
                    onMouseMove={onSpot}
                    className="spot group flex items-center justify-between rounded-xl border border-line bg-surface/70 px-4 py-3.5 backdrop-blur-sm transition-all hover:border-accent/40 hover:bg-surface"
                  >
                    <span className="text-xs font-medium text-ink/90 group-hover:text-accent transition-colors">
                      {c}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-accent/60">
                      ✓ verified
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* SECTION 06: HOW THE ASSISTANT WORKS */}
          <section className="pb-24">
            <SectionHead
              id="how"
              index="06"
              title="Grounded Architecture"
              sub="How the portfolio assistant guarantees factual answers with zero open-web hallucination."
            />

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Retrieve",
                  detail:
                    "Keyword and sectional token matching across all 14 project records, experience, education and resume text. Out-of-domain queries are rejected instantly.",
                  tag: "Deterministic Corpus",
                },
                {
                  step: "02",
                  title: "Cite",
                  detail:
                    "Every matched document produces interactive citation chips. Users can click any citation chip to scroll directly to the corresponding card on this page.",
                  tag: "Bidirectional Grounding",
                },
                {
                  step: "03",
                  title: "Generate & Guard",
                  detail:
                    "Single LLM call bounded to context. An anti-hallucination guard rejects any output introducing numbers or academic claims not found verbatim in source docs.",
                  tag: "Zero Hallucination",
                },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.1}>
                  <div
                    onMouseMove={onSpot}
                    className="spot group relative h-full rounded-2xl border border-line bg-surface/80 p-6 backdrop-blur-sm transition hover:border-accent/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-bold text-accent">
                        {item.step}
                      </span>
                      <span className="rounded-full bg-raised px-2.5 py-0.5 font-mono text-[10px] text-muted">
                        {item.tag}
                      </span>
                    </div>

                    <h4 className="mt-4 text-lg font-semibold text-ink group-hover:text-accent transition-colors">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-xs leading-relaxed text-muted font-light">
                      {item.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line/70 bg-surface/50 p-4 backdrop-blur-sm">
              <span className="font-mono text-xs text-muted">
                Test the grounded pipeline right now:
              </span>
              <div className="flex flex-wrap gap-2">
                <AskButton
                  q="What did VeraScan ship?"
                  className="rounded-full border border-line bg-raised px-3 py-1 font-mono text-xs text-ink transition hover:border-accent hover:text-accent"
                >
                  “What did VeraScan ship?” →
                </AskButton>
                <AskButton
                  q="Which projects are live?"
                  className="rounded-full border border-line bg-raised px-3 py-1 font-mono text-xs text-ink transition hover:border-accent hover:text-accent"
                >
                  “Which projects are live?” →
                </AskButton>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER & CONTACT */}
      <footer id="contact" className="border-t border-line/80 bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-accent bg-accent/10 font-mono text-xs font-bold text-accent">
                  {profile.initials}
                </span>
                <span className="font-semibold text-ink">{profile.name}</span>
              </div>

              <p className="mt-4 max-w-md text-sm text-muted leading-relaxed">
                {profile.role} based in {profile.location}. {profile.availability}.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Magnetic>
                  <a
                    href={profile.resume}
                    download="BalamuruganPG_Resume.pdf"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-bg transition hover:brightness-110 shadow-[0_0_20px_rgba(61,220,132,0.3)]"
                  >
                    Download Resume (PDF)
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs text-ink transition hover:border-accent hover:text-accent"
                  >
                    Get in Touch
                  </a>
                </Magnetic>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-6 sm:grid-cols-3">
              <div>
                <p className="label mb-3 !text-[10px]">DIRECT</p>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a className="link text-muted hover:text-ink" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  </li>
                  <li>
                    <a className="link text-muted hover:text-ink" href={`tel:${profile.phone.replace(/\s/g, "")}`}>
                      {profile.phone}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="label mb-3 !text-[10px]">SOCIAL</p>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Ext href={profile.github} className="link text-muted hover:text-ink">
                      GitHub ↗
                    </Ext>
                  </li>
                  <li>
                    <Ext href={profile.linkedin} className="link text-muted hover:text-ink">
                      LinkedIn ↗
                    </Ext>
                  </li>
                  <li>
                    <Ext href={profile.leetcode} className="link text-muted hover:text-ink">
                      LeetCode ↗
                    </Ext>
                  </li>
                </ul>
              </div>

              <div>
                <p className="label mb-3 !text-[10px]">NAVIGATE</p>
                <ul className="space-y-2 text-xs font-mono text-muted">
                  <li>
                    <a href="#top" className="hover:text-accent transition">
                      ↑ Top
                    </a>
                  </li>
                  <li>
                    <a href="#featured" className="hover:text-accent transition">
                      Work
                    </a>
                  </li>
                  <li>
                    <a href="#projects" className="hover:text-accent transition">
                      Projects
                    </a>
                  </li>
                  <li>
                    <a href="#experience" className="hover:text-accent transition">
                      Experience
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-8 font-mono text-[11px] text-faint sm:flex-row">
            <p>© {new Date().getFullYear()} {profile.name} · balamuruganpg.in</p>
            <p>Press Ctrl+K / ⌘K for command palette</p>
          </div>
        </div>
      </footer>

      {/* FIXED AGENTIC FEATURES */}
      <Assistant />
      <CommandPalette />
    </div>
  );
}
