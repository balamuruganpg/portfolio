import {
  certifications,
  education,
  experience,
  profile,
  projects,
  skills,
  type Project,
} from "@/data/site";

export type Section =
  | "project"
  | "profile"
  | "contact"
  | "experience"
  | "education"
  | "certs"
  | "skills"
  | "resume";

export interface Doc {
  id: string;
  section: Section;
  title: string;
  /** Full grounding text sent to the model. */
  text: string;
  /** Short line used for the offline (no-model) answer. */
  summary: string;
  /** Lower-case alias phrases; a phrase hit is a strong signal. */
  aliases: string[];
  /** Where the citation chip links to. */
  href: string;
  project?: Project;
}

function projectDoc(p: Project): Doc {
  const links = [
    `GitHub: ${p.repo}`,
    p.live ? `Live app: ${p.live}` : "",
    p.pypi ? `PyPI: ${p.pypi}` : "",
  ].filter(Boolean);
  const cs = p.caseStudy
    ? `Problem: ${p.caseStudy.problem} Method: ${p.caseStudy.method} Result: ${p.caseStudy.result} (${p.caseStudy.resultLabel}).`
    : "";
  const availability = p.status === "Ongoing"
    ? "Status: ongoing research project (not shipped, no live demo). Source code on GitHub."
    : p.live
      ? "Status: live, deployed and usable online."
      : p.pypi
        ? "Status: published and installable from PyPI."
        : "Status: source code on GitHub (no live deployment listed).";
  const authorLine = p.authors ? `Authors: ${p.authors}.` : "";
  const orgLine = p.org ? `Organization: ${p.org}.` : "";
  return {
    id: `project:${p.slug}`,
    section: "project",
    title: p.name,
    text: [
      `Project: ${p.name}${p.featured ? " (featured)" : ""}.`,
      authorLine,
      orgLine,
      p.summary,
      cs,
      `Stack: ${p.stack.join(", ")}.`,
      p.categories.length ? `Categories: ${p.categories.join(", ")}.` : "",
      availability,
      links.join(" | "),
    ]
      .filter(Boolean)
      .join("\n"),
    summary: `${p.summary}${p.authors ? ` (${p.authors})` : ""} Repo: ${p.repo}${p.live ? ` Live: ${p.live}` : ""}${p.pypi ? ` PyPI: ${p.pypi}` : ""}`,
    aliases: [p.name.toLowerCase(), ...p.aliases],
    href: `#p-${p.slug}`,
    project: p,
  };
}

export function buildSiteDocs(): Doc[] {
  const docs: Doc[] = projects.map(projectDoc);

  docs.push({
    id: "profile",
    section: "profile",
    title: "Profile & availability",
    text: `${profile.name} is an ${profile.role} based in ${profile.location}. ${profile.availability}. Studying B.E. CSE at Nehru Institute of Technology (2023–2027). Has ${projects.length} public repositories on GitHub.`,
    summary: `${profile.name}, ${profile.role}, ${profile.location}. ${profile.availability}.`,
    aliases: ["balamurugan", "bpg", "who is", "about him", "open to", "available", "hire", "hiring"],
    href: "#top",
  });

  docs.push({
    id: "contact",
    section: "contact",
    title: "Contact",
    text: `Email: ${profile.email}. Phone: ${profile.phone}. GitHub: ${profile.github}. LinkedIn: ${profile.linkedin}. LeetCode: ${profile.leetcode}. Website: ${profile.site}. Resume PDF: ${profile.site}${profile.resume}.`,
    summary: `Email ${profile.email} · Phone ${profile.phone} · LinkedIn ${profile.linkedin} · GitHub ${profile.github}`,
    aliases: ["contact", "email", "phone", "linkedin", "github", "leetcode", "reach", "resume", "cv"],
    href: "#contact",
  });

  docs.push({
    id: "experience",
    section: "experience",
    title: "Internships",
    text: experience
      .map((e) => `${e.role} at ${e.org} (${e.mode}, ${e.period})${e.detail ? `: ${e.detail}` : ""}.`)
      .join("\n"),
    summary: experience
      .map((e) => `${e.org}: ${e.role}${e.detail ? `, ${e.detail.toLowerCase()}` : ""} (${e.mode}, ${e.period})`)
      .join("; "),
    aliases: ["internship", "internships", "neo zeno", "yuva", "automotive", "experience", "work experience"],
    href: "#experience",
  });

  docs.push({
    id: "education",
    section: "education",
    title: "Education",
    text: education
      .map((e) => `${e.degree}, ${e.school}${e.period ? `, ${e.period}` : ""}. ${e.detail}.`)
      .join("\n"),
    summary: education.map((e) => `${e.degree}, ${e.school}: ${e.detail}`).join("; "),
    aliases: ["education", "college", "degree", "cgpa", "gpa", "anna university", "nehru", "school", "12th", "rank", "first in"],
    href: "#experience",
  });

  docs.push({
    id: "certs",
    section: "certs",
    title: "Certifications",
    text: `Certifications (${certifications.length}): ${certifications.join("; ")}.`,
    summary: certifications.join(" · "),
    aliases: ["certification", "certifications", "certificate", "certified", "oracle", "oci", "ibm", "nptel", "google", "andrew ng", "coursera"],
    href: "#certs",
  });

  docs.push({
    id: "skills",
    section: "skills",
    title: "Skills",
    text: skills.map((s) => `${s.group}: ${s.items.join(", ")}.`).join("\n"),
    summary: skills.map((s) => `${s.group}: ${s.items.join(", ")}`).join(" | "),
    aliases: ["skills", "skill", "tech stack", "technologies", "languages", "tools"],
    href: "#skills",
  });

  return docs;
}

/** Split resume markdown on headings into sections. HTML comments are dropped. */
export function buildResumeDocs(markdown: string): Doc[] {
  const clean = markdown.replace(/<!--[\s\S]*?-->/g, "").trim();
  if (!clean) return [];
  const docs: Doc[] = [];
  let title = "Resume";
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join("\n").trim();
    if (text) {
      docs.push({
        id: `resume:${docs.length}`,
        section: "resume",
        title: `Resume: ${title}`,
        text,
        summary: text.replace(/\s+/g, " ").slice(0, 280),
        aliases: [title.toLowerCase()],
        href: "#top",
      });
    }
    buf = [];
  };
  for (const line of clean.split(/\r?\n/)) {
    const m = line.match(/^#{1,6}\s+(.*)$/);
    if (m) {
      flush();
      title = m[1].trim();
    } else {
      buf.push(line);
    }
  }
  flush();
  return docs;
}
