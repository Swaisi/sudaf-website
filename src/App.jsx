import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const images = {
  hero: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  transport: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  traffic: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  roads: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
  ports: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  rail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
  airports: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  public: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
  environment: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80",
};

const services = [
  {
    id: "transport",
    image: images.transport,
    en: "Transportation Engineering & Planning",
    ar: "هندسة وتخطيط النقل",
    enDesc: "Strategic transport planning, mobility policies, demand forecasting, and multimodal network studies.",
    arDesc: "تخطيط النقل الاستراتيجي، سياسات التنقل، التنبؤ بالطلب، ودراسات الشبكات متعددة الوسائط.",
  },
  {
    id: "traffic",
    image: images.traffic,
    en: "Traffic Engineering & Impact Studies",
    ar: "هندسة المرور ودراسات الأثر المروري",
    enDesc: "Traffic impact assessments, surveys, intersection analysis, capacity studies, and traffic operations.",
    arDesc: "دراسات الأثر المروري، العد المروري، تحليل التقاطعات، تقييم السعة، والتشغيل المروري.",
  },
  {
    id: "roads",
    image: images.roads,
    en: "Roads, Highways & International Corridors",
    ar: "الطرق والطرق السريعة والممرات الدولية",
    enDesc: "Road network planning, highway studies, geometric design review, and international corridor assessment.",
    arDesc: "تخطيط شبكات الطرق، دراسات الطرق السريعة، مراجعة التصميم الهندسي، وتقييم الممرات الدولية.",
  },
  {
    id: "ports",
    image: images.ports,
    en: "Ports & Maritime Transport",
    ar: "الموانئ والنقل البحري",
    enDesc: "Port access planning, freight movement, logistics interface, and maritime connectivity studies.",
    arDesc: "تخطيط مداخل الموانئ، حركة البضائع، الربط اللوجستي، ودراسات الاتصال البحري.",
  },
  {
    id: "rail",
    image: images.rail,
    en: "Railway Planning",
    ar: "تخطيط السكك الحديدية",
    enDesc: "Rail corridor planning, station access, freight/passenger rail studies, and intermodal integration.",
    arDesc: "تخطيط مسارات السكك الحديدية، الوصول للمحطات، نقل الركاب والبضائع، والتكامل متعدد الوسائط.",
  },
  {
    id: "airports",
    image: images.airports,
    en: "Airport & Airside Infrastructure",
    ar: "المطارات والبنية التحتية الجوية",
    enDesc: "Airport access, landside and airside circulation, aprons, taxiways, and operational studies.",
    arDesc: "دراسات الوصول للمطارات، الحركة البرية والجوية، الساحات، الممرات، والدراسات التشغيلية.",
  },
  {
    id: "public",
    image: images.public,
    en: "Public Transport Planning",
    ar: "تخطيط النقل العام",
    enDesc: "Bus networks, route planning, accessibility, service coverage, and urban mobility integration.",
    arDesc: "شبكات الحافلات، تخطيط المسارات، الوصول، تغطية الخدمة، والتكامل مع التنقل الحضري.",
  },
  {
    id: "environment",
    image: images.environment,
    en: "Noise, Emissions & Transport Pollution",
    ar: "الضجيج والانبعاثات والتلوث المروري",
    enDesc: "Transport noise, emissions, air quality impacts, pollution assessment, and mitigation measures.",
    arDesc: "دراسات الضجيج، الانبعاثات، أثر جودة الهواء، تقييم التلوث، وإجراءات التخفيف.",
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

        <button onClick={() => setLang(lang === "en" ? "ar" : "en")} style={styles.langButton}>
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
          backgroundImage: `linear-gradient(rgba(17,24,39,.78),rgba(17,24,39,.92)), url(${images.hero})`,
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

        <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/services">
            <button style={styles.primaryButton}>{ar ? "استعراض الخدمات" : "Explore Services"}</button>
          </Link>
          <Link to="/contact">
            <button style={styles.outlineButton}>{ar ? "اتصل بنا" : "Contact Us"}</button>
          </Link>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.title}>{ar ? "عن الشركة" : "About Sudaf"}</h2>
        <p style={styles.text}>
          {ar
            ? "سدف للاستشارات الهندسية شركة ليبية متخصصة في الدراسات الهندسية والتحليل الفني والتخطيط الاستراتيجي لمشاريع النقل والبنية التحتية، مع تركيز خاص على النقل متعدد الوسائط والمرور."
            : "Sudaf Engineering Consultancy is a Libya-based engineering consultancy focused on technical studies, data-driven analysis, and strategic planning for transport and infrastructure projects, with strong emphasis on multimodal transport and traffic engineering."}
        </p>
      </section>

      <Services ar={ar} compact />

      <section style={styles.section}>
        <h2 style={styles.title}>{ar ? "تواصل معنا" : "Contact Us"}</h2>
        <p style={styles.text}>
          {ar ? "لطلب الاستشارات أو الدراسات الفنية أو فرص الشراكة." : "For consultancy requests, technical studies, or partnership opportunities."}
        </p>
        <Link to="/contact">
          <button style={styles.primaryButton}>{ar ? "فتح صفحة التواصل" : "Open Contact Page"}</button>
        </Link>
      </section>
    </>
  );
}

function Services({ ar, compact = false }) {
  const list = compact ? services.slice(0, 6) : services;

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>{ar ? "الخدمات الهندسية الرئيسية" : "Core Engineering Services"}</h2>

      <div style={styles.grid}>
        {list.map((s) => (
          <Link to={`/services/${s.id}`} key={s.id} style={styles.card}>
            <img src={s.image} alt={ar ? s.ar : s.en} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{ar ? s.ar : s.en}</h3>
              <p style={styles.cardText}>{ar ? s.arDesc : s.enDesc}</p>
              <span style={styles.readMore}>{ar ? "تفاصيل الخدمة" : "View Details"}</span>
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

  return (
    <section style={styles.detail}>
      <img src={s.image} alt={ar ? s.ar : s.en} style={styles.detailImage} />

      <div>
        <h1 style={styles.title}>{ar ? s.ar : s.en}</h1>
        <p style={styles.text}>{ar ? s.arDesc : s.enDesc}</p>

        <ul style={styles.list}>
          {(ar
            ? ["إعداد الدراسات الفنية", "تحليل البيانات", "التقييم والتنبؤ", "إعداد التقارير والتوصيات", "دعم القرارات الاستراتيجية"]
            : ["Technical studies", "Data analysis", "Assessment and forecasting", "Reporting and recommendations", "Strategic decision support"]
          ).map((x) => <li key={x}>{x}</li>)}
        </ul>

        <Link to="/services">
          <button style={styles.primaryButton}>{ar ? "العودة للخدمات" : "Back to Services"}</button>
        </Link>
      </div>
    </section>
  );
}

function Projects({ ar }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>{ar ? "مجالات الخبرة" : "Selected Experience Areas"}</h2>
      <div style={styles.grid}>
        {services.slice(0, 4).map((s) => (
          <div key={s.id} style={styles.card}>
            <img src={s.image} alt={ar ? s.ar : s.en} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{ar ? s.ar : s.en}</h3>
              <p style={styles.cardText}>
                {ar ? "دراسات وتحليلات فنية لدعم التخطيط واتخاذ القرار." : "Technical studies and analysis supporting planning and decision-making."}
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

        <button type="submit" style={styles.primaryButton}>{ar ? "إرسال" : "Send Message"}</button>
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
      © {new Date().getFullYear()} {ar ? "شركة سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}
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
    background: "#f4efe8",
    color: "#e5e7eb",
    minHeight: "100vh",
  },
  header: {
    maxWidth: "1220px",
    margin: "0 auto",
    padding: "22px 34px",
    background: dark,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: gold,
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "22px",
  },
  logoSmall: {
    width: "54px",
    height: "54px",
    objectFit: "contain",
  },
  nav: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
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
    maxWidth: "1220px",
    margin: "0 auto",
    minHeight: "620px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    textAlign: "center",
    padding: "90px 34px",
  },
  logoHero: {
    width: "135px",
    marginBottom: "25px",
  },
  heroTitle: {
    color: gold,
    fontSize: "48px",
    marginBottom: "20px",
  },
  heroText: {
    maxWidth: "900px",
    margin: "0 auto",
    lineHeight: "1.8",
    fontSize: "20px",
    color: "#f3e8d6",
  },
  section: {
    maxWidth: "1220px",
    margin: "0 auto",
    background: dark,
    padding: "80px 34px",
    textAlign: "center",
  },
  title: {
    color: gold,
    fontSize: "34px",
    marginBottom: "24px",
  },
  text: {
    maxWidth: "900px",
    margin: "0 auto",
    color: "#d1d5db",
    lineHeight: "1.8",
    fontSize: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "24px",
    marginTop: "36px",
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
    height: "190px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "24px",
  },
  cardTitle: {
    color: gold,
    fontSize: "21px",
  },
  cardText: {
    color: "#d1d5db",
    lineHeight: "1.7",
  },
  readMore: {
    color: gold,
    fontWeight: "bold",
  },
  detail: {
    maxWidth: "1220px",
    margin: "0 auto",
    background: dark,
    padding: "80px 34px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "40px",
    alignItems: "center",
  },
  detailImage: {
    width: "100%",
    height: "360px",
    objectFit: "cover",
    borderRadius: "20px",
  },
  list: {
    color: "#d1d5db",
    fontSize: "18px",
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
  },
  primaryButton: {
    marginTop: "28px",
    padding: "14px 30px",
    background: gold,
    color: "#111827",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  outlineButton: {
    marginTop: "28px",
    padding: "14px 30px",
    background: "transparent",
    color: gold,
    border: `1px solid ${gold}`,
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  contactInfo: {
    marginTop: "30px",
    color: "#d1d5db",
  },
  footer: {
    maxWidth: "1220px",
    margin: "0 auto",
    background: dark,
    borderTop: "1px solid #374151",
    padding: "28px",
    textAlign: "center",
    color: "#9ca3af",
  },
};