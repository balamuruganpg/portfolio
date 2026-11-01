import {
  achievements,
  completedCredentials,
  inProgressCredentials,
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
  | "resume"
  | "achievements";

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
  projectSlug?: string;
  credential?: { status: "completed" | "in-progress"; credentialId?: string };
  provenance?: {
    sourceId: string;
    kind: string;
    revision: string;
    fetchedAt: string;
    url: string;
  };
  /** Approved project facts take precedence over supplemental snapshots. */
  authorityText?: string;
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
    : p.status === "research prototype"
      ? "Status: research prototype (no live demo). Source code on GitHub."
      : p.live
        ? "Status: live, deployed and usable online."
        : p.pypi
          ? "Status: published and installable from PyPI."
          : "Status: source code on GitHub (no live deployment listed).";
  const tagLine = p.tag ? `Tag: ${p.tag}.` : "";
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
      tagLine,
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
    id: "achievements",
    section: "achievements",
    title: "Achievements",
    text: achievements.map(a => `${a.title}: ${a.detail}.`).join(" ") + " The 330+ LeetCode DSA problems are Balamurugan's personal achievement, separate from the AI LeetCode Agent project's 230+ accepted submissions.",
    summary: achievements.map(a => `${a.title}: ${a.detail}`).join("; "),
    aliases: ["achievement", "achievements", "dsa", "personal leetcode", "problems solved", "330", "first rank"],
    href: "#achievements",
  });

  docs.push({
    id: "contact",
    section: "contact",
    title: "Contact",
    text: `Email: ${profile.email}. Phone: ${profile.phone}. GitHub: ${profile.github}. LinkedIn: ${profile.linkedin}. LeetCode: ${profile.leetcode}. Website: ${profile.site}. Resume PDF: ${profile.site}${profile.resume}.`,
    summary: `Email ${profile.email} · Phone ${profile.phone} · LinkedIn ${profile.linkedin} · GitHub ${profile.github} · LeetCode ${profile.leetcode}`,
    aliases: ["contact", "email", "phone", "linkedin", "github", "leetcode", "reach", "resume", "cv"],
    href: "#contact",
  });

  docs.push({
    id: "experience",
    section: "experience",
    title: "Internships",
    text: experience
      .map((e) => `${e.role} at ${e.org} (${e.mode}, ${e.period})${e.detail ? `: ${e.detail}` : ""}. ${e.outcomes.join(" ")}`)
      .join("\n"),
    summary: experience
      .map((e) => `${e.org}: ${e.role}${e.detail ? `, ${e.detail.toLowerCase()}` : ""} (${e.mode}, ${e.period}). ${e.outcomes.join(" ")}`)
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
    text: `${completedCredentials.length} unique completed credentials with original document proof: ${completedCredentials.filter(c => c.kind === "Certification").length} Oracle certifications (three Professional-level and one Associate-level), ${completedCredentials.filter(c => c.kind === "Professional certificate").length} Professional Certificates (IBM Data Science and the Google Cloud Generative AI Leader Coursera programme), plus course completions, guided projects, a programme completion and training. IBM's component courses have separate IDs and are labelled as parts of the same programme. Duplicate PDF copies are counted once. Highlighted credentials: ${completedCredentials.filter(c => c.featured).map(c => `${c.title} (${c.issuer}; ${c.kind})`).join("; ")}. Deep Learning Specialization by DeepLearning.AI / Andrew Ng is in progress, not completed, and excluded from the completed count. AI For Everyone is a separate completed course, not the Deep Learning Specialization. A Tableau certificate is not documented in the supplied folder; Tableau remains a listed skill. Exact credential IDs and proof links are in the individual credential source documents.`,
    summary: `${completedCredentials.length} unique completed credentials with document proof, including ${completedCredentials.filter(c => c.kind === "Certification").length} Oracle certifications and ${completedCredentials.filter(c => c.kind === "Professional certificate").length} Coursera Professional Certificates. Course completions and programme components are labelled separately. Deep Learning Specialization is in progress and excluded from this count.`,
    aliases: ["certification", "certifications", "certificate", "credentials", "credential", "certified", "oracle", "oci", "ibm", "nptel", "google", "andrew ng", "coursera", "tableau certificate", "tableau certification"],
    href: "#certs",
  });

  const credentialAliases: Record<string, string[]> = {
    "oci-data-science-2025": ["oracle data science", "oci data science"],
    "oci-generative-ai-2025": ["oracle generative ai", "oci generative ai"],
    "oci-ai-foundations-2025": ["oracle ai foundations", "oci ai foundations"],
    "oracle-ai-vector-search": ["oracle vector search", "oracle ai vector search"],
    "ibm-data-science": ["ibm data science"],
    "entrepreneurship-startup-mastery": ["iim mumbai certificate", "startup mastery"],
  };
  for (const c of completedCredentials) {
    const text = `${c.title}. Issuer: ${c.issuer}${c.platform ? `; platform: ${c.platform}` : ""}. Credential type: ${c.kind}. Status: completed. Date: ${c.dateLabel}.${c.expiresOn ? ` Valid until: ${c.expiresOn}.` : ""}${c.credentialId ? ` ${c.idLabel ?? "Credential ID"}: ${c.credentialId}.` : ""}${c.parentId ? " Component course of the IBM Data Science Professional Certificate; not a separate professional certification." : ""}${c.note ? ` ${c.note}` : ""} Original certificate: ${c.file}${c.verificationUrl ? ` Verification URL: ${c.verificationUrl}` : " No issuer verification URL was embedded; use the printed ID and original certificate."}`;
    docs.push({ id: `credential:${c.id}`, section: "certs", title: c.title, text, summary: text, aliases: [c.title.toLowerCase(), ...(credentialAliases[c.id] ?? []), ...(c.credentialId ? [c.credentialId.toLowerCase()] : [])], href: c.verificationUrl ?? c.file, credential: { status: "completed", credentialId: c.credentialId } });
  }
  for (const c of inProgressCredentials) {
    const text = `${c.title} by ${c.issuer}: in progress, not completed. ${c.note} Owner-confirmed current study; no completion certificate or verification ID is available. It is excluded from the ${completedCredentials.length} completed credential count.`;
    docs.push({ id: `learning:${c.id}`, section: "certs", title: `${c.title} · In progress`, text, summary: text, aliases: [c.title.toLowerCase(), "deep learning certificate", "andrew ng specialization"], href: `#learning-${c.id}`, credential: { status: "in-progress" } });
  }

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
