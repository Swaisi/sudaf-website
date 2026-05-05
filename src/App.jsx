import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const images = {
  hero: "/images/hero.jpg",
  transport: "/images/transport.jpg",
  traffic: "/images/traffic.jpg",
  roads: "/images/road.jpg",
  ports: "/images/port.jpg",
  rail: "/images/railway.jpg",
  airports: "/images/airport.jpg",
  public: "/images/bus.jpg",
  environment: "/images/environment.jpg",
};

const services = [
  {
    id: "transport",
    image: images.transport,
    en: "Transportation Engineering & Planning",
    ar: "هندسة وتخطيط النقل",
    enDesc:
      "Strategic transport planning, mobility policies, demand forecasting, and multimodal network studies.",
    arDesc:
      "تخطيط النقل الاستراتيجي، سياسات التنقل، التنبؤ بالطلب، ودراسات شبكات النقل متعددة الوسائط.",
  },
  {
    id: "traffic",
    image: images.traffic,
    en: "Traffic Engineering & Impact Studies",
    ar: "هندسة المرور ودراسات الأثر المروري",
    enDesc:
      "Traffic impact assessments, traffic surveys, intersection analysis, capacity studies, and traffic operations.",
    arDesc:
      "دراسات الأثر المروري، العدّ المروري، تحليل التقاطعات، تقييم السعة، وتحليل التشغيل المروري.",
  },
  {
    id: "roads",
    image: images.roads,
    en: "Roads, Highways & International Corridors",
    ar: "الطرق والطرق السريعة والممرات الدولية",
    enDesc:
      "Road network planning, highway studies, geometric design review, and international corridor assessment.",
    arDesc:
      "تخطيط شبكات الطرق، دراسات الطرق السريعة، مراجعة التصميم الهندسي، وتقييم الممرات الدولية.",
  },
  {
    id: "ports",
    image: images.ports,
    en: "Ports & Maritime Transport",
    ar: "الموانئ والنقل البحري",
    enDesc:
      "Port access planning, freight movement, logistics interface, and maritime transport connectivity.",
    arDesc:
      "تخطيط مداخل الموانئ، حركة البضائع، الربط اللوجستي، ودراسات الاتصال البحري.",
  },
  {
    id: "rail",
    image: images.rail,
    en: "Railway Planning",
    ar: "تخطيط السكك الحديدية",
    enDesc:
      "Rail corridor planning, station access, freight/passenger rail studies, and intermodal integration.",
    arDesc:
      "تخطيط مسارات السكك الحديدية، الوصول للمحطات، نقل الركاب والبضائع، والتكامل متعدد الوسائط.",
  },
  {
    id: "airports",
    image: images.airports,
    en: "Airport & Airside Infrastructure",
    ar: "المطارات والبنية التحتية الجوية",
    enDesc:
      "Airport access, landside and airside circulation, aprons, taxiways, and operational studies.",
    arDesc:
      "دراسات الوصول للمطارات، الحركة البرية والجوية، الساحات، ممرات الطائرات، والدراسات التشغيلية.",
  },
  {
    id: "public",
    image: images.public,
    en: "Public Transport Planning",
    ar: "تخطيط النقل العام",
    enDesc:
      "Bus networks, route planning, accessibility, service coverage, and urban mobility integration.",
    arDesc:
      "شبكات الحافلات، تخطيط المسارات، إمكانية الوصول، تغطية الخدمة، والتكامل مع التنقل الحضري.",
  },
  {
    id: "environment",
    image: images.environment,
    en: "Noise, Emissions & Transport Pollution",
    ar: "الضجيج والانبعاثات والتلوث المروري",
    enDesc:
      "Transport noise, emissions, air quality impacts, pollution assessment, and mitigation measures.",
    arDesc:
      "دراسات الضجيج، الانبعاثات، أثر جودة الهواء، تقييم التلوث، وإجراءات التخفيف.",
  },
];

export default function App() {
  const [lang, setLang] = useState("en");
  const ar = lang === "ar";

  return (
    <BrowserRouter>
      <div dir={ar ? "rtl" : "ltr"} style={styles.page}>
        <Header ar={ar} lang={lang} setLang={setLang} />

        <Routes>
          <Route path="/" element={<Home ar={ar} />} />
          <Route path="/services" element={<Services ar={ar} />} />
          <Route path="/services/:id" element={<ServiceDetail ar={ar} />} />
          <Route path="/projects" element={<Projects ar={ar} />} />
          <Route path="/contact" element={<Contact ar={ar} />} />
        </Routes>

        <Footer ar={ar} />
      </div>
    </BrowserRouter>
  );
}

function Header({ ar, lang, setLang }) {
  return (
    <header style={styles.header}>
      <Link to="/" style={styles.brand}>
        <img src="/logo.svg" alt="Sudaf Logo" style={styles.logoSmall} />
        <span>{ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering"}</span>
      </Link>

      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>{ar ? "الرئيسية" : "Home"}</Link>
        <Link to="/services" style={styles.navLink}>{ar ? "الخدمات" : "Services"}</Link>
        <Link to="/projects" style={styles.navLink}>{ar ? "الخبرات" : "Projects"}</Link>
        <Link to="/contact" style={styles.navLink}>{ar ? "اتصل بنا" : "Contact"}</Link>

        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          style={styles.langButton}
        >
          {lang === "en" ? "العربية" : "English"}
        </button>
      </nav>
    </header>
  );
}

function Home({ ar }) {
  return (
    <>
      <section
        style={{
          ...styles.hero,
          backgroundImage: `linear-gradient(rgba(17,24,39,.72), rgba(17,24,39,.92)), url(${images.hero})`,
        }}
      >
        <img src="/logo.svg" alt="Sudaf Logo" style={styles.logoHero} />

        <h1 style={styles.heroTitle}>
          {ar ? "شركة سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}
        </h1>

        <p style={styles.heroText}>
          {ar
            ? "استشارات هندسية متخصصة في تخطيط النقل، الدراسات المرورية، الطرق، الموانئ، المطارات، السكك الحديدية، النقل العام، والدراسات البيئية المرتبطة بالنقل."
            : "Specialized engineering consultancy in transport planning, traffic studies, roads, ports, airports, railways, public transport, logistics, and transport-related environmental studies."}
        </p>

        <div style={styles.heroButtons}>
          <Link to="/services">
            <button style={styles.primaryButton}>
              {ar ? "استعراض الخدمات" : "Explore Services"}
            </button>
          </Link>

          <Link to="/contact">
            <button style={styles.outlineButton}>
              {ar ? "اتصل بنا" : "Contact Us"}
            </button>
          </Link>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.title}>{ar ? "عن الشركة" : "About Sudaf"}</h2>
        <p style={styles.text}>
          {ar
            ? "سدف للاستشارات الهندسية شركة ليبية متخصصة في الدراسات الهندسية والتحليل الفني والتخطيط الاستراتيجي لمشاريع النقل والبنية التحتية، مع تركيز خاص على النقل متعدد الوسائط وهندسة المرور."
            : "Sudaf Engineering Consultancy is a Libya-based engineering consultancy focused on technical studies, data-driven analysis, and strategic planning for transport and infrastructure projects, with strong emphasis on multimodal transport and traffic engineering."}
        </p>
      </section>

      <Services ar={ar} compact />

      <section style={styles.sectionAlt}>
        <h2 style={styles.title}>
          {ar ? "نهجنا في العمل" : "Our Approach"}
        </h2>
        <div style={styles.approachGrid}>
          {(ar
            ? [
                ["تحليل البيانات", "نعتمد على البيانات المرورية والمكانية والتشغيلية كأساس للتقييم."],
                ["حلول عملية", "نقدم توصيات قابلة للتنفيذ ومناسبة للبيئة المحلية."],
                ["معايير دولية", "نراعي المنهجيات والمعايير الفنية المعتمدة دوليًا."],
              ]
            : [
                ["Data-Driven Analysis", "We use traffic, spatial, and operational data as the foundation for assessment."],
                ["Practical Solutions", "We provide implementable recommendations adapted to local conditions."],
                ["International Methods", "We align our work with recognized engineering and planning methodologies."],
              ]
          ).map(([title, desc]) => (
            <div key={title} style={styles.approachBox}>
              <h3 style={styles.cardTitle}>{title}</h3>
              <p style={styles.cardText}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Services({ ar, compact = false }) {
  const list = compact ? services.slice(0, 6) : services;

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>
        {ar ? "الخدمات الهندسية الرئيسية" : "Core Engineering Services"}
      </h2>

      <div style={styles.grid}>
        {list.map((s) => (
          <Link to={`/services/${s.id}`} key={s.id} style={styles.card}>
            <img src={s.image} alt={ar ? s.ar : s.en} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{ar ? s.ar : s.en}</h3>
              <p style={styles.cardText}>{ar ? s.arDesc : s.enDesc}</p>
              <span style={styles.readMore}>
                {ar ? "تفاصيل الخدمة" : "View Details"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ServiceDetail({ ar }) {
  const id = window.location.pathname.split("/").pop();
  const s = services.find((x) => x.id === id) || services[0];

  const bullets = ar
    ? [
        "إعداد الدراسات الفنية والتحليلية",
        "تحليل البيانات والتنبؤ المستقبلي",
        "إعداد التقارير والتوصيات الفنية",
        "دعم اتخاذ القرار والتخطيط الاستراتيجي",
        "التكامل مع قطاعات النقل والبنية التحتية الأخرى",
      ]
    : [
        "Preparation of technical and analytical studies",
        "Data analysis and future forecasting",
        "Technical reporting and recommendations",
        "Decision-support and strategic planning input",
        "Integration with other transport and infrastructure sectors",
      ];

  return (
    <section style={styles.detail}>
      <img src={s.image} alt={ar ? s.ar : s.en} style={styles.detailImage} />

      <div>
        <h1 style={styles.title}>{ar ? s.ar : s.en}</h1>
        <p style={styles.text}>{ar ? s.arDesc : s.enDesc}</p>

        <ul style={styles.list}>
          {bullets.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>

        <Link to="/services">
          <button style={styles.primaryButton}>
            {ar ? "العودة للخدمات" : "Back to Services"}
          </button>
        </Link>
      </div>
    </section>
  );
}

function Projects({ ar }) {
  const projectAreas = [
    {
      image: images.traffic,
      en: "Traffic Impact Assessment",
      ar: "دراسات الأثر المروري",
    },
    {
      image: images.roads,
      en: "Road Network & Highway Studies",
      ar: "دراسات الطرق والشبكات",
    },
    {
      image: images.airports,
      en: "Airport Infrastructure Studies",
      ar: "دراسات البنية التحتية للمطارات",
    },
    {
      image: images.ports,
      en: "Ports, Freight & Logistics",
      ar: "الموانئ والشحن واللوجستيات",
    },
  ];

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>
        {ar ? "مجالات الخبرة" : "Selected Experience Areas"}
      </h2>

      <div style={styles.grid}>
        {projectAreas.map((p) => (
          <div key={p.en} style={styles.card}>
            <img src={p.image} alt={ar ? p.ar : p.en} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{ar ? p.ar : p.en}</h3>
              <p style={styles.cardText}>
                {ar
                  ? "دراسات وتحليلات فنية لدعم التخطيط واتخاذ القرار."
                  : "Technical studies and analysis supporting planning and decision-making."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact({ ar }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>{ar ? "اتصل بنا" : "Contact Us"}</h2>

      <p style={styles.text}>
        {ar
          ? "للاستشارات أو طلب الدراسات الفنية أو فرص الشراكة، يمكنكم التواصل معنا."
          : "For consultancy requests, technical studies, or partnership opportunities, contact us below."}
      </p>

      <form action="https://formsubmit.co/radwan@sudaf.ly" method="POST" style={styles.form}>
        <input type="hidden" name="_subject" value="New inquiry from Sudaf website" />
        <input type="hidden" name="_captcha" value="false" />

        <input name="name" placeholder={ar ? "الاسم" : "Your Name"} required style={styles.input} />
        <input name="email" type="email" placeholder={ar ? "البريد الإلكتروني" : "Your Email"} required style={styles.input} />
        <textarea name="message" placeholder={ar ? "الرسالة" : "Message"} rows="5" required style={styles.input} />

        <button type="submit" style={styles.primaryButton}>
          {ar ? "إرسال" : "Send Message"}
        </button>
      </form>

      <div style={styles.contactInfo}>
        <p>Email: radwan@sudaf.ly</p>
        <p>{ar ? "الموقع: مصراتة، ليبيا" : "Location: Misurata, Libya"}</p>
      </div>
    </section>
  );
}

function Footer({ ar }) {
  return (
    <footer style={styles.footer}>
      © {new Date().getFullYear()}{" "}
      {ar ? "شركة سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}
    </footer>
  );
}

const gold = "#d49a43";
const brown = "#9a551d";
const dark = "#111827";
const panel = "#1f2937";

const styles = {
  page: {
    fontFamily: "Calibri, Arial, Tahoma, sans-serif",
    background: dark,
    color: "#e5e7eb",
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden",
  },

  header: {
    width: "100%",
    padding: "18px 6%",
    background: dark,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    zIndex: 50,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: gold,
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "clamp(18px, 4vw, 22px)",
    lineHeight: "1.2",
  },

  logoSmall: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
    flexShrink: 0,
  },

  nav: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  navLink: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "clamp(14px, 3vw, 16px)",
  },

  langButton: {
    background: brown,
    color: "white",
    border: "none",
    padding: "9px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  hero: {
    width: "100%",
    minHeight: "calc(100vh - 85px)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    textAlign: "center",
    padding: "80px 6%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  logoHero: {
    width: "clamp(120px, 34vw, 180px)",
    marginBottom: "26px",
  },

  heroTitle: {
    color: gold,
    fontSize: "clamp(34px, 7vw, 56px)",
    lineHeight: "1.15",
    margin: "0 0 22px",
    maxWidth: "950px",
    textWrap: "balance",
  },

  heroText: {
    maxWidth: "900px",
    margin: "0 auto",
    lineHeight: "1.8",
    fontSize: "clamp(16px, 4vw, 20px)",
    color: "#f3e8d6",
  },

  heroButtons: {
    marginTop: "28px",
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  section: {
    width: "100%",
    background: dark,
    padding: "80px 6%",
    textAlign: "center",
    boxSizing: "border-box",
  },

  sectionAlt: {
    width: "100%",
    background: "#0b1220",
    padding: "80px 6%",
    textAlign: "center",
    boxSizing: "border-box",
  },

  title: {
    color: gold,
    fontSize: "clamp(28px, 6vw, 38px)",
    lineHeight: "1.2",
    marginBottom: "24px",
  },

  text: {
    maxWidth: "900px",
    margin: "0 auto",
    color: "#d1d5db",
    lineHeight: "1.8",
    fontSize: "clamp(16px, 3.5vw, 18px)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginTop: "36px",
    width: "100%",
  },

  card: {
    background: panel,
    borderRadius: "18px",
    overflow: "hidden",
    textDecoration: "none",
    color: "#e5e7eb",
    textAlign: "start",
    boxShadow: "0 20px 45px rgba(0,0,0,.25)",
  },

  cardImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    display: "block",
  },

  cardBody: {
    padding: "24px",
  },

  cardTitle: {
    color: gold,
    fontSize: "clamp(20px, 4vw, 23px)",
    lineHeight: "1.3",
  },

  cardText: {
    color: "#d1d5db",
    lineHeight: "1.7",
    fontSize: "16px",
  },

  readMore: {
    color: gold,
    fontWeight: "bold",
  },

  approachGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "22px",
    marginTop: "36px",
  },

  approachBox: {
    background: panel,
    padding: "26px",
    borderRadius: "16px",
    textAlign: "start",
  },

  detail: {
    width: "100%",
    background: dark,
    padding: "80px 6%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "40px",
    alignItems: "center",
    boxSizing: "border-box",
  },

  detailImage: {
    width: "100%",
    height: "clamp(260px, 45vw, 420px)",
    objectFit: "cover",
    borderRadius: "20px",
  },

  list: {
    color: "#d1d5db",
    fontSize: "clamp(16px, 3.5vw, 18px)",
    lineHeight: "2",
  },

  form: {
    maxWidth: "520px",
    margin: "32px auto 0",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "15px",
    borderRadius: "10px",
    border: `1px solid ${brown}`,
    background: "#0b1220",
    color: "white",
    outline: "none",
    fontFamily: "Calibri, Arial, Tahoma, sans-serif",
    fontSize: "16px",
  },

  primaryButton: {
    padding: "14px 30px",
    background: gold,
    color: "#111827",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },

  outlineButton: {
    padding: "14px 30px",
    background: "transparent",
    color: gold,
    border: `1px solid ${gold}`,
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  },

  contactInfo: {
    marginTop: "30px",
    color: "#d1d5db",
  },

  footer: {
    width: "100%",
    background: dark,
    borderTop: "1px solid #374151",
    padding: "28px 6%",
    textAlign: "center",
    color: "#9ca3af",
    boxSizing: "border-box",
  },
};