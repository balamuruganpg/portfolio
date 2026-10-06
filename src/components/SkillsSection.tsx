"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { projects, skills } from "@/data/site";
import { onSpot } from "./motion";
import { Arrow, EV, Ext, emit } from "./ui";

interface SkillReceipt {
  name: string;
  category: string;
  description: string;
  projectSlugs: string[];
  tag: string;
  metric?: string;
}

const SKILL_RECEIPTS: SkillReceipt[] = [
  // ML & Deep Learning
  {
    name: "Reinforcement Learning (PPO)",
    category: "ML & Deep Learning",
    description: "Proximal Policy Optimization policy trained exclusively on synthetic market environments and evaluated zero-shot across 6 real universes with 10-seed confidence intervals.",
    projectSlugs: ["rai-axiom"],
    tag: "Sim-to-Real RL",
    metric: "10-Seed CI · Zero-Shot Real Transfer",
  },
  {
    name: "CNNs (DenseNet121, MobileNetV2)",
    category: "ML & Deep Learning",
    description: "Deep convolutional vision backbones fine-tuned for medical diagnostics, multi-class chest pathology and pneumonia screening.",
    projectSlugs: ["lungscan-ai", "pneumoscan"],
    tag: "Computer Vision",
    metric: "86–88% & 92.5% Test Accuracy",
  },
  {
    name: "Grad-CAM explainability",
    category: "ML & Deep Learning",
    description: "Visual heatmaps revealing gradient activations of the final convolutional layer to identify radiological regions of interest.",
    projectSlugs: ["lungscan-ai"],
    tag: "Model Interpretability",
    metric: "Visual Activation Heatmaps",
  },
  {
    name: "Gradient Boosting",
    category: "ML & Deep Learning",
    description: "Ensemble decision trees trained for customer churn classification and oncological clinical risk regression/classification.",
    projectSlugs: ["churnguard-pro", "oncoinsight-pro"],
    tag: "Ensemble Learning",
    metric: "7,043 & 17,686 Records Evaluated",
  },
  {
    name: "K-Means, DBSCAN, Hierarchical clustering",
    category: "ML & Deep Learning",
    description: "Unsupervised geometric and density-based clustering pipelines for morphometric demographic segmentation.",
    projectSlugs: ["kmeans", "dbscan", "hierarchical-clustering"],
    tag: "Unsupervised ML",
    metric: "Height-Weight Distributions",
  },
  {
    name: "RNN",
    category: "ML & Deep Learning",
    description: "Recurrent neural architectures for sequence modeling over multivariate time-series power consumption telemetry.",
    projectSlugs: ["household-power-rnn"],
    tag: "Sequential Modeling",
    metric: "Time-Series Telemetry",
  },
  {
    name: "ANN",
    category: "ML & Deep Learning",
    description: "Multi-layer perceptron networks with dense feedforward representations for tabular binary classification.",
    projectSlugs: ["titanic-ann"],
    tag: "Deep Tabular",
    metric: "Feedforward Multi-Layer",
  },

  // LLMs & Agents
  {
    name: "Multi-agent systems",
    category: "LLMs & Agents",
    description: "Coordinated LLM agent topologies where specialized bull/bear analyst roles synthesize opposing investment theses.",
    projectSlugs: ["bull-bear-autopilot"],
    tag: "Agentic Architecture",
    metric: "568 Unit & Integration Tests",
  },
  {
    name: "Multi-provider LLM fallback",
    category: "LLMs & Agents",
    description: "Fault-tolerant orchestration across 5 distinct model providers with automatic failover on rate-limits, errors or token starvation.",
    projectSlugs: ["ai-leetcode-agent"],
    tag: "Resilience Engineering",
    metric: "5-Provider Chain · 230+ Solved",
  },
  {
    name: "Page-cited facts",
    category: "LLMs & Agents",
    description: "Strict evidence extraction forcing every quantitative claim to link directly to a specific source document page number.",
    projectSlugs: ["bull-bear-autopilot"],
    tag: "Grounded RAG",
    metric: "Document Page Citations",
  },
  {
    name: "Deterministic fact-checking",
    category: "LLMs & Agents",
    description: "Algorithmic validation layer that cross-checks agent-generated claims against extracted source filings before delivery.",
    projectSlugs: ["bull-bear-autopilot"],
    tag: "Verification Pipeline",
    metric: "Zero-Tolerance Hallucination Guard",
  },
  {
    name: "Retrieval-grounded assistants",
    category: "LLMs & Agents",
    description: "Dual keyword and semantic retrieval with boundary enforcement so the assistant refuses out-of-domain queries.",
    projectSlugs: ["bull-bear-autopilot"],
    tag: "Constrained Systems",
    metric: "Zero Hallucination Architecture",
  },

  // Evaluation & Data
  {
    name: "Train/eval contamination detection",
    category: "Evaluation & Data",
    description: "Production audit tool that catches subtle data leakage between training corpora and evaluation benchmarks.",
    projectSlugs: ["verascan"],
    tag: "Benchmark Integrity",
    metric: "Shipped on PyPI (pip install verascan)",
  },
  {
    name: "N-gram, fuzzy and semantic matching",
    category: "Evaluation & Data",
    description: "Multi-tier detection algorithm: exact matching, 13-gram overlap, Levenshtein fuzzy metrics, and embedding cosine distance.",
    projectSlugs: ["verascan"],
    tag: "Leakage Algorithms",
    metric: "4 Detection Modes",
  },
  {
    name: "EDA and statistical analysis",
    category: "Evaluation & Data",
    description: "Exploratory distribution analysis, hypothesis checks, correlation matrices and statistical profiling on real datasets.",
    projectSlugs: ["oncoinsight-pro", "video-game-sales-eda"],
    tag: "Data Science",
    metric: "17k+ Patient & Sales Records",
  },
  {
    name: "Tableau",
    category: "Evaluation & Data",
    description: "Business intelligence visual analytics and multi-dimensional dashboards for stakeholder reporting.",
    projectSlugs: [],
    tag: "Data Visualization",
    metric: "Certified Credential",
  },

  // Engineering
  {
    name: "Python",
    category: "Engineering",
    description: "Core programming language for ML model training, neural architectures, package design, automation and asynchronous services.",
    projectSlugs: ["verascan", "bull-bear-autopilot", "lungscan-ai", "pneumoscan"],
    tag: "Core Runtime",
    metric: "PyPI Package Author",
  },
  {
    name: "FastAPI",
    category: "Engineering",
    description: "Asynchronous high-performance REST APIs serving deep learning inference pipelines with typed request validation.",
    projectSlugs: ["lungscan-ai"],
    tag: "Backend Inference",
    metric: "Deployed on GCP",
  },
  {
    name: "React",
    category: "Engineering",
    description: "Modern interactive frontends with typed state management and responsive client applications.",
    projectSlugs: ["lungscan-ai"],
    tag: "Frontend",
    metric: "Live at medrag.in",
  },
  {
    name: "Streamlit",
    category: "Engineering",
    description: "Rapid ML dashboard engineering for clinical analysis, churn prediction and interactive model inference.",
    projectSlugs: ["pneumoscan", "churnguard-pro", "oncoinsight-pro"],
    tag: "ML Dashboards",
    metric: "3 Deployed Apps",
  },
  {
    name: "Supabase",
    category: "Engineering",
    description: "Postgres database with row-level security, auth and storage handling medical imaging telemetry and metadata.",
    projectSlugs: ["lungscan-ai"],
    tag: "Cloud Database",
    metric: "Production MedTech DB",
  },
  {
    name: "Playwright",
    category: "Engineering",
    description: "Headless browser automation running 4 parallel worker instances for autonomous testing and LeetCode submission.",
    projectSlugs: ["ai-leetcode-agent"],
    tag: "Browser Automation",
    metric: "4 Parallel Workers",
  },
  {
    name: "Telegram bots",
    category: "Engineering",
    description: "Automated real-time financial advisory bot delivering verified IPO bull and bear dossiers to subscribers.",
    projectSlugs: ["bull-bear-autopilot"],
    tag: "Chatbots",
    metric: "Live Financial Bot",
  },
  {
    name: "PyPI packaging",
    category: "Engineering",
    description: "Standard Python packaging, wheel distribution, semantic versioning and publishing on the Python Package Index.",
    projectSlugs: ["verascan"],
    tag: "Open Source",
    metric: "pip install verascan",
  },
  {
    name: "GCP",
    category: "Engineering",
    description: "Google Cloud Platform compute instances and containerized microservice deployments.",
    projectSlugs: ["lungscan-ai"],
    tag: "Cloud Infrastructure",
    metric: "Production Deployment",
  },
  {
    name: "OCI",
    category: "Engineering",
    description: "Oracle Cloud Infrastructure enterprise data science, generative AI services and vector search workloads.",
    projectSlugs: [],
    tag: "Enterprise Cloud",
    metric: "4x OCI Certified",
  },
  {
    name: "Linux",
    category: "Engineering",
    description: "Bash scripting, environment configuration, server administration, container lifecycles and process management.",
    projectSlugs: [],
    tag: "Systems",
    metric: "Certified Fundamentals",
  },
];

const DOMAIN_ICONS: Record<string, string> = {
  "ML & Deep Learning": "🧠",
  "LLMs & Agents": "🤖",
  "Evaluation & Data": "🔬",
  Engineering: "⚙️",
};

export default function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedSkillName, setSelectedSkillName] = useState<string>(
    "Train/eval contamination detection"
  );

  const categories = useMemo(() => ["All", ...skills.map((s) => s.group)], []);

  const selectedSkill = useMemo(() => {
    return (
      SKILL_RECEIPTS.find((s) => s.name === selectedSkillName) ||
      SKILL_RECEIPTS[0]
    );
  }, [selectedSkillName]);

  const linkedProjects = useMemo(() => {
    return selectedSkill.projectSlugs
      .map((slug) => projects.find((p) => p.slug === slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [selectedSkill]);

  const filteredGroups = useMemo(() => {
    if (activeCategory === "All") return skills;
    return skills.filter((s) => s.group === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-8">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`relative rounded-full px-4 py-1.5 font-mono text-xs transition duration-300 ${
                active
                  ? "text-bg font-semibold"
                  : "border border-line text-muted hover:border-faint hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="skill-domain-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent shadow-[0_0_16px_rgba(61,220,132,0.5)]"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {cat !== "All" && <span>{DOMAIN_ICONS[cat]}</span>}
                <span>{cat}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Skills Matrix + Interactive Receipts Inspector */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: Skill Groups & Interactive Chips (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {filteredGroups.map((group) => (
            <div
              key={group.group}
              onMouseMove={onSpot}
              className="spot group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent/30"
            >
              <div className="mb-4 flex items-center justify-between border-b border-line/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{DOMAIN_ICONS[group.group] || "✦"}</span>
                  <h4 className="text-base font-semibold tracking-tight text-ink">
                    {group.group}
                  </h4>
                </div>
                <span className="font-mono text-[11px] text-faint">
                  {group.items.length} competencies
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.items.map((it) => {
                  const isSelected = selectedSkillName === it;
                  const receipt = SKILL_RECEIPTS.find((s) => s.name === it);
                  const hasProjects = (receipt?.projectSlugs.length || 0) > 0;

                  return (
                    <button
                      key={it}
                      type="button"
                      onClick={() => setSelectedSkillName(it)}
                      className={`group/chip relative flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition duration-200 ${
                        isSelected
                          ? "border-accent bg-accent/15 text-accent shadow-[0_0_16px_rgba(61,220,132,0.25)] font-medium"
                          : "border-line/70 bg-raised/60 text-muted hover:border-accent/40 hover:text-ink hover:bg-raised"
                      }`}
                    >
                      {hasProjects && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? "bg-accent animate-ping" : "bg-accent/60"
                          }`}
                        />
                      )}
                      <span>{it}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Live Receipts & Implementation Inspector (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSkill.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                onMouseMove={onSpot}
                className="spot rounded-2xl border border-accent/40 bg-surface p-6 shadow-xl shadow-black/40"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-accent uppercase tracking-wider">
                      IMPLEMENTATION RECEIPT
                    </span>
                  </div>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent border border-accent/30">
                    {selectedSkill.tag}
                  </span>
                </div>

                {/* Skill Name */}
                <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
                  {selectedSkill.name}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-muted font-light">
                  {selectedSkill.description}
                </p>

                {/* Metric / Highlight */}
                {selectedSkill.metric && (
                  <div className="mt-4 rounded-xl border border-line/60 bg-raised/50 p-3">
                    <span className="label !text-[10px] text-faint block">VERIFIED METRIC / PROOF</span>
                    <span className="font-mono text-xs font-semibold text-accent mt-0.5 block">
                      {selectedSkill.metric}
                    </span>
                  </div>
                )}

                {/* Shipped In Projects */}
                <div className="mt-5 border-t border-line/60 pt-4">
                  <span className="label !text-[10px] text-muted block mb-2.5">
                    SHIPPED IN {linkedProjects.length > 0 ? `${linkedProjects.length} REPOSITORIES` : "CREDENTIALED STUDY"}
                  </span>

                  {linkedProjects.length > 0 ? (
                    <div className="space-y-2.5">
                      {linkedProjects.map((proj) => (
                        <div
                          key={proj.slug}
                          className="flex items-center justify-between rounded-xl border border-line bg-raised/60 p-3 transition hover:border-accent/40"
                        >
                          <div>
                            <h5 className="text-xs font-semibold text-ink">{proj.name}</h5>
                            <p className="text-[11px] text-muted line-clamp-1">{proj.summary}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => emit(EV.focusProject, proj.slug)}
                              className="rounded-full bg-surface px-2 py-1 font-mono text-[10px] text-faint transition hover:text-accent hover:bg-raised"
                              title="Scroll to project card"
                            >
                              view ↓
                            </button>
                            <Ext
                              href={proj.repo}
                              className="rounded-full bg-surface p-1 text-muted transition hover:text-accent"
                              title="Open GitHub"
                            >
                              <Arrow className="h-3 w-3" />
                            </Ext>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-line/80 p-3 text-center">
                      <p className="text-xs text-muted">
                        Verified through professional certification curriculum and industry coursework.
                      </p>
                    </div>
                  )}
                </div>

                {/* Direct Assistant Action */}
                <div className="mt-6 border-t border-line/60 pt-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-faint">Want proof?</span>
                  <button
                    type="button"
                    onClick={() =>
                      emit(
                        EV.ask,
                        `How does Balamurugan use ${selectedSkill.name}?`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/40 px-3.5 py-1.5 font-mono text-xs text-accent transition hover:bg-accent hover:text-bg hover:shadow-[0_0_16px_rgba(61,220,132,0.4)]"
                  >
                    <span>Ask assistant about this</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
