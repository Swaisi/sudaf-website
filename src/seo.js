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
        "Selected transport, infrastructure, and engineering study projects by Sudaf Engineering Consultancy.",
    },
    ar: {
      title: "المشاريع | سدف للاستشارات الهندسية",
      description:
        "نماذج من مشاريع شركة سدف للاستشارات الهندسية في مجالات النقل والبنية التحتية والدراسات الهندسية.",
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
