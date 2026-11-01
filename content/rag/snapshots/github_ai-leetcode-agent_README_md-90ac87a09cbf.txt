<div align="center">

<img src="docs/hero_banner.jpg" alt="AI LeetCode Agent" width="100%">

# 🤖 AI LeetCode Agent

**A production-grade autonomous AI system that fetches LeetCode problems, generates optimized Python solutions using a 5-provider LLM fallback chain, verifies them locally, and submits them through parallel browser workers — all completely hands-free.**

The agent ran overnight and solved **230+ problems** across Easy, Medium, and Hard categories, making **453 total submissions** at an average pace of **~45 seconds per problem**. When one LLM provider hit its rate limit, the system silently switched to the next — zero human intervention required.

<p>
<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white"/>
<img src="https://img.shields.io/badge/Groq-FF6B35?style=for-the-badge&logoColor=white"/>
<img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"/>
<img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white"/>
<img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white"/>
<img src="https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=black"/>
</p>

<p>
<a href="https://github.com/balamuruganpg/ai-leetcode-agent/stargazers"><img src="https://img.shields.io/github/stars/balamuruganpg/ai-leetcode-agent?style=flat-square&color=f5c542&label=Stars" alt="Stars"/></a>
<a href="https://github.com/balamuruganpg/ai-leetcode-agent/network/members"><img src="https://img.shields.io/github/forks/balamuruganpg/ai-leetcode-agent?style=flat-square&color=5c9cf5&label=Forks" alt="Forks"/></a>
<a href="https://github.com/balamuruganpg/ai-leetcode-agent/blob/main/LICENSE"><img src="https://img.shields.io/github/license/balamuruganpg/ai-leetcode-agent?style=flat-square&color=8b5cf6" alt="License"/></a>
<img src="https://img.shields.io/badge/Solved-230%2B%20Problems-10b981?style=flat-square"/>
<a href="https://github.com/balamuruganpg/ai-leetcode-agent/actions/workflows/ci.yml"><img src="https://github.com/balamuruganpg/ai-leetcode-agent/actions/workflows/ci.yml/badge.svg" alt="CI"/></a>
</p>

[📊 Results](#-live-results) · [✨ Features](#-key-features) · [🏗️ Architecture](#%EF%B8%8F-system-architecture) · [🧠 How It Works](#-how-it-works) · [🚀 Quick Start](#-quick-start) · [📁 Structure](#-project-structure) · [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)

</div>

---

## 📊 Live Results

<div align="center">
<img src="docs/stats_dashboard.jpg" alt="230+ Problems Solved" width="75%">
</div>

The numbers speak for themselves. The agent was pointed at LeetCode's full problem catalog, given a pool of API keys, and left to run overnight. By morning, **230 problems** had been solved and accepted — spanning arrays, dynamic programming, graph traversal, binary search, backtracking, and more.

| 🏆 Metric | 📈 Value | Notes |
|:---|:---|:---|
| **Total Problems Solved** | **230+** | Across all difficulty levels |
| 🟢 Easy | 116 | ~50% of solved problems |
| 🟡 Medium | 107 | Including DP, graphs, trees |
| 🔴 Hard | 7 | Sliding window, advanced DP |
| 📤 Total Submissions | 453 | ~2 attempts average per problem |
| ⚡ Avg. Solve Time | ~45 seconds | Generate + verify + submit |
| 🔗 LLM Providers Used | 3 active | Groq → OpenRouter → Gemini |
| 🔥 Max Streak | 5 days | Continuous daily solving |
| 🏷️ Skills Covered | 15+ categories | Arrays, Hash Tables, DP, DFS, Math, Strings... |

<div align="center">
<img src="docs/leetcode_230_milestone.png" alt="LeetCode Profile — 230 Solved" width="75%">
<br>
<sub><b>↑ Actual LeetCode profile screenshot</b> — 230 problems solved, 453 submissions, 17 active days across the year</sub>
</div>

---

## ✨ Key Features

This isn't a simple script that pastes GPT output. It's a **full agentic system** with fault tolerance, parallelism, and intelligent orchestration.

<table>
<tr>
<td width="50%" valign="top">

### 🧠 Multi-LLM Intelligence
<img src="https://img.shields.io/badge/5_Providers-Fallback_Chain-blueviolet?style=for-the-badge"/>

The agent doesn't depend on a single AI provider. It chains **5 LLM providers** in priority order — Groq (fastest, free), OpenRouter, Google Gemini, OpenAI GPT-4o, and Ollama (fully local). When one provider hits a rate limit, quota cap, or returns an error, the system **automatically and silently** falls back to the next provider. During the 230-problem run, Groq's daily token limit was exhausted around problem #80 — the agent switched to OpenRouter mid-sentence and kept going. No crash, no restart, no human needed.

Each generated solution is also **locally verified** against the problem's test cases before submission. If the code fails locally, the agent retries with a different LLM rather than wasting a submission attempt.

</td>
<td width="50%" valign="top">

### ⚡ 4x Parallel Speed
<img src="https://img.shields.io/badge/4_Workers-Simultaneous-brightgreen?style=for-the-badge"/>

Instead of solving one problem at a time, the agent launches **4 independent Chrome browser instances**, each running on its own debug port (9222-9225). A central orchestrator dispatches problems from a shared queue. While Worker 0 is waiting for its submission verdict, Workers 1-3 are already generating and submitting their own solutions. The result is **~4x throughput** — 4 problems solved every 30-45 seconds instead of 1.

Each worker has its own browser profile, session cookies, and error handling. If one worker crashes or times out on a hard problem, the others keep running. The orchestrator marks the failed problem and moves on — no single failure blocks the pipeline.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🔐 Stealth & Reliability
<img src="https://img.shields.io/badge/Cloudflare-Aware-orange?style=for-the-badge"/>

LeetCode uses Cloudflare protection and bot detection. Traditional automation (filling login forms, clicking buttons with Selenium) gets blocked instantly. This agent takes a different approach: it **exports your real browser session cookies** and injects them directly into each Playwright Chrome instance via `context.add_cookies()`. No login form is ever touched. To LeetCode's servers, the agent looks like a regular authenticated user browsing the site.

The system also maintains persistent Chrome profiles so browser fingerprinting stays consistent across runs. A `status.json` file tracks every problem's state (pending, solved, failed), so you can stop the agent anytime and **resume exactly where you left off** — even days later.

</td>
<td width="50%" valign="top">

### 📱 Real-Time Monitoring
<img src="https://img.shields.io/badge/Telegram-Live_Alerts-26A5E4?style=for-the-badge&logo=telegram&logoColor=white"/>

Every submission generates a Telegram notification — including a **screenshot of the result page** showing "Accepted" or "Wrong Answer". You can be away from your computer (sleeping, in class, at work) and still see exactly what the agent is doing on your phone.

The Telegram bot also supports interactive commands:
- `/status` — see how many problems are solved right now
- `/run` — start a new solving session remotely
- `/stop` — gracefully stop all workers
- `/solved` — list every problem that's been accepted

All run data is also saved as structured JSON logs locally, so you have a complete audit trail of every attempt, every solution, and every result.

</td>
</tr>
</table>

---

## 🏗️ System Architecture

<div align="center">
<img src="docs/architecture_flow.jpg" alt="Architecture Diagram" width="85%">
</div>

The system is designed as a **producer-consumer pipeline**. The orchestrator (`parallel_run.py`) manages a shared problem queue and dispatches work to N parallel workers. Each worker runs the full agent loop independently — fetching the problem, generating code, verifying it, launching a browser, and submitting. Results flow back to the orchestrator, which updates the shared state and dispatches the next problem.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        parallel_run.py — Orchestrator                    │
│                                                                          │
│   Problem Queue: [two-sum, valid-parens, merge-sorted, climbing, ...]   │
│                                                                          │
│   Dispatches to 4 workers  ──→  Collects results  ──→  Updates state    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
            ┌────────────┬───────────┴───────────┬────────────┐
            ▼            ▼                       ▼            ▼
       Worker 0     Worker 1                Worker 2     Worker 3
       port 9222    port 9223               port 9224    port 9225
            │            │                       │            │
            └────────────┴───────────┬───────────┴────────────┘
                                     │
                       ┌─────────────▼─────────────┐
                       │    AI Code Generator       │
                       │    (LLM Fallback Chain)    │
                       │                            │
                       │  Priority 1: Groq          │
                       │  Priority 2: OpenRouter    │
                       │  Priority 3: Gemini        │
                       │  Priority 4: OpenAI        │
                       │  Priority 5: Ollama        │
                       └─────────────┬─────────────┘
                                     │
                       ┌─────────────▼─────────────┐
                       │    Local Verifier          │
                       │    Run test cases in-proc  │
                       │    FAIL → retry next LLM   │
                       └─────────────┬─────────────┘
                                     │ PASS
                       ┌─────────────▼─────────────┐
                       │    Playwright Browser      │
                       │    Inject session cookies   │
                       │    Navigate → Paste → Submit│
                       └──────┬──────────────┬─────┘
                              │              │
                    ┌─────────▼────┐   ┌─────▼──────────┐
                    │ status.json  │   │  Telegram Bot   │
                    │ State Track  │   │  Screenshot +   │
                    │ Resume Point │   │  Notification   │
                    └──────────────┘   └────────────────┘
```

<div align="center">
<img src="docs/demo_terminal_real.png" alt="Real Terminal — 4 Workers" width="85%">
<br>
<sub><b>↑ Real terminal output</b> from an actual run — 4 workers solving 7 problems, 6 accepted, 1 minute 17 seconds total</sub>
</div>

---

## 🧠 How It Works

### The Agent Pipeline

Every single problem goes through this fully automated 7-step pipeline. No human touches anything — the agent handles the entire workflow from problem discovery to Telegram notification:

```
  📋 Step 1: Fetch problem description, constraints, and test cases from LeetCode
       │
       ▼
  🧠 Step 2: Send structured prompt to the LLM fallback chain
       │       Prompt includes: problem text, constraints, examples, edge cases
       │       Provider: tries Groq first, falls back through chain if needed
       │
       ▼
  🔍 Step 3: Parse the LLM response, extract the Python solution code
       │       Handles markdown code blocks, class wrappers, import statements
       │
       ▼
  🧪 Step 4: Verify solution locally against provided test cases
       │       Runs the code in a sandboxed subprocess with timeout
       │       ✗ FAIL → go back to Step 2 with a different LLM or retry prompt
       │       ✓ PASS ↓
       │
       ▼
  🌐 Step 5: Launch Playwright Chrome → inject session cookies → navigate to problem
       │       Uses persistent browser profile to maintain consistent fingerprint
       │       Cookie injection = instant auth, no login form, no CAPTCHA
       │
       ▼
  📝 Step 6: Paste code into Monaco editor via JavaScript API → click Submit
       │       Waits for verdict: Accepted / Wrong Answer / TLE / Runtime Error
       │       Takes a screenshot of the result page
       │
       ▼
  📱 Step 7: Send screenshot + result to Telegram → update status.json → next problem
```

### The Fallback Chain in Action

This is the core innovation that makes the agent resilient. Instead of failing when an API goes down, the system **gracefully degrades** through a priority-ordered chain:

```python
# The agent tries each provider in order — if one fails, the next picks up
fallback_chain = [
    GroqProvider("llama-3.1-8b-instant"),      # ⚡ ~1s response, generous free tier
    OpenRouterProvider("gemini-2.5-flash"),     # 🔄 High quality, pay-per-use  
    GeminiProvider("gemini-2.5-flash"),         # 🟣 Google's direct API
    OpenAIProvider("gpt-4o"),                   # 🧠 Highest quality fallback
    OllamaProvider("qwen2.5-coder:32b"),       # 🏠 Fully local — works offline
]
```

**What actually happened during the 230-problem run:**
- Problems 1-80: Groq handled everything (free, fast, ~1 second per response)
- Problem 81: Groq returned `429 Rate Limited` → agent switched to OpenRouter instantly
- Problems 81-160: OpenRouter (Gemini Flash) handled the workload
- Problem 161: OpenRouter credits depleted → switched to Gemini direct API
- Problems 161-230: Google Gemini carried the rest to the finish line
- Total provider switches: 2. Total human interventions: **0**.

### Parallel Execution Deep Dive

The orchestrator uses Python's `multiprocessing` to spawn 4 completely independent worker processes. Each worker runs its own async event loop with its own Playwright browser instance. The problem queue is managed centrally, and workers pull from it atomically:

```
Time →   0s          15s          30s          45s          60s
Worker 0: ████ two-sum ✓ ██████  ████ climbing-stairs ✓ ████████
Worker 1:    ████ valid-parens ✓ ████    ████ merge-sorted ✓ ████
Worker 2: ████ palindrome ✓ ██████████████  ████ reverse-ll ✓ ██
Worker 3:    ████ search-insert ✓ ████ ████ remove-dups ✓ ██████
──────────────────────────────────────────────────────────────────
Throughput: 4 problems / ~30 seconds  =  ~8 problems per minute
            vs. sequential: ~1.3 problems per minute → 4x speedup
```

Each worker is fault-isolated. If Worker 2 hits a timeout on a hard DP problem, Workers 0, 1, and 3 continue solving without interruption. The timed-out problem is marked as "unknown" in the results and can be retried later.

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Why | How to Get It |
|:---|:---|:---|
| **Python 3.11+** | Async features, type hints | [python.org/downloads](https://python.org/downloads) |
| **Google Chrome** | Playwright uses it for automation | [google.com/chrome](https://google.com/chrome) |
| **LeetCode Account** | Session cookies needed for auth | [leetcode.com](https://leetcode.com) |
| **Groq API Key** | Free LLM provider (recommended) | [console.groq.com](https://console.groq.com) — 30 seconds |

### Installation

```bash
# Clone the repository
git clone https://github.com/balamuruganpg/ai-leetcode-agent.git
cd ai-leetcode-agent

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

# Install the package and browser engine
pip install -e .
playwright install chromium

# Set up your configuration
cp .env.example .env
```

<details>
<summary><b>📋 Full .env Configuration Reference</b> (click to expand)</summary>

```env
# ═══════════════════════════════════════════════════════════════
# LLM PROVIDERS — at least one is required
# The agent will use these in order as a fallback chain
# ═══════════════════════════════════════════════════════════════
LLM_PROVIDER=groq                              # Primary provider
GROQ_API_KEY=[REDACTED_CREDENTIAL]          # Free at console.groq.com

# Optional additional providers (add for more resilience)
OPENROUTER_API_KEY=[REDACTED_CREDENTIAL]          # Pay-per-use
GEMINI_API_KEY=[REDACTED_CREDENTIAL]           # Google AI Studio
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx         # OpenAI platform

# ═══════════════════════════════════════════════════════════════
# TELEGRAM — optional but highly recommended
# Get notified on your phone with screenshots of every result
# ═══════════════════════════════════════════════════════════════
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321

# ═══════════════════════════════════════════════════════════════
# WORKER CONFIG — tune for your machine
# ═══════════════════════════════════════════════════════════════
MAX_WORKERS=4                                   # Parallel Chrome instances
PROBLEM_TIMEOUT=180                             # Seconds per problem
```

</details>

### Export Your LeetCode Session

Log into LeetCode in Chrome normally, then run the export script. It copies your session cookies to a local file that the agent uses for authentication — **no passwords are stored**, and the cookie file is gitignored.

```bash
python scripts/export_session.py
# → Saved to results/session_cookies.json (gitignored, stays local)
```

### Run the Agent

```bash
# 🚀 Solve all remaining problems with 4 parallel workers (the main mode)
python parallel_run.py --remaining --workers 4

# 🎯 Solve a single specific problem by its slug
python run_workflow.py two-sum

# ⏱️ Custom timeout per problem (default: 180 seconds)
python parallel_run.py --remaining --workers 4 --timeout 120

# 📱 Start the Telegram bot for remote monitoring and control
python telegram_bot.py
```

**Telegram bot commands:** `/status` — current progress · `/run` — start solving · `/stop` — stop all workers · `/solved` — list accepted problems

---

## 📁 Project Structure

```
ai-leetcode-agent/
│
├── 🚀 parallel_run.py               ← Main entrypoint: spawns N workers, manages queue
├── 🎯 run_workflow.py               ← Single-problem CLI for testing individual slugs
├── 📱 telegram_bot.py               ← Interactive Telegram bot with /status /run /stop
├── 📡 telegram_notifier.py          ← Standalone notification sender module
│
├── 📦 src/ai_coding_mentor/          ← Core package
│   ├── engine.py                     ← The agent loop: fetch → generate → verify → submit
│   ├── config.py                     ← Pydantic settings — reads .env, validates types
│   │
│   ├── llm/                          ← LLM provider adapters
│   │   ├── fallback.py               ← Orchestrates the multi-provider fallback chain
│   │   ├── groq.py                   ← Groq API (Llama 3.1, fast inference)
│   │   ├── gemini.py                 ← Google Gemini API adapter
│   │   ├── openai_provider.py        ← OpenAI GPT-4o adapter
│   │   ├── openrouter.py             ← OpenRouter multi-model gateway
│   │   └── ollama.py                 ← Local Ollama server adapter
│   │
│   ├── browser/
│   │   └── leetcode_browser.py       ← Playwright: launch Chrome, inject cookies, submit
│   │
│   ├── scrapers/
│   │   └── leetcode.py               ← Fetches problem title, description, test cases
│   │
│   └── verification/
│       └── verifier.py               ← Runs generated code against test cases locally
│
├── 🔧 scripts/                       ← Helper utilities (session export, screenshot tools)
├── 🧪 tests/                         ← pytest test suite
├── 📸 docs/                          ← Screenshots, diagrams, and visual assets
├── ⚙️ .github/workflows/ci.yml       ← GitHub Actions CI (Python 3.11 + 3.12)
├── 📄 .env.example                   ← Template config — copy to .env and fill in keys
├── 📄 .gitignore                     ← Protects .env, cookies, logs, screenshots
└── 📄 pyproject.toml                 ← Package metadata and dependencies
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why This Choice |
|:---|:---|:---|
| **Language** | Python 3.11+ | Native async/await, rich ecosystem, LLM SDK support |
| **Browser** | Playwright (async) | More reliable than Selenium, built-in waits, Chromium support |
| **LLM Providers** | Groq · OpenRouter · Gemini · OpenAI · Ollama | Redundancy — if one goes down, the chain continues |
| **HTTP Client** | httpx | Async-native, connection pooling, timeout control |
| **Concurrency** | asyncio + multiprocessing | Workers need process isolation (separate Chrome instances) |
| **Config** | pydantic-settings | Type-safe .env parsing with validation |
| **Notifications** | Telegram Bot API | Free, instant, supports photos (submission screenshots) |
| **Testing** | pytest | Industry standard, good async support |
| **CI/CD** | GitHub Actions | Runs on every push — Python 3.11 + 3.12 matrix |

---

## 🤝 Contributing

This project is open source and contributions are welcome. Whether you want to add a new LLM provider, support another coding platform, or improve the verification logic — PRs are appreciated.

**Some ideas for contributors:**

- [ ] 🌐 Add support for Codeforces, HackerRank, and CodeChef
- [ ] 💻 Generate solutions in Java, C++, Go, and Rust (not just Python)
- [ ] 📊 Build a real-time web dashboard showing solve progress
- [ ] 🎯 Implement smart problem selection — pick by topic, difficulty, or weakness areas
- [ ] 🏆 Contest mode — solve timed competition problems under a clock
- [ ] 🔍 Solution quality scoring — compare against editorial solutions for optimality
- [ ] 📝 Automatic editorial generation — explain the approach, not just the code

Please open an issue first to discuss your idea before submitting a pull request.

---

## ⚠️ Educational Disclaimer

> **This project was built strictly for educational and research purposes.** It demonstrates advanced software engineering concepts including:
>
> - 🔄 **Multi-provider LLM orchestration** — building resilient AI systems that gracefully degrade across API failures
> - 🤖 **Autonomous agentic workflows** — designing task pipelines where AI agents make decisions independently
> - 🌐 **Production-grade browser automation** — using Playwright for reliable, Cloudflare-aware web interaction
> - ⚡ **Concurrent system design** — combining asyncio and multiprocessing for real-world parallelism
> - 📡 **Real-time notification systems** — integrating Telegram for live monitoring of background processes
>
> LeetCode's Terms of Service prohibit automated submissions. This project is shared **solely to demonstrate the engineering architecture** behind it — not as a tool for gaining unfair advantage. The author does not endorse or encourage ToS violations of any platform.

---

<div align="center">

### 📄 License

[MIT](LICENSE) © 2026 [Balamurugan P G](https://github.com/balamuruganpg)

---

**If this project impressed you, please give it a ⭐**

<a href="https://github.com/balamuruganpg/ai-leetcode-agent/stargazers">
<img src="https://img.shields.io/github/stars/balamuruganpg/ai-leetcode-agent?style=for-the-badge&logo=github&color=f5c542&label=Star%20This%20Repo" alt="Star"/>
</a>

**Built by [Balamurugan P G](https://github.com/balamuruganpg)** — AI/ML Engineer

<a href="https://github.com/balamuruganpg"><img src="https://img.shields.io/badge/GitHub-balamuruganpg-181717?style=for-the-badge&logo=github" alt="GitHub"/></a>
&nbsp;
<a href="https://leetcode.com/u/balamurugan_pg"><img src="https://img.shields.io/badge/LeetCode-balamurugan__pg-FFA116?style=for-the-badge&logo=leetcode&logoColor=black" alt="LeetCode"/></a>
&nbsp;
<a href="https://mail.google.com/mail/?view=cm&to=balamuruganpg@outlook.com"><img src="https://img.shields.io/badge/Email-balamuruganpg%40outlook.com-0078D4?style=for-the-badge&logo=microsoft-outlook&logoColor=white" alt="Email"/></a>

<sub>Built with ❤️, mass concurrency, and an unreasonable number of API rate limit errors.</sub>

</div>
