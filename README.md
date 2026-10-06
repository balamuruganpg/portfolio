# Balamurugan P G — AI/ML Engineer Portfolio

An engineering-first portfolio and interactive AI assistant built with Next.js, React, Tailwind CSS, Framer Motion, and grounded multi-provider LLM orchestration.

🌐 **Live Site**: [balamuruganpg.in](https://balamuruganpg.in)

---

## Highlights

- **Interactive AI Assistant**: Dual keyword & semantic retrieval over verified portfolio facts with deterministic hallucination guards and multi-provider failover (Groq `openai/gpt-oss-120b`, `qwen/qwen3.8-27b` & Gemini `gemini-3.8-flash`).
- **15 Repositories Cataloged**: Includes ongoing research project **RAI-Axiom** (zero-shot sim-to-real portfolio allocation with PPO) and 14 shipped ML/AI systems across Computer Vision, Deep Learning, Agents, Dashboards, and Unsupervised Clustering.
- **Evidence-Based Case Studies**: Verified metrics from repositories including PyPI packages, DenseNet121 Grad-CAM heatmaps, and multi-agent financial synthesis.
- **Command Palette & Hotkeys**: `Ctrl+K` navigation, interactive citation chips that jump & spotlight project cards, and filterable tech stacks.
- **Dark/Light Mode**: Automatic system theme detection with manual toggle.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Node.js runtime)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Testing**: [Playwright](https://playwright.dev/) for headless end-to-end browser verification
- **LLM Providers**: Groq API & Google Gemini API with fallback orchestration

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/balamuruganpg/portfolio.git
cd portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables (Optional)
To enable the online AI assistant locally, create a `.env.local` file:
```bash
cp .env.example .env.local
```
Add your API keys:
```env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
```
*(Note: If no API keys are provided, the assistant uses deterministic extractive answers directly from the site docs.)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production & Run E2E Tests
```bash
npm run build
npm start
# In a separate terminal:
npm run test:e2e
```

---

## License

MIT © [Balamurugan P G](https://balamuruganpg.in)
