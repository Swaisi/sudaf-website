// Page metadata shared by the app (runtime) and scripts/prerender.js (build time).

export const SITE_URL = "https://www.sudaf.ly";

export const pages = [
  {
    key: "home",
    path: "",
    en: {
      title: "Sudaf Engineering Consultancy | Transport & Infrastructure – Libya",
      description:
        "Sudaf Engineering Consultancy, Misurata, Libya – transport planning, traffic engineering, roads, ports, railways, airports, GIS, tender documentation and project planning.",
    },
    ar: {
      title: "سدف للاستشارات الهندسية | النقل والبنية التحتية – ليبيا",
      description:
        "شركة سدف للاستشارات الهندسية، مصراتة، ليبيا – تخطيط النقل، هندسة المرور، الطرق، الموانئ، السكك الحديدية، المطارات، أنظمة GIS، إعداد مستندات الطرح وتخطيط المشاريع.",
    },
  },
  {
    key: "about",
    path: "about",
    en: {
      title: "About Us | Sudaf Engineering Consultancy",
      description:
        "Sudaf is a multidisciplinary engineering consultancy in Libya specializing in transportation, infrastructure, traffic analysis, GIS, QA/QC, HSE and project planning.",
    },
    ar: {
      title: "من نحن | سدف للاستشارات الهندسية",
      description:
        "سدف شركة استشارات هندسية متعددة التخصصات في ليبيا، متخصصة في النقل والبنية التحتية والتحليل المروري وأنظمة GIS وضبط الجودة والسلامة وتخطيط المشاريع.",
    },
  },
  {
    key: "services",
    path: "services",
    en: {
      title: "Engineering Services | Sudaf Engineering Consultancy",
      description:
        "Transport planning, traffic impact studies, traffic simulation (VISSIM, SIDRA, SUMO), roads, ports, railways, airports, GIS, structural design, tender documents and training.",
    },
    ar: {
      title: "الخدمات الهندسية | سدف للاستشارات الهندسية",
      description:
        "تخطيط النقل، دراسات الأثر المروري، المحاكاة المرورية (VISSIM وSIDRA وSUMO)، الطرق، الموانئ، السكك الحديدية، المطارات، GIS، التصميم الإنشائي، مستندات الطرح والتدريب.",
    },
  },
  {
    key: "projects",
    path: "projects",
    en: {
      title: "Projects | Sudaf Engineering Consultancy",
      description:
        "Case studies by the Sudaf engineering team: Coastal Road × Heavy Transport Road interchange alternatives, Road 8–18 grade-separated junction, GIS-based infrastructure for Al-Sukairat, and a port and steel-plant traffic impact assessment in Misurata.",
    },
    ar: {
      title: "المشاريع | سدف للاستشارات الهندسية",
      description:
        "دراسات حالة من أعمال فريق سدف الهندسي: بدائل جسر تقاطع الطريق الساحلي مع طريق النقل الثقيل، وجسر تقاطع الطريق 8-18، والبنية التحتية لمنطقة السكيرات بنظم GIS، ودراسة الأثر المروري لمصنع الحديد والميناء في مصراتة.",
    },
  },
  {
    key: "tools",
    path: "tools",
    en: {
      title: "Engineering Tools – Roundabouts, Ramps & Traffic Growth | Sudaf Engineering",
      description:
        "Free engineering tools: Kimber/DMRB roundabout capacity with QA/QC checklist, NCHRP 672 fastest paths with HCM LOS, AASHTO ramp radius and speed-change lane lengths, and CAGR traffic growth vs capacity.",
    },
    ar: {
      title: "أدوات هندسية – جزر الدوران والمنحدرات ونمو المرور | سدف للاستشارات الهندسية",
      description:
        "أدوات مجانية لتصميم جزر الدوران: سعة المدخل وفق نموذج Kimber مع قائمة فحص جودة حسب DMRB CD 116، وسرعات المسار الأسرع وفق FHWA / NCHRP 672 مع السعة والتأخير ومستوى الخدمة حسب HCM.",
    },
  },
  {
    key: "contact",
    path: "contact",
    en: {
      title: "Contact Us | Sudaf Engineering Consultancy",
      description:
        "Contact Sudaf Engineering Consultancy – Tripoli Street, Misurata, Libya. Phone +218 91 405 4929, email info@sudaf.ly.",
    },
    ar: {
      title: "اتصل بنا | سدف للاستشارات الهندسية",
      description:
        "تواصل مع شركة سدف للاستشارات الهندسية – شارع طرابلس، مصراتة، ليبيا. هاتف ‎+218 91 405 4929، بريد info@sudaf.ly.",
    },
  },
];

// "/about" + "ar" -> "/ar/about"; "" + "en" -> "/"
export function pagePath(path, lang) {
  const parts = [lang === "ar" ? "ar" : "", path].filter(Boolean);
  return "/" + parts.join("/");
}
