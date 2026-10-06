/**
 * Single source of truth for the portfolio.
 * The page renders from this file AND the assistant (/api/chat) retrieves from it.
 * Only facts written here (plus content/resume.md) can ever appear in an assistant answer.
 */

export type Category =
  | "Agents"
  | "Computer Vision"
  | "Dashboards"
  | "Deep Learning"
  | "Clustering"
  | "EDA"
  | "Web";

export const FILTERS: ("All" | Category)[] = [
  "All",
  "Agents",
  "Computer Vision",
  "Dashboards",
  "Deep Learning",
  "Clustering",
  "EDA",
  "Web",
];

export interface CaseStudy {
  problem: string;
  method: string;
  /** The headline number — must come from the facts below, never estimated. */
  result: string;
  resultLabel: string;
}

export interface Project {
  slug: string;
  name: string;
  repo: string;
  org?: string;
  status?: "Ongoing" | "Shipped";
  authors?: string;
  live?: string;
  pypi?: string;
  featured?: boolean;
  categories: Category[];
  summary: string;
  stack: string[];
  /** Extra words the retriever should match on (lower-case). */
  aliases: string[];
  caseStudy?: CaseStudy;
}

export const profile = {
  name: "Balamurugan P G",
  initials: "BPG",
  role: "AI/ML Engineer",
  location: "Coimbatore, Tamil Nadu, India",
  site: "https://balamuruganpg.in",
  email: "balamuruganpg@outlook.com",
  phone: "+91 94860 14297",
  github: "https://github.com/balamuruganpg",
  linkedin: "https://www.linkedin.com/in/balamuruganpg",
  leetcode: "https://leetcode.com/u/balamuruganpg",
  resume: "/BalamuruganPG_Resume.pdf",
  availability: "Open to AI/ML internships and junior roles",
  hero: "I build ML systems that show their receipts: contamination checks, cited agents, and models you can open and try.",
};

export const education = [
  {
    degree: "B.E. Computer Science and Engineering",
    school: "Nehru Institute of Technology, Coimbatore (Anna University)",
    period: "2023–2027",
    detail: "CGPA 90.6% · First in CSE, 2025–2026",
  },
  {
    degree: "Higher Secondary (12th)",
    school: "Sourashtra HSS, Ramanathapuram",
    period: "",
    detail: "80%",
  },
];

export const experience = [
  {
    org: "Neo Zeno Talent",
    role: "Intern",
    mode: "Remote",
    period: "May–Aug 2026",
    detail: "",
  },
  {
    org: "Yuva Intern",
    role: "Intern",
    mode: "Remote",
    period: "Mar–Apr 2026",
    detail: "Automotive AI",
  },
];

export const certifications = [
  "OCI Data Science Professional (Oracle)",
  "OCI Generative AI Professional (Oracle)",
  "OCI AI Foundations (Oracle)",
  "Oracle AI Vector Search (Oracle)",
  "IBM Data Science (IBM)",
  "Deep Learning (Andrew Ng)",
  "Machine Learning with Python",
  "Google AI Essentials (Google)",
  "Generative AI Leader",
  "Linux Fundamentals",
  "Tableau",
  "NPTEL IoT (NPTEL)",
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "ML & Deep Learning",
    items: [
      "CNNs (DenseNet121, MobileNetV2)",
      "RNN",
      "ANN",
      "Gradient Boosting",
      "K-Means, DBSCAN, Hierarchical clustering",
      "Grad-CAM explainability",
      "Reinforcement Learning (PPO)",
    ],
  },
  {
    group: "LLMs & Agents",
    items: [
      "Multi-agent systems",
      "Multi-provider LLM fallback",
      "Page-cited answers",
      "Deterministic fact-checking",
      "Retrieval-grounded assistants",
    ],
  },
  {
    group: "Evaluation & Data",
    items: [
      "Train/eval contamination detection",
      "N-gram, fuzzy and semantic matching",
      "EDA and statistical analysis",
      "Tableau",
    ],
  },
  {
    group: "Engineering",
    items: [
      "Python",
      "FastAPI",
      "React",
      "Streamlit",
      "Supabase",
      "Playwright",
      "Telegram bots",
      "PyPI packaging",
      "GCP",
      "OCI",
      "Linux",
    ],
  },
];

const gh = (repo: string) => `https://github.com/balamuruganpg/${repo}`;

export const projects: Project[] = [
  {
    slug: "rai-axiom",
    name: "RAI-Axiom",
    org: "axiom-sim2real",
    repo: "https://github.com/axiom-sim2real/RAI-Axiom",
    status: "Ongoing",
    authors: "Balamurugan P G and Jason Pandian",
    featured: true,
    categories: ["Deep Learning"],
    summary:
      "A portfolio-allocation policy trained only on synthetic markets, then evaluated zero-shot on six real universes with 10-seed confidence intervals. PPO, no real prices during training. Research by Balamurugan P G and Jason Pandian. Ongoing project; does not claim to beat buy-and-hold (tested tie with SPY out of sample and behind SPY on the holdout point estimate).",
    stack: [
      "PPO",
      "Reinforcement Learning",
      "Synthetic Markets",
      "Sim-to-Real",
      "Zero-Shot Evaluation",
      "10-Seed CI",
    ],
    aliases: [
      "rai-axiom",
      "rai axiom",
      "axiom",
      "axiom-sim2real",
      "sim2real",
      "portfolio allocation",
      "synthetic markets",
      "ppo",
      "jason pandian",
      "reinforcement learning",
      "spy",
    ],
    caseStudy: {
      problem:
        "Train an RL portfolio-allocation policy without exposing it to real historical market prices during training, then test zero-shot transfer across real financial universes.",
      method:
        "Trained via Proximal Policy Optimization (PPO) exclusively on synthetic market environments, then evaluated zero-shot on 6 real universes across 10-seed confidence intervals. Ongoing research by Balamurugan P G and Jason Pandian.",
      result: "Tested tie with SPY",
      resultLabel: "out of sample · behind SPY on holdout point estimate (10-seed CI)",
    },
  },
  {
    slug: "verascan",
    name: "VeraScan",
    repo: gh("verascan"),
    pypi: "https://pypi.org/project/verascan/",
    featured: true,
    categories: [],
    summary:
      "Python package that detects train/eval data contamination with 4 checks: exact match, 13-gram overlap, fuzzy match and semantic similarity. Published on PyPI: pip install verascan.",
    stack: ["Python", "PyPI", "Exact match", "13-gram overlap", "Fuzzy match", "Semantic similarity"],
    aliases: ["verascan", "vera scan", "contamination", "leakage", "benchmark", "pypi", "pip install", "python package", "train/eval"],
    caseStudy: {
      problem: "If eval examples leak into training data, benchmark scores look better than the model really is.",
      method: "Checks train/eval pairs at 4 levels: exact match, 13-gram overlap, fuzzy match and semantic similarity.",
      result: "pip install verascan",
      resultLabel: "Published on PyPI · 4 detection modes",
    },
  },
  {
    slug: "bull-bear-autopilot",
    name: "Bull/Bear Autopilot",
    repo: gh("bull-bear-autopilot"),
    featured: true,
    categories: ["Agents"],
    summary:
      "Multi-agent system for Indian IPO analysis. Every fact is cited to a page, then checked by a deterministic fact-checker; results are delivered on Telegram. 568 tests.",
    stack: ["Multi-agent LLM", "Page-cited facts", "Deterministic fact-check", "Telegram bot"],
    aliases: ["bull", "bear", "bull/bear", "autopilot", "ipo", "telegram", "fact-check", "fact check", "finance", "stock"],
    caseStudy: {
      problem: "IPO research is only useful if every claim can be traced back to the source document.",
      method: "Multiple agents draft bull and bear cases, with each fact cited to a page and then verified by a deterministic fact-checker. Results are delivered on Telegram.",
      result: "568",
      resultLabel: "tests",
    },
  },
  {
    slug: "lungscan-ai",
    name: "LungScan AI",
    repo: gh("LungScan-AI-Chest-Xray-Detection"),
    live: "https://medrag.in",
    featured: true,
    categories: ["Computer Vision", "Deep Learning", "Web"],
    summary:
      "5-class chest X-ray classifier built on DenseNet121, with Grad-CAM heatmaps. 86–88% test accuracy. Full-stack app (FastAPI backend, React frontend, Supabase) deployed on GCP, live at medrag.in.",
    stack: ["DenseNet121", "Grad-CAM", "FastAPI", "React", "Supabase", "GCP"],
    aliases: ["lungscan", "lung scan", "lung", "medrag", "chest", "x-ray", "xray", "densenet", "densenet121", "grad-cam", "gradcam"],
    caseStudy: {
      problem: "Classify chest X-rays into 5 classes and show which regions drove each prediction.",
      method: "Fine-tuned DenseNet121 with Grad-CAM overlays, served from FastAPI with a React frontend and Supabase, deployed on GCP.",
      result: "86–88%",
      resultLabel: "test accuracy · 5 classes",
    },
  },
  {
    slug: "pneumoscan",
    name: "PneumoScan",
    repo: gh("Pneumonia-Xray-CNN-Detection"),
    live: "https://pneumonia-scan.streamlit.app/",
    featured: true,
    categories: ["Computer Vision", "Deep Learning"],
    summary:
      "Pneumonia detection from chest X-rays with MobileNetV2. 92.5% test accuracy. Live Streamlit app.",
    stack: ["MobileNetV2", "CNN", "Streamlit"],
    aliases: ["pneumoscan", "pneumo", "pneumonia", "mobilenet", "mobilenetv2", "chest", "x-ray", "xray"],
  },
  {
    slug: "ai-leetcode-agent",
    name: "AI LeetCode Agent",
    repo: gh("ai-leetcode-agent"),
    categories: ["Agents"],
    summary:
      "Agent that solves LeetCode problems using a 5-provider LLM fallback chain and 4 Playwright browser workers. 230+ accepted.",
    stack: ["LLM agents", "5-provider fallback", "Playwright"],
    aliases: ["leetcode", "leet code", "playwright", "fallback", "coding agent", "solver"],
    caseStudy: {
      problem: "Solve LeetCode problems end-to-end without stopping when one LLM provider fails or hits a rate limit.",
      method: "Falls back across 5 LLM providers, with 4 Playwright workers submitting solutions in the browser.",
      result: "230+",
      resultLabel: "accepted",
    },
  },
  {
    slug: "churnguard-pro",
    name: "ChurnGuard Pro",
    repo: gh("Customer-Churn-Prediction-Dashboard"),
    categories: ["Dashboards"],
    summary: "Customer churn prediction dashboard built in Streamlit, trained with Gradient Boosting on 7,043 customers.",
    stack: ["Gradient Boosting", "Streamlit"],
    aliases: ["churnguard", "churn", "customer", "telecom"],
  },
  {
    slug: "oncoinsight-pro",
    name: "OncoInsight Pro",
    repo: gh("OncoInsight-Pro-Cancer-Analytics"),
    categories: ["Dashboards"],
    summary:
      "Cancer analytics dashboard in Streamlit over 17,686 records, with statistical analysis plus Gradient Boosting regression and classification (GBR/GBC).",
    stack: ["Streamlit", "Statistics", "GBR", "GBC"],
    aliases: ["oncoinsight", "onco", "cancer", "oncology"],
  },
  {
    slug: "household-power-rnn",
    name: "Household Power RNN",
    repo: gh("Household-Power-Consumption-RNN"),
    categories: ["Deep Learning"],
    summary: "Recurrent neural network (RNN) on household power consumption data.",
    stack: ["RNN"],
    aliases: ["household", "power", "energy", "electricity", "rnn", "time series"],
  },
  {
    slug: "titanic-ann",
    name: "Titanic ANN",
    repo: gh("Titanic-Survival-Prediction-ANN"),
    categories: ["Deep Learning"],
    summary: "Artificial neural network (ANN) that predicts Titanic passenger survival.",
    stack: ["ANN"],
    aliases: ["titanic", "survival", "ann"],
  },
  {
    slug: "hierarchical-clustering",
    name: "Hierarchical Clustering",
    repo: gh("Hierarchical-Clustering-Height-Weight"),
    categories: ["Clustering"],
    summary: "Hierarchical clustering on a height–weight dataset.",
    stack: ["Hierarchical clustering"],
    aliases: ["hierarchical", "dendrogram", "height", "weight"],
  },
  {
    slug: "dbscan",
    name: "DBSCAN Clustering",
    repo: gh("DBSCAN-Height-Weight-Clustering"),
    categories: ["Clustering"],
    summary: "DBSCAN density-based clustering on a height–weight dataset.",
    stack: ["DBSCAN"],
    aliases: ["dbscan", "density", "height", "weight"],
  },
  {
    slug: "kmeans",
    name: "K-Means Clustering",
    repo: gh("KMeans-Height-Weight-Clustering"),
    categories: ["Clustering"],
    summary: "K-Means clustering on a height–weight dataset.",
    stack: ["K-Means"],
    aliases: ["kmeans", "k-means", "k means", "height", "weight"],
  },
  {
    slug: "video-game-sales-eda",
    name: "Video Game Sales EDA",
    repo: gh("EDA-Video-Games-Sales-Analysis"),
    categories: ["EDA"],
    summary: "Exploratory data analysis of video game sales.",
    stack: ["EDA"],
    aliases: ["video game", "games", "sales", "eda", "exploratory"],
  },
  {
    slug: "luxury-car-dealership",
    name: "Luxury Car Dealership",
    repo: gh("Luxury-Car-Dealership"),
    categories: ["Web"],
    summary: "Luxury car dealership web project.",
    stack: ["Web"],
    aliases: ["luxury", "car", "dealership", "website"],
  },
];

export const STARTER_QUESTIONS = [
  "What is VeraScan?",
  "Which projects are live?",
  "What stack for LungScan?",
  "Is he open to roles?",
];
