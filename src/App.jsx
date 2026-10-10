import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { services, contact, pillars, tools, about, process, faqs } from "./data";
import { Icon, WhatsAppIcon } from "./icons";
import RoundaboutSim from "./RoundaboutSim";
import RoundaboutTool from "./RoundaboutTool";
import ProjectsList from "./ProjectsPage";
import { RampTool, GrowthTool } from "./InterchangeTools";
import { pages, pagePath, SITE_URL } from "./seo";
import "./App.css";

// Language comes from the URL: "/ar/..." is Arabic, everything else English.
function useLang() {
  const { pathname } = useLocation();
  const ar = pathname === "/ar" || pathname.startsWith("/ar/");
  return { ar, lang: ar ? "ar" : "en" };
}

function stripLang(pathname) {
  return pathname.replace(/^\/ar(\/|$)/, "/").replace(/^\/+|\/+$/g, "");
}

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

// Keeps <title>, description, canonical, and <html lang/dir> in sync with the route.
function usePageMeta() {
  const { pathname } = useLocation();
  const { ar, lang } = useLang();

  useEffect(() => {
    const path = stripLang(pathname);
    const page = pages.find((p) => p.path === path);
    const meta = page
      ? page[lang]
      : {
          title: ar ? "الصفحة غير موجودة | سدف" : "Page Not Found | Sudaf",
          description: "",
        };

    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.title = meta.title;
    setMeta('meta[name="description"]', "content", meta.description);
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[name="robots"]', "content", page ? "index, follow" : "noindex");
    if (page) {
      const url = SITE_URL + pagePath(page.path, lang);
      setMeta('link[rel="canonical"]', "href", url);
      setMeta('meta[property="og:url"]', "content", url);
    }
  }, [pathname, ar, lang]);
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

// Fades sections in as they scroll into view; skipped for reduced-motion users.
function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
}

const navItems = [
  { path: "", en: "Home", ar: "الرئيسية" },
  { path: "about", en: "About Us", ar: "من نحن" },
  { path: "services", en: "Services", ar: "الخدمات" },
  { path: "projects", en: "Projects", ar: "المشاريع" },
  { path: "tools", en: "Tools", ar: "أدوات هندسية" },
  { path: "contact", en: "Contact", ar: "اتصل بنا" },
];

function Header() {
  const { ar, lang } = useLang();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const otherLangPath = pagePath(stripLang(pathname), ar ? "en" : "ar");

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to={pagePath("", lang)} className="logo-container">
          <img src="/logo.svg" alt="Sudaf Logo" className="logo" width="44" height="67" />
          <div>
            <strong>{ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering"}</strong>
            <span>
              {ar
                ? "استشارات النقل والبنية التحتية"
                : "Transport & Infrastructure Consultancy"}
            </span>
          </div>
        </Link>

        <button
          className={`menu-btn ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={ar ? "القائمة" : "Menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={menuOpen ? "open" : ""}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              className="nav-link"
              to={pagePath(item.path, lang)}
              end
            >
              {ar ? item.ar : item.en}
            </NavLink>
          ))}

          <Link className="lang-btn" to={otherLangPath} hrefLang={ar ? "en" : "ar"}>
            {ar ? "English" : "العربية"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { ar, lang } = useLang();

  return (
    <footer className="footer">
      <div className="container footer-cta">
        <span className="footer-coords" dir="ltr">32°21′47″N · 15°04′44″E — Misurata, Libya</span>
        <h2>{ar ? "لنُهندس مشروعك القادم." : "Let’s engineer your next project."}</h2>
        <div className="footer-cta-actions">
          <Link to={pagePath("contact", lang)} className="btn">
            {ar ? "اطلب استشارة" : "Request a Consultation"}
            <ArrowBadge />
          </Link>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="btn outline">
            <WhatsAppIcon size={18} />
            {ar ? "واتساب" : "WhatsApp"}
          </a>
        </div>
      </div>

      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img src="/logo.svg" alt="" className="footer-logo" width="40" height="61" />
            <strong>{ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}</strong>
          </div>
          <p>
            {ar
              ? "استشارات هندسية متخصصة في النقل والبنية التحتية والحلول الهندسية المتكاملة."
              : "Specialized engineering consultancy in transport, infrastructure, and integrated engineering solutions."}
          </p>
        </div>

        <div>
          <h4>{ar ? "روابط سريعة" : "Quick Links"}</h4>
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={pagePath(item.path, lang)}>{ar ? item.ar : item.en}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>{ar ? "تواصل معنا" : "Get in Touch"}</h4>
          <ul className="footer-contact">
            <li>
              <Icon name="pin" size={18} />
              {ar ? "شارع طرابلس، مصراتة، ليبيا" : "Tripoli Street, Misurata, Libya"}
            </li>
            {contact.phones.map((phone) => (
              <li key={phone.tel}>
                <Icon name="phone" size={18} />
                <a href={`tel:${phone.tel}`} dir="ltr">
                  {phone.display}
                </a>
              </li>
            ))}
            <li>
              <Icon name="mail" size={18} />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container copyright">
        © {new Date().getFullYear()}{" "}
        {ar
          ? "سدف للاستشارات الهندسية. جميع الحقوق محفوظة."
          : "Sudaf Engineering Consultancy. All rights reserved."}
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  const { ar } = useLang();
  return (
    <a
      className="whatsapp-float"
      href={contact.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label={ar ? "تواصل معنا عبر واتساب" : "Chat with us on WhatsApp"}
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}

function PageHeader({ title, subtitle }) {
  const { ar, lang } = useLang();
  return (
    <section className="page-header">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to={pagePath("", lang)}>{ar ? "الرئيسية" : "Home"}</Link>
          <span aria-hidden="true">/</span>
          <span>{title}</span>
        </nav>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}

function ServiceModal({ service, onClose }) {
  const { ar, lang } = useLang();

  const dialogRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      // Keep Tab focus inside the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll("a[href], button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={ar ? "إغلاق" : "Close"} autoFocus>
          <Icon name="close" size={22} />
        </button>
        <img src={service.img} alt="" />
        <div className="modal-body">
          <h2 id="modal-title">{ar ? service.titleAr : service.title}</h2>
          <p>{ar ? service.descAr : service.desc}</p>

          <h3>{ar ? "نطاق الخدمات" : "Service Scope"}</h3>
          <ul className="check-list">
            {(ar ? service.detailsAr : service.details).map((item, i) => (
              <li key={i}>
                <Icon name="check" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link to={pagePath("contact", lang)} className="btn" onClick={onClose}>
            {ar ? "استفسر عن هذه الخدمة" : "Enquire About This Service"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ArrowBadge() {
  return (
    <span className="btn-ic" aria-hidden="true">
      <Icon name="arrow" size={16} className="flip-rtl" />
    </span>
  );
}

function SectionLabel({ index, label }) {
  return (
    <div className="section-label reveal">
      <span className="idx">{index}</span>
      <span>{label}</span>
    </div>
  );
}

function NumbersBand() {
  const { ar } = useLang();
  const items = [
    { n: services.length, en: "Specialized engineering service areas", ar: "مجالًا هندسيًا متخصصًا" },
    { n: 5, en: "Transport sectors — roads, ports, rail, airports and urban mobility", ar: "قطاعات نقل: الطرق والموانئ والسكك والمطارات والنقل الحضري" },
    { n: tools.length, en: "Modeling, design and planning platforms", ar: "برامج للنمذجة والتصميم والتخطيط" },
  ];
  return (
    <section className="numbers">
      <div className="container numbers-inner">
        <div className="numbers-intro reveal">
          <SectionLabel index="01" label={ar ? "سدف بالأرقام" : "Sudaf by the numbers"} />
          <h2>
            {ar
              ? "خبرة متعددة التخصصات تحت سقف واحد"
              : "Multidisciplinary expertise under one roof"}
          </h2>
        </div>
        <ul className="numbers-list">
          {items.map((it) => (
            <li key={it.en} className="reveal">
              <strong className="masked">{it.n}</strong>
              <span>{ar ? it.ar : it.en}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServiceIndex() {
  const { ar, lang } = useLang();
  const [active, setActive] = useState(0);
  const s = services[active];
  const details = ar ? s.detailsAr : s.details;

  return (
    <section className="section svc-index-section">
      <div className="container">
        <SectionLabel index="02" label={ar ? "خدماتنا" : "What we do"} />
        <div className="svc-index-head reveal">
          <h2>{ar ? "خدمات هندسية متكاملة" : "Integrated engineering services"}</h2>
          <p>
            {ar
              ? "من الدراسات الاستراتيجية إلى التصميم التفصيلي ومستندات الطرح، نغطي دورة حياة مشاريع النقل والبنية التحتية كاملة."
              : "From strategic studies to detailed design and tender documents, we cover the full lifecycle of transport and infrastructure projects."}
          </p>
        </div>

        <div className="svc-index">
          <ol className="svc-list" role="tablist" aria-orientation="vertical">
            {services.map((item, i) => (
              <li key={item.title}>
                <button
                  role="tab"
                  aria-selected={i === active}
                  aria-controls="svc-preview"
                  className={i === active ? "active" : ""}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t">{ar ? item.titleAr : item.title}</span>
                  <Icon name="arrow" size={18} className="flip-rtl" />
                </button>
              </li>
            ))}
          </ol>

          <div className="svc-preview" id="svc-preview" role="tabpanel" aria-live="polite">
            <div className="svc-frame">
              {services.map((item, i) => (
                <img
                  key={item.title}
                  src={item.img.replace("/images/", "/images/duo/")}
                  alt=""
                  loading="lazy"
                  className={i === active ? "on" : ""}
                  width="1000"
                  height="667"
                />
              ))}
              <span className="svc-frame-num" aria-hidden="true">{String(active + 1).padStart(2, "0")}</span>
            </div>
            <h3>{ar ? s.titleAr : s.title}</h3>
            <p>{ar ? s.descAr : s.desc}</p>
            <ul className="check-list">
              {details.slice(0, 3).map((d) => (
                <li key={d}>
                  <Icon name="check" size={18} />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <Link to={`${pagePath("services", lang)}#service-${active + 1}`} className="btn dark">
              {ar ? "النطاق الكامل للخدمة" : "Full scope of service"}
              <ArrowBadge />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const { ar } = useLang();
  return (
    <section className="section process-section">
      <div className="container">
        <SectionLabel index="03" label={ar ? "منهجية العمل" : "How we work"} />
        <h2 className="process-title reveal">
          {ar ? "من البيانات إلى التسليم" : "From data to delivery"}
        </h2>
        <ol className="process">
          {process.map((step, i) => (
            <li key={step.title} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="process-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="process-icon">
                <Icon name={step.icon} size={22} />
              </span>
              <h3>{ar ? step.titleAr : step.title}</h3>
              <p>{ar ? step.descAr : step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PillarsSection() {
  const { ar } = useLang();
  return (
    <section className="section pillars-section">
      <div className="container">
        <SectionLabel index="04" label={ar ? "لماذا سدف" : "Why Sudaf"} />
        <h2 className="pillars-title reveal">
          {ar ? "خبرة فنية تبني الثقة" : "Technical expertise you can rely on"}
        </h2>
        <div className="pillars">
          {pillars.map((p) => (
            <div className="pillar reveal" key={p.title}>
              <div className="pillar-icon">
                <Icon name={p.icon} size={24} />
              </div>
              <h3>{ar ? p.titleAr : p.title}</h3>
              <p>{ar ? p.descAr : p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsMarquee() {
  const { ar } = useLang();
  const row = [...tools, ...tools];
  return (
    <section className="marquee" aria-label={ar ? "البرامج التي نعتمد عليها" : "Software we work with"}>
      <div className="marquee-track" dir="ltr">
        {[0, 1].map((k) => (
          <ul key={k} aria-hidden={k === 1}>
            {row.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const { ar } = useLang();
  return (
    <section className="section faq-section">
      <div className="container faq-layout">
        <div className="faq-intro reveal">
          <SectionLabel index="05" label={ar ? "أسئلة شائعة" : "FAQ"} />
          <h2>{ar ? "أسئلة يطرحها عملاؤنا" : "Questions our clients ask"}</h2>
        </div>
        <div className="faq-list reveal">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>
                <span>{ar ? f.qAr : f.q}</span>
                <span className="faq-ic" aria-hidden="true" />
              </summary>
              <p>{ar ? f.aAr : f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const { ar, lang } = useLang();

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="eyebrow light">
              {ar
                ? "سدف للاستشارات الهندسية · مصراتة، ليبيا"
                : "Sudaf Engineering Consultancy · Misurata, Libya"}
            </span>
            <h1>
              {ar
                ? "نُهندس البنية التحتية التي تدفع ليبيا إلى الأمام"
                : "Engineering the infrastructure that moves Libya forward"}
            </h1>
            <p>
              {ar
                ? "نقدم خدمات تخطيط النقل وهندسة المرور وتصميم البنية التحتية وإعداد مستندات المشاريع للجهات العامة والخاصة، وفق المعايير الدولية وباستخدام أحدث أدوات النمذجة."
                : "We deliver transport planning, traffic engineering, infrastructure design, and project documentation for public and private clients — built on international standards and advanced modeling tools."}
            </p>

            <div className="hero-buttons">
              <Link to={pagePath("contact", lang)} className="btn">
                {ar ? "اطلب استشارة" : "Request a Consultation"}
                <ArrowBadge />
              </Link>
              <Link to={pagePath("services", lang)} className="btn outline">
                {ar ? "خدماتنا" : "Our Services"}
              </Link>
            </div>
          </div>

          <RoundaboutSim ar={ar} />
        </div>
      </section>

      <NumbersBand />
      <ServiceIndex />
      <ProcessSection />
      <PillarsSection />
      <ToolsMarquee />
      <FaqSection />
    </>
  );
}

function AboutPage() {
  const { ar } = useLang();

  return (
    <>
      <PageHeader
        title={ar ? "من نحن" : "About Us"}
        subtitle={
          ar
            ? "شركة استشارات هندسية متخصصة في النقل والبنية التحتية."
            : "A specialized engineering consultancy for transport and infrastructure."
        }
      />
      <section className="section">
        <div className="container about-layout">
          <div className="about-text reveal">
            {about.map((para, i) => (
              <p key={i} className={i === 0 ? "lead" : ""}>
                {ar ? para.ar : para.en}
              </p>
            ))}
          </div>

          <aside className="about-aside reveal">
            <h3>{ar ? "مجالات الخبرة" : "Areas of Expertise"}</h3>
            <ul className="check-list">
              {services.map((s) => (
                <li key={s.title}>
                  <Icon name="check" size={18} />
                  <span>{ar ? s.titleAr : s.title}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}

function ServicesPage() {
  const { ar, lang } = useLang();
  const [selectedService, setSelectedService] = useState(null);

  return (
    <>
      <section className="services-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to={pagePath("", lang)}>{ar ? "الرئيسية" : "Home"}</Link>
            <span aria-hidden="true">/</span>
            <span>{ar ? "خدماتنا" : "Our Services"}</span>
          </nav>
          <span className="eyebrow light">
            {ar ? `${services.length} مجالًا تخصصيًا` : `${services.length} Areas of Expertise`}
          </span>
          <h1>
            {ar
              ? "خدمات هندسية بمعايير دولية"
              : "Engineering Services to International Standards"}
          </h1>
          <p className="services-hero-text">
            {ar
              ? "من التخطيط الاستراتيجي والنمذجة المرورية إلى التصميم ومستندات الطرح، نقدم لعملائنا خبرة متكاملة في كل مراحل المشروع."
              : "From strategic planning and traffic modeling to design and tender documentation, we bring integrated expertise to every stage of your project."}
          </p>

          <ul className="service-index">
            {services.map((s, i) => (
              <li key={s.title}>
                <a href={`#service-${i + 1}`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {ar ? s.titleAr : s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="service-rows">
        <div className="container">
          {services.map((service, i) => {
            const details = ar ? service.detailsAr : service.details;
            const extra = details.length - 4;
            return (
              <article
                className={`service-row reveal ${i % 2 ? "reverse" : ""}`}
                id={`service-${i + 1}`}
                key={service.title}
              >
                <div className="service-row-media">
                  <img
                    src={service.img}
                    alt=""
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    width="1200"
                    height="800"
                  />
                </div>

                <div className="service-row-body">
                  <span className="service-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2>{ar ? service.titleAr : service.title}</h2>
                  <p className="service-desc">{ar ? service.descAr : service.desc}</p>

                  <ul className="check-list">
                    {details.slice(0, 4).map((item) => (
                      <li key={item}>
                        <Icon name="check" size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="service-actions">
                    <button className="btn dark" onClick={() => setSelectedService(service)}>
                      {ar ? "النطاق الكامل للخدمة" : "Full Scope of Service"}
                      {extra > 0 && <span className="more-count">+{extra}</span>}
                    </button>
                    <Link to={pagePath("contact", lang)} className="text-link">
                      {ar ? "اطلب عرضًا" : "Request a Proposal"}
                      <Icon name="arrow" size={18} className="flip-rtl" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedService && (
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}

    </>
  );
}

function ProjectsPage() {
  const { ar, lang } = useLang();

  return (
    <>
      <PageHeader
        title={ar ? "المشاريع" : "Projects"}
        subtitle={
          ar
            ? "دراسات حالة من أعمال فريقنا في تقاطعات الطرق المنفصلة والدراسات المرورية."
            : "Case studies from our team’s work on grade-separated interchanges and traffic studies."
        }
      />
      <section className="section">
        <div className="container">
          <ProjectsList ar={ar} />
          <div className="center-text reveal">
            <Link to={pagePath("contact", lang)} className="btn dark">
              {ar ? "ناقش مشروعك مع فريقنا" : "Discuss your project with our team"}
              <ArrowBadge />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const { ar, lang } = useLang();
  const { search } = useLocation();
  const sent = new URLSearchParams(search).has("sent");

  return (
    <>
      <PageHeader
        title={ar ? "اتصل بنا" : "Contact Us"}
        subtitle={
          ar
            ? "يسعدنا الرد على استفساراتكم ومناقشة متطلبات مشاريعكم."
            : "We'd be glad to answer your questions and discuss your project requirements."
        }
      />
      <section className="section">
        <div className="container contact-wrapper">
          <div className="contact-info reveal">
            <h2>
              {ar ? "شركة سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}
            </h2>

            <ul className="contact-list">
              <li>
                <span className="contact-icon"><Icon name="pin" /></span>
                <div>
                  <strong>{ar ? "العنوان" : "Address"}</strong>
                  <span>
                    {ar
                      ? "ليبيا، مصراتة، شارع طرابلس، بجانب مصرف الجمهورية"
                      : "Tripoli Street, beside Jumhouria Bank, Misurata, Libya"}
                  </span>
                  <a href={contact.mapUrl} target="_blank" rel="noreferrer">
                    {ar ? "فتح على خرائط Google" : "Open in Google Maps"}
                  </a>
                </div>
              </li>
              <li>
                <span className="contact-icon"><Icon name="phone" /></span>
                <div>
                  <strong>{ar ? "الهاتف" : "Phone"}</strong>
                  {contact.phones.map((phone) => (
                    <a key={phone.tel} href={`tel:${phone.tel}`} dir="ltr">
                      {phone.display}
                    </a>
                  ))}
                </div>
              </li>
              <li>
                <span className="contact-icon whatsapp"><WhatsAppIcon /></span>
                <div>
                  <strong>{ar ? "واتساب" : "WhatsApp"}</strong>
                  <a href={contact.whatsapp} target="_blank" rel="noreferrer" dir="ltr">
                    {contact.phones[0].display}
                  </a>
                </div>
              </li>
              <li>
                <span className="contact-icon"><Icon name="mail" /></span>
                <div>
                  <strong>{ar ? "البريد الإلكتروني" : "Email"}</strong>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  <span className="muted small">
                    {ar ? "الدراسات والتصاميم:" : "Studies & designs:"}{" "}
                    <a href={`mailto:${contact.studiesEmail}`}>{contact.studiesEmail}</a>
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <form
            className="contact-form reveal"
            action={`https://formsubmit.co/${contact.email}`}
            method="POST"
          >
            <h3>{ar ? "أرسل لنا رسالة" : "Send Us a Message"}</h3>

            {sent && (
              <div className="form-success" role="status">
                <Icon name="check" size={20} />
                {ar
                  ? "تم إرسال رسالتك بنجاح. سنتواصل معك قريبًا."
                  : "Your message has been sent. We will get back to you shortly."}
              </div>
            )}

            <input type="hidden" name="_subject" value="New inquiry from Sudaf website" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
            <input
              type="hidden"
              name="_next"
              value={`${SITE_URL}${pagePath("contact", lang)}?sent=1`}
            />
            <input type="text" name="_honey" className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" />

            <div className="field">
              <label htmlFor="cf-name">{ar ? "الاسم الكامل" : "Full Name"}</label>
              <input id="cf-name" type="text" name="name" autoComplete="name" required />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="cf-email">{ar ? "البريد الإلكتروني" : "Email"}</label>
                <input id="cf-email" type="email" name="email" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="cf-phone">
                  {ar ? "رقم الهاتف" : "Phone"}{" "}
                  <span className="optional">{ar ? "(اختياري)" : "(optional)"}</span>
                </label>
                <input id="cf-phone" type="tel" name="phone" autoComplete="tel" dir="ltr" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="cf-message">{ar ? "الرسالة" : "Message"}</label>
              <textarea id="cf-message" name="message" rows="5" required></textarea>
            </div>

            <button type="submit" className="btn full">
              {ar ? "إرسال الرسالة" : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function ToolsPage() {
  const { ar } = useLang();

  return (
    <>
      <PageHeader
        title={ar ? "أدوات هندسية" : "Engineering Tools"}
        subtitle={
          ar
            ? "أدوات تفاعلية لتصميم جزر الدوران ومنحدرات التقاطعات المنفصلة وإسقاط الحجوم المرورية، وفق DMRB وFHWA وAASHTO."
            : "Interactive tools for roundabout design, interchange ramps and traffic growth — based on DMRB, FHWA and AASHTO guidance."
        }
      />
      <section className="section">
        <div className="container">
          <nav className="tool-jump" aria-label={ar ? "الأدوات" : "Tools"}>
            <a href="#roundabout">{ar ? "01 تصميم جزر الدوران" : "01 Roundabout design"}</a>
            <a href="#ramps">{ar ? "02 منحدرات التقاطعات (AASHTO)" : "02 Interchange ramps (AASHTO)"}</a>
            <a href="#growth">{ar ? "03 نمو الحجم المروري" : "03 Traffic growth"}</a>
          </nav>

          <div id="roundabout" className="tool-section">
            <SectionLabel index="01" label={ar ? "تصميم جزر الدوران" : "Roundabout design"} />
            <RoundaboutTool ar={ar} />
          </div>

          <div id="ramps" className="tool-section">
            <SectionLabel index="02" label={ar ? "منحدرات التقاطعات المنفصلة" : "Interchange ramps"} />
            <p className="tool-intro">
              {ar
                ? "سرعة تصميم المنحدر وأقل نصف قطر وأطوال حارات التسارع والتباطؤ وفق دليل AASHTO للتصميم الهندسي (Green Book)."
                : "Ramp design speed, minimum radius and acceleration/deceleration lane lengths from the AASHTO Green Book."}
            </p>
            <RampTool ar={ar} />
          </div>

          <div id="growth" className="tool-section">
            <SectionLabel index="03" label={ar ? "نمو الحجم المروري" : "Traffic growth"} />
            <p className="tool-intro">
              {ar
                ? "إسقاط حجم الذروة بطريقة معدل النمو السنوي المركّب (CAGR) ومقارنته بسعة الطريق لتحديد سنة الوصول إلى الاختناق."
                : "Project peak-hour volume with a compound annual growth rate (CAGR) and compare it with capacity to find when the facility saturates."}
            </p>
            <GrowthTool ar={ar} />
          </div>
        </div>
      </section>
    </>
  );
}

function NotFoundPage() {
  const { ar, lang } = useLang();

  return (
    <section className="not-found">
      <h1>404</h1>
      <p>{ar ? "عذرًا، هذه الصفحة غير موجودة." : "Sorry, this page does not exist."}</p>
      <Link to={pagePath("", lang)} className="btn dark">
        {ar ? "العودة للرئيسية" : "Back to Home"}
      </Link>
    </section>
  );
}

const pageComponents = {
  home: HomePage,
  about: AboutPage,
  services: ServicesPage,
  projects: ProjectsPage,
  contact: ContactPage,
  tools: ToolsPage,
};

function App() {
  const { ar } = useLang();
  usePageMeta();
  useReveal();

  return (
    <div className="app" dir={ar ? "rtl" : "ltr"}>
      <ScrollToTop />
      <a href="#main" className="skip-link">
        {ar ? "انتقل إلى المحتوى" : "Skip to main content"}
      </a>
      <Header />

      <main id="main" tabIndex="-1">
        <Routes>
          {["en", "ar"].flatMap((lang) =>
            pages.map(({ key, path }) => {
              const Page = pageComponents[key];
              return (
                <Route key={lang + key} path={pagePath(path, lang)} element={<Page />} />
              );
            })
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
