import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { profile } from "@/data/site";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: `${profile.name}: ${profile.role}`,
  description: `${profile.name}, ${profile.role} in ${profile.location}. VeraScan (PyPI), Bull/Bear Autopilot, LungScan AI, PneumoScan. Ask the grounded portfolio assistant.`,
  openGraph: {
    title: `${profile.name}: ${profile.role}`,
    description: profile.hero,
    url: profile.site,
    type: "website",
  },
  alternates: { canonical: profile.site },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#070807" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: profile.site,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Coimbatore", addressRegion: "Tamil Nadu", addressCountry: "IN" },
  sameAs: [profile.github, profile.linkedin, profile.leetcode],
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    var isDark = t === 'dark' || ((!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
