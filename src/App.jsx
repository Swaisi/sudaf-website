import { useEffect, useState } from "react";
import { Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { services, contact } from "./data";
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
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

const navItems = [
  { path: "", en: "Home", ar: "الرئيسية" },
  { path: "about", en: "About Us", ar: "من نحن" },
  { path: "services", en: "Services", ar: "الخدمات" },
  { path: "projects", en: "Projects", ar: "المشاريع" },
  { path: "contact", en: "Contact", ar: "اتصل بنا" },
];

function Header() {
  const { ar, lang } = useLang();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const otherLangPath = pagePath(stripLang(pathname), ar ? "en" : "ar");

  return (
    <header className="header">
      <Link to={pagePath("", lang)} className="logo-container">
        <img src="/logo.svg" alt="Sudaf Logo" className="logo" />
        <div>
          <h2>{ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering"}</h2>
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
    </header>
  );
}

function Footer() {
  const { ar, lang } = useLang();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <img src="/logo.svg" alt="Sudaf Logo" className="footer-logo" />
          <h3>{ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}</h3>
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
          <ul>
            <li>{ar ? "مصراتة، ليبيا" : "Misurata, Libya"}</li>
            {contact.phones.map((phone) => (
              <li key={phone.tel}>
                <a href={`tel:${phone.tel}`} dir="ltr">
                  {phone.display}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <p className="copyright">
        © {new Date().getFullYear()}{" "}
        {ar
          ? "سدف للاستشارات الهندسية. جميع الحقوق محفوظة."
          : "Sudaf Engineering Consultancy. All rights reserved."}
      </p>
    </footer>
  );
}

function ServiceModal({ service, onClose }) {
  const { ar } = useLang();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={service.img} alt={ar ? service.titleAr : service.title} />
        <h2>{ar ? service.titleAr : service.title}</h2>
        <p>{ar ? service.descAr : service.desc}</p>

        <h4>{ar ? "نطاق الخدمات" : "Service Scope"}</h4>
        <ul>
          {(ar ? service.detailsAr : service.details).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <button onClick={onClose} autoFocus>
          {ar ? "إغلاق" : "Close"}
        </button>
      </div>
    </div>
  );
}

function ServicesPage() {
  const { ar } = useLang();
  const [selectedService, setSelectedService] = useState(null);

  return (
    <>
      <section className="services" id="services">
        {services.map((service, index) => (
          <button
            className="card"
            key={index}
            onClick={() => setSelectedService(service)}
          >
            <img
              src={service.img}
              alt={ar ? service.titleAr : service.title}
              loading="lazy"
              decoding="async"
              width="1200"
              height="800"
            />
            <div className="card-content">
              <h3>{ar ? service.titleAr : service.title}</h3>
              <p>{ar ? service.descAr : service.desc}</p>
              <span className="read-more">
                {ar ? "عرض التفاصيل ←" : "View Details →"}
              </span>
            </div>
          </button>
        ))}
      </section>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </>
  );
}

function AboutPage() {
  const { ar } = useLang();

  return (
    <section className="about-page">
      <div className="about-page-container">
        <span className="section-tag">{ar ? "من نحن" : "About Us"}</span>

        <h1>
          {ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}
        </h1>

        <p>
          {ar
            ? "سدف للاستشارات الهندسية هي شركة هندسية واستشارية متخصصة في مجالات هندسة النقل، وتطوير البنية التحتية، والتخطيط الهندسي، والحلول التقنية المتكاملة. تقدم الشركة خدمات استشارية احترافية في الدراسات والتصاميم الهندسية، والتخطيط الاستراتيجي، وهندسة المرور، وأنظمة النقل، والطرق، والمطارات، والموانئ، والسكك الحديدية، وتطوير مشاريع البنية التحتية باستخدام أحدث التقنيات والمعايير الهندسية الدولية."
            : "Sudaf Engineering Consultancy is a specialized engineering and consulting firm focused on transportation engineering, infrastructure development, engineering planning, and integrated technical solutions. The company provides professional consultancy services in engineering studies, design, strategic planning, traffic engineering, transportation systems, roads, airports, ports, railways, and infrastructure development using advanced technologies and international engineering standards."}
        </p>

        <p>
          {ar
            ? "توفر سدف مجموعة متكاملة من الخدمات الفنية تشمل تخطيط النقل، ودراسات الأثر المروري، والمحاكاة والنمذجة المرورية، والتكامل مع أنظمة GIS، وتخطيط البنية التحتية، والتنسيق الهندسي للمشاريع. كما تدعم الشركة مشاريع القطاعين العام والخاص من خلال التحليل الفني، وإعداد المستندات الهندسية، ودراسات الجدوى، وحلول تطوير المشاريع بما يتناسب مع المتطلبات المحلية والإقليمية."
            : "Sudaf offers comprehensive technical services covering transportation planning, traffic impact studies, traffic simulation and modeling, GIS integration, infrastructure planning, and engineering design coordination. The company also supports public and private sector projects through technical analysis, engineering documentation, feasibility studies, and project development solutions tailored to local and regional requirements."}
        </p>

        <p>
          {ar
            ? "كما تقدم سدف خدمات متخصصة في إعداد مستندات الطرح والمناقصات وطلبات تقديم العروض RFP، والعروض الفنية والتجارية، وجداول الكميات BOQ، وأعمال الحصر، والمواصفات الفنية، ومنهجيات التنفيذ، وخطط الجودة QA/QC، ومستندات الصحة والسلامة HSE، والمستندات الهندسية الخاصة بمشاريع البنية التحتية والإنشاءات."
            : "In addition, Sudaf provides specialized services in the preparation of tender documents, Requests for Proposal (RFP), technical and commercial proposals, Bills of Quantities (BOQ), quantity surveying, technical specifications, execution methodologies, QA/QC plans, HSE documentation, and engineering documents for infrastructure and construction projects."}
        </p>

        <p>
          {ar
            ? "وتقوم الشركة كذلك بإعداد الجداول الزمنية وأنظمة تخطيط المشاريع باستخدام برامج Primavera P6 وMicrosoft Project، بما يشمل البرامج الزمنية الأساسية، ومتابعة تقدم الأعمال، وتوزيع الموارد، وتسلسل الأنشطة، والتدفقات النقدية، ودعم التحكم وإدارة المشاريع."
            : "The company also develops project schedules and planning systems using Primavera P6 and Microsoft Project, including baseline programs, progress monitoring, resource allocation, activity sequencing, cash flow planning, and project control support."}
        </p>

        <p>
          {ar
            ? "تعتمد سدف للاستشارات الهندسية على كادر هندسي وفني متعدد التخصصات يمتلك خبرات في مجالات هندسة النقل، والبنية التحتية، والهندسة المدنية، والتحليل المروري، وأنظمة GIS، وتخطيط المشاريع، وحصر الكميات، وضبط الجودة QA/QC، والصحة والسلامة HSE، والإدارة الفنية للمشاريع. ويجمع فريق العمل بين الخبرة الميدانية العملية واستخدام البرامج الهندسية الحديثة والمعايير الدولية لتقديم حلول هندسية فعالة وموثوقة وذات طابع احترافي."
            : "Sudaf Engineering Consultancy is supported by a multidisciplinary engineering and technical team with expertise in transportation engineering, infrastructure, civil engineering, traffic analysis, GIS systems, project planning, quantity surveying, QA/QC, HSE, and technical project management. The team combines practical field experience with advanced engineering software and international standards to deliver efficient, reliable, and professional engineering solutions."}
        </p>

        <p>
          {ar
            ? "وتسعى سدف بشكل مستمر إلى تطوير قدراتها الفنية من خلال مواكبة التقنيات الحديثة، والتطوير المهني، والتعاون مع الجهات والخبرات المحلية والدولية المتخصصة. وتلتزم الشركة بتقديم حلول هندسية حديثة وعملية ومستدامة مع الحفاظ على أعلى معايير الجودة والكفاءة الفنية والاحترافية."
            : "Sudaf continuously seeks to strengthen its technical capacity through modern technologies, professional development, and collaboration with specialized local and international partners. The company is committed to delivering innovative, practical, and sustainable engineering solutions while maintaining high standards of quality, technical excellence, efficiency, and professional integrity."}
        </p>
      </div>
    </section>
  );
}

function ProjectsPage() {
  const { ar } = useLang();

  return (
    <section className="projects-section">
      <h2>{ar ? "المشاريع" : "Projects"}</h2>
      <p>
        {ar
          ? "سيتم قريبًا عرض نماذج من مشاريع الشركة وخبراتها الفنية في مجالات النقل والبنية التحتية والدراسات الهندسية."
          : "Selected company projects and technical experience in transport, infrastructure, and engineering studies will be published soon."}
      </p>
    </section>
  );
}

function ContactPage() {
  const { ar } = useLang();

  return (
    <section className="contact-section">
      <div className="contact-wrapper">
        <div className="contact-info">
          <h2>{ar ? "اتصل بنا" : "Contact Us"}</h2>

          <h3>
            {ar
              ? "شركة سدف للاستشارات الهندسية"
              : "Sudaf Engineering Consultancy"}
          </h3>

          <p>
            {ar
              ? "العنوان: ليبيا، مصراتة، شارع طرابلس، بجانب مصرف الجمهورية"
              : "Address: Libya, Misurata, Tripoli Street, beside Jumhouria Bank"}
          </p>

          {contact.phones.map((phone) => (
            <p key={phone.tel}>
              {ar ? "الهاتف:" : "Phone:"}{" "}
              <a href={`tel:${phone.tel}`} dir="ltr">
                {phone.display}
              </a>
            </p>
          ))}
          <p>
            {ar ? "البريد العام:" : "General Email:"}{" "}
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
          <p>
            {ar ? "الدراسات والتصاميم:" : "Studies & Designs:"}{" "}
            <a href={`mailto:${contact.studiesEmail}`}>{contact.studiesEmail}</a>
          </p>

          <p>
            {ar ? "إحداثيات الموقع:" : "Coordinates:"}{" "}
            <span dir="ltr">32°21'47.3"N 15°04'44.4"E</span>
          </p>

          <a
            href={contact.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="map-link"
          >
            {ar ? "فتح الموقع على خرائط Google" : "Open Location on Google Maps"}
          </a>
        </div>

        <form
          className="contact-form"
          action={`https://formsubmit.co/${contact.email}`}
          method="POST"
        >
          <input
            type="hidden"
            name="_subject"
            value="New inquiry from Sudaf website"
          />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />

          <input
            type="text"
            name="name"
            placeholder={ar ? "الاسم" : "Your Name"}
            aria-label={ar ? "الاسم" : "Your Name"}
            required
          />

          <input
            type="email"
            name="email"
            placeholder={ar ? "البريد الإلكتروني" : "Your Email"}
            aria-label={ar ? "البريد الإلكتروني" : "Your Email"}
            required
          />

          <textarea
            name="message"
            rows="6"
            placeholder={ar ? "اكتب رسالتك هنا" : "Write your message here"}
            aria-label={ar ? "الرسالة" : "Message"}
            required
          ></textarea>

          <button type="submit">{ar ? "إرسال الرسالة" : "Send Message"}</button>
        </form>
      </div>
    </section>
  );
}

function HomePage() {
  const { ar, lang } = useLang();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <img src="/logo.svg" alt="Sudaf Logo" className="hero-logo" />
          <h1>
            {ar ? "شركة سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}
          </h1>
          <p>
            {ar
              ? "استشارات هندسية متخصصة في تخطيط النقل، البنية التحتية، هندسة المرور، المطارات، الموانئ، السكك الحديدية، أنظمة GIS، إعداد مستندات الطرح والعروض الفنية، والحلول الهندسية المتكاملة."
              : "Specialized engineering consultancy in transport planning, infrastructure, traffic engineering, airports, ports, railways, GIS systems, tender documentation, technical proposals, and integrated engineering solutions."}
          </p>

          <div className="hero-buttons">
            <Link to={pagePath("services", lang)} className="btn">
              {ar ? "استعراض الخدمات" : "Explore Services"}
            </Link>

            <Link to={pagePath("contact", lang)} className="btn outline">
              {ar ? "اتصل بنا" : "Contact Us"}
            </Link>
          </div>
        </div>
      </section>

      <ServicesPage />
      <ProjectsPage />
      <ContactPage />
    </>
  );
}

function NotFoundPage() {
  const { ar, lang } = useLang();

  return (
    <section className="not-found">
      <h1>404</h1>
      <p>{ar ? "عذرًا، هذه الصفحة غير موجودة." : "Sorry, this page does not exist."}</p>
      <Link to={pagePath("", lang)} className="btn">
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
};

function App() {
  const { ar } = useLang();
  usePageMeta();

  return (
    <div className="app" dir={ar ? "rtl" : "ltr"}>
      <ScrollToTop />
      <Header />

      <main>
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
    </div>
  );
}

export default App;
