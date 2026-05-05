import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";

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
  ["transport", images.transport, "Transportation Engineering & Planning", "هندسة وتخطيط النقل"],
  ["traffic", images.traffic, "Traffic Engineering & Impact Studies", "هندسة المرور ودراسات الأثر المروري"],
  ["roads", images.roads, "Roads, Highways & International Corridors", "الطرق والطرق السريعة والممرات الدولية"],
  ["ports", images.ports, "Ports & Maritime Transport", "الموانئ والنقل البحري"],
  ["rail", images.rail, "Railway Planning", "تخطيط السكك الحديدية"],
  ["airports", images.airports, "Airport & Airside Infrastructure", "المطارات والبنية التحتية الجوية"],
  ["public", images.public, "Public Transport Planning", "تخطيط النقل العام"],
  ["environment", images.environment, "Noise, Emissions & Transport Pollution", "الضجيج والانبعاثات والتلوث المروري"],
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
        <div>
          <div style={styles.brandTitle}>
            {ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering"}
          </div>
          <div style={styles.brandSub}>
            {ar ? "تخطيط النقل والبنية التحتية" : "Transport & Infrastructure Consultancy"}
          </div>
        </div>
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
          backgroundImage: `linear-gradient(rgba(17,24,39,.70), rgba(17,24,39,.92)), url(${images.hero})`,
        }}
      >
        <motion.img
          src="/logo.svg"
          alt="Sudaf Logo"
          style={styles.logoHero}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />

        <motion.h1
          style={styles.heroTitle}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          {ar ? "شركة سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}
        </motion.h1>

        <motion.p
          style={styles.heroText}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
        >
          {ar
            ? "استشارات هندسية متخصصة في تخطيط النقل، الدراسات المرورية، الطرق، الموانئ، المطارات، السكك الحديدية، النقل العام، والدراسات البيئية المرتبطة بالنقل."
            : "Specialized engineering consultancy in transport planning, traffic studies, roads, ports, airports, railways, public transport, logistics, and transport-related environmental studies."}
        </motion.p>

        <motion.div
          style={styles.heroButtons}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
        >
          <Link to="/services"><button style={styles.primaryButton}>{ar ? "استعراض الخدمات" : "Explore Services"}</button></Link>
          <Link to="/contact"><button style={styles.outlineButton}>{ar ? "اتصل بنا" : "Contact Us"}</button></Link>
        </motion.div>
      </section>

      <Reveal>
        <section style={styles.section}>
          <h2 style={styles.title}>{ar ? "عن الشركة" : "About Sudaf"}</h2>
          <p style={styles.text}>
            {ar
              ? "سدف للاستشارات الهندسية شركة ليبية متخصصة في الدراسات الهندسية والتحليل الفني والتخطيط الاستراتيجي لمشاريع النقل والبنية التحتية، مع تركيز خاص على النقل متعدد الوسائط وهندسة المرور."
              : "Sudaf Engineering Consultancy is a Libya-based engineering consultancy focused on technical studies, data-driven analysis, and strategic planning for transport and infrastructure projects, with strong emphasis on multimodal transport and traffic engineering."}
          </p>
        </section>
      </Reveal>

      <Services ar={ar} compact />

      <Reveal>
        <section style={styles.sectionAlt}>
          <h2 style={styles.title}>{ar ? "نهجنا في العمل" : "Our Approach"}</h2>
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
      </Reveal>
    </>
  );
}

function Services({ ar, compact = false }) {
  const list = compact ? services.slice(0, 6) : services;

  return (
    <Reveal>
      <section style={styles.section}>
        <h2 style={styles.title}>{ar ? "الخدمات الهندسية الرئيسية" : "Core Engineering Services"}</h2>

        <div style={styles.grid}>
          {list.map(([id, image, en, arabic]) => (
            <Link to={`/services/${id}`} key={id} style={styles.card}>
              <img src={image} alt={ar ? arabic : en} style={styles.cardImage} />
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{ar ? arabic : en}</h3>
                <p style={styles.cardText}>
                  {ar
                    ? "دراسات فنية وتحليلية متخصصة لدعم التخطيط واتخاذ القرار."
                    : "Specialized technical and analytical studies supporting planning and decision-making."}
                </p>
                <span style={styles.readMore}>{ar ? "تفاصيل الخدمة" : "View Details"}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function ServiceDetail({ ar }) {
  const id = window.location.pathname.split("/").pop();
  const s = services.find((x) => x[0] === id) || services[0];

  return (
    <section style={styles.detail}>
      <img src={s[1]} alt={ar ? s[3] : s[2]} style={styles.detailImage} />

      <div>
        <h1 style={styles.title}>{ar ? s[3] : s[2]}</h1>
        <p style={styles.text}>
          {ar
            ? "تغطي هذه الخدمة إعداد الدراسات الفنية، تحليل البيانات، التنبؤ، إعداد التقارير، وتقديم التوصيات الفنية لدعم قرارات الجهات المالكة والمستثمرين."
            : "This service covers technical studies, data analysis, forecasting, reporting, and recommendations to support authorities, developers, and project stakeholders."}
        </p>

        <ul style={styles.list}>
          {(ar
            ? ["إعداد الدراسات الفنية", "تحليل البيانات والتنبؤ", "إعداد التقارير", "دعم اتخاذ القرار", "التكامل مع قطاعات النقل الأخرى"]
            : ["Technical studies", "Data analysis and forecasting", "Technical reporting", "Decision support", "Integration with other transport sectors"]
          ).map((x) => <li key={x}>{x}</li>)}
        </ul>

        <Link to="/services"><button style={styles.primaryButton}>{ar ? "العودة للخدمات" : "Back to Services"}</button></Link>
      </div>
    </section>
  );
}

function Projects({ ar }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>{ar ? "مجالات الخبرة" : "Selected Experience Areas"}</h2>

      <div style={styles.grid}>
        {services.slice(0, 4).map(([id, image, en, arabic]) => (
          <div key={id} style={styles.card}>
            <img src={image} alt={ar ? arabic : en} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{ar ? arabic : en}</h3>
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

function Reveal({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65 }}
    >
      {children}
    </motion.div>
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
    padding: "14px 6%",
    background: "rgba(17,24,39,0.94)",
    backdropFilter: "blur(14px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: gold,
    textDecoration: "none",
    fontWeight: "bold",
    minWidth: "220px",
  },

  logoSmall: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
    flexShrink: 0,
  },

  brandTitle: {
    fontSize: "clamp(18px, 4vw, 22px)",
    lineHeight: "1.1",
  },

  brandSub: {
    color: "#c9b28c",
    fontSize: "12px",
    marginTop: "3px",
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
    fontSize: "15px",
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
    minHeight: "calc(100vh - 80px)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    textAlign: "center",
    padding: "72px 6%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  logoHero: {
    width: "clamp(120px, 31vw, 180px)",
    marginBottom: "24px",
  },

  heroTitle: {
    color: gold,
    fontSize: "clamp(34px, 7vw, 58px)",
    lineHeight: "1.12",
    margin: "0 0 22px",
    maxWidth: "980px",
  },

  heroText: {
    maxWidth: "900px",
    margin: "0 auto",
    lineHeight: "1.8",
    fontSize: "clamp(16px, 4vw, 20px)",
    color: "#f3e8d6",
  },

  heroButtons: {
    marginTop: "30px",
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