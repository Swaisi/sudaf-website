// Runs after `vite build`: writes one HTML file per page and language with the
// right <title>, description, canonical, and link-preview tags, so Google and
// WhatsApp/Facebook see correct metadata without running JavaScript.
// Also generates sitemap.xml and robots.txt from the same page list.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { pages, pagePath, SITE_URL } from "../src/seo.js";

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

writeFileSync(
  `${DIST}/robots.txt`,
  `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
);

console.log("prerender: sitemap.xml and robots.txt written");
