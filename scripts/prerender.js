// Runs after `vite build`: writes one HTML file per page and language with the
// right <title>, description, canonical, and link-preview tags, so Google and
// WhatsApp/Facebook see correct metadata without running JavaScript.
// Also generates sitemap.xml and robots.txt from the same page list.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { pages, pagePath, SITE_URL } from "../src/seo.js";
import { services, contact, faqs, projects, tools } from "../src/data.js";

const DIST = "dist";
const template = readFileSync(`${DIST}/index.html`, "utf8");

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function replaceAttr(html, pattern, value) {
  if (!pattern.test(html)) throw new Error(`prerender: pattern not found ${pattern}`);
  return html.replace(pattern, (_, before, after) => before + escape(value) + after);
}

for (const page of pages) {
  for (const lang of ["en", "ar"]) {
    const meta = page[lang];
    const url = SITE_URL + pagePath(page.path, lang);
    let html = template;

    html = html.replace(/<html lang="en" dir="ltr">/, `<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">`);
    html = html.replace(/<title>.*?<\/title>/s, `<title>${escape(meta.title)}</title>`);
    html = replaceAttr(html, /(<meta\s+name="description"\s+content=")[^"]*(")/s, meta.description);
    html = replaceAttr(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/s, meta.description);
    html = replaceAttr(html, /(<meta property="og:title" content=")[^"]*(")/, meta.title);
    html = replaceAttr(html, /(<meta property="og:url" content=")[^"]*(")/, url);
    html = replaceAttr(html, /(<meta property="og:locale" content=")[^"]*(")/, lang === "ar" ? "ar_LY" : "en_US");
    html = replaceAttr(html, /(<link rel="canonical" href=")[^"]*(")/, url);
    html = replaceAttr(html, /(<link rel="alternate" hreflang="en" href=")[^"]*(")/, SITE_URL + pagePath(page.path, "en"));
    html = replaceAttr(html, /(<link rel="alternate" hreflang="ar" href=")[^"]*(")/, SITE_URL + pagePath(page.path, "ar"));
    html = replaceAttr(html, /(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/, SITE_URL + pagePath(page.path, "en"));

    // "/" -> index.html, "/about" -> about.html, "/ar/about" -> ar/about.html
    const route = pagePath(page.path, lang);
    const file = route === "/" ? `${DIST}/index.html` : `${DIST}${route}.html`;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    console.log("prerender:", route.padEnd(16), "->", file);
  }
}

const today = new Date().toISOString().slice(0, 10);
const urls = pages.flatMap((page) =>
  ["en", "ar"].map(
    (lang) => `  <url>
    <loc>${SITE_URL}${pagePath(page.path, lang)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${pagePath(page.path, "en")}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}${pagePath(page.path, "ar")}"/>
  </url>`
  )
);

writeFileSync(
  `${DIST}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`
);

// robots.txt: everyone is welcome, AI search/assistant crawlers are named explicitly.
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot",
  "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended",
  "Bingbot", "CCBot", "Amazonbot", "Meta-ExternalAgent", "DuckAssistBot", "MistralAI-User",
];
writeFileSync(
  `${DIST}/robots.txt`,
  `User-agent: *
Allow: /

${AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}

Sitemap: ${SITE_URL}/sitemap.xml
`
);

// llms.txt (index) and llms-full.txt (all content) so AI agents can read the site as plain text.
const home = pages.find((p) => p.key === "home");
const phones = contact.phones.map((p) => p.display).join(", ");
const link = (page, lang) => `${SITE_URL}${pagePath(page.path, lang)}`;

const llms = `# Sudaf Engineering Consultancy

> ${home.en.description}

Bilingual site (English and Arabic). Misurata, Libya. Contact: ${contact.email}, ${phones}, WhatsApp ${contact.whatsapp}.
Full text of the site: ${SITE_URL}/llms-full.txt

## Pages (English)
${pages.map((p) => `- [${p.en.title}](${link(p, "en")}): ${p.en.description}`).join("\n")}

## Pages (Arabic)
${pages.map((p) => `- [${p.ar.title}](${link(p, "ar")}): ${p.ar.description}`).join("\n")}
`;
writeFileSync(`${DIST}/llms.txt`, llms);

const list = (a) => a.map((x) => `- ${x}`).join("\n");
const full = `# Sudaf Engineering Consultancy

> ${home.en.description}

Website: ${SITE_URL} (Arabic: ${SITE_URL}/ar)

## Contact
- Email: ${contact.email}
- Studies: ${contact.studiesEmail}
- Phone: ${phones}
- WhatsApp: ${contact.whatsapp}
- Map: ${contact.mapUrl}

## Services
${services.map((s) => `### ${s.title}\n${s.desc}\n${list(s.details || [])}`).join("\n\n")}

## Software
${tools.join(", ")}

## Projects
${projects
  .map(
    (p) => `### ${p.title}
${[p.city, p.year, p.client].filter(Boolean).join(" | ")}
${p.summary}
- Challenge: ${p.challenge}
${list(p.approach || [])}
- Outcome: ${p.outcome || ""}`
  )
  .join("\n\n")}

## FAQ
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
writeFileSync(`${DIST}/llms-full.txt`, full);

console.log("prerender: sitemap.xml, robots.txt, llms.txt, llms-full.txt written");
