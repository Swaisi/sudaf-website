import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
  const [lang, setLang] = useState("en");
  const [selectedService, setSelectedService] = useState(null);
  const ar = lang === "ar";

  const services = [
    {
      title: "Transportation Engineering & Planning",
      titleAr: "هندسة وتخطيط النقل",
      desc: "Advanced transport planning, mobility systems, and infrastructure strategies.",
      descAr: "تخطيط النقل، أنظمة الحركة، واستراتيجيات البنية التحتية.",
      img: "/images/transport.jpg",
      details: [
        "Transport master plans and strategic mobility studies.",
        "Travel demand forecasting and network assessment.",
        "Public transport integration and multimodal planning.",
        "Accessibility, mobility, and urban transport policy support.",
      ],
      detailsAr: [
        "إعداد مخططات النقل الرئيسية والدراسات الاستراتيجية للحركة.",
        "التنبؤ بالطلب المروري وتقييم شبكات النقل.",
        "دمج النقل العام والتخطيط متعدد الوسائط.",
        "دعم سياسات الوصول والحركة والنقل الحضري.",
      ],
    },
    {
      title: "Traffic Engineering & Impact Studies",
      titleAr: "هندسة المرور ودراسات الأثر المروري",
      desc: "Comprehensive traffic analysis, modeling, and impact assessment.",
      descAr: "تحليل مروري شامل، نمذجة، ودراسات أثر مروري.",
      img: "/images/traffic.jpg",
      details: [
        "Traffic impact assessments for developments and infrastructure projects.",
        "Intersection capacity and level-of-service analysis.",
        "Traffic surveys, turning counts, queue and delay studies.",
        "Signalized intersections, roundabouts, and access management review.",
      ],
      detailsAr: [
        "دراسات الأثر المروري للمشاريع التطويرية والبنية التحتية.",
        "تحليل سعة التقاطعات ومستوى الخدمة.",
        "العدّ المروري، حركات الالتفاف، الطوابير، والتأخير.",
        "مراجعة الإشارات المرورية والدوارات وإدارة المداخل.",
      ],
    },
    {
      title: "Roads, Highways & Corridors",
      titleAr: "الطرق والطرق السريعة والممرات الدولية",
      desc: "Design and planning of road networks and international corridors.",
      descAr: "تخطيط وتصميم شبكات الطرق والممرات الدولية.",
      img: "/images/road.jpg",
      details: [
        "Road network planning and geometric design review.",
        "Highway corridors and strategic route studies.",
        "Pavement planning and road infrastructure integration.",
        "Access roads, junctions, and corridor development studies.",
      ],
      detailsAr: [
        "تخطيط شبكات الطرق ومراجعة التصميم الهندسي.",
        "دراسات الطرق السريعة والممرات الاستراتيجية.",
        "تخطيط الرصف وربط البنية التحتية للطرق.",
        "دراسات المداخل والتقاطعات وتطوير الممرات.",
      ],
    },
    {
      title: "Ports & Maritime Transport",
      titleAr: "الموانئ والنقل البحري",
      desc: "Specialized studies supporting maritime infrastructure and logistics.",
      descAr: "دراسات متخصصة للبنية التحتية البحرية واللوجستية.",
      img: "/images/port.jpg",
      details: [
        "Port access and freight movement studies.",
        "Logistics interface between ports, roads, and industrial areas.",
        "Heavy vehicle circulation and terminal connectivity.",
        "Maritime transport planning and cargo movement assessment.",
      ],
      detailsAr: [
        "دراسات مداخل الموانئ وحركة البضائع.",
        "الربط اللوجستي بين الموانئ والطرق والمناطق الصناعية.",
        "تحليل حركة الشاحنات الثقيلة وربط المحطات.",
        "تخطيط النقل البحري وتقييم حركة الشحن.",
      ],
    },
    {
      title: "Railway Planning",
      titleAr: "تخطيط السكك الحديدية",
      desc: "Rail systems planning, alignment design, and operational studies.",
      descAr: "تخطيط أنظمة السكك الحديدية والمسارات والتشغيل.",
      img: "/images/railway.jpg",
      details: [
        "Railway corridor planning and route assessment.",
        "Passenger and freight rail system studies.",
        "Station access and intermodal connectivity.",
        "Integration of railway systems with ports, roads, and urban areas.",
      ],
      detailsAr: [
        "تخطيط ممرات السكك الحديدية وتقييم المسارات.",
        "دراسات نقل الركاب والبضائع بالسكك الحديدية.",
        "دراسة الوصول للمحطات والربط متعدد الوسائط.",
        "دمج السكك الحديدية مع الموانئ والطرق والمناطق الحضرية.",
      ],
    },
    {
      title: "Airport & Airside Infrastructure",
      titleAr: "المطارات والبنية التحتية الجوية",
      desc: "Airport planning, apron design, and aviation infrastructure.",
      descAr: "تخطيط المطارات والساحات والبنية التحتية الجوية.",
      img: "/images/airport.jpg",
      details: [
        "Airport access and landside/airside circulation studies.",
        "Apron, taxiway, and operational infrastructure planning.",
        "Passenger, cargo, and service movement assessment.",
        "Technical support for aviation-related infrastructure projects.",
      ],
      detailsAr: [
        "دراسات الوصول للمطارات وحركة الجانب الأرضي والجوي.",
        "تخطيط الساحات وممرات الطائرات والبنية التشغيلية.",
        "تقييم حركة الركاب والبضائع والخدمات.",
        "الدعم الفني لمشاريع البنية التحتية المرتبطة بالطيران.",
      ],
    },
    {
      title: "Traffic Simulation & Modeling",
      titleAr: "المحاكاة والنمذجة المرورية",
      desc: "Advanced simulation using PTV VISSIM, SIDRA, SUMO, and other platforms.",
      descAr: "محاكاة مرورية متقدمة باستخدام VISSIM وSIDRA وSUMO وغيرها.",
      img: "/images/traffic-simulation.jpg",
      details: [
        "Microscopic and macroscopic traffic simulation.",
        "PTV VISSIM, SIDRA, SUMO, Synchro and similar platforms.",
        "Signal optimization and operational scenario testing.",
        "Congestion analysis, queue assessment, and visual simulation outputs.",
      ],
      detailsAr: [
        "محاكاة مرورية مجهرية وكلية للظواهر المرورية.",
        "استخدام برامج مثل PTV VISSIM وSIDRA وSUMO وSynchro.",
        "تحسين الإشارات واختبار السيناريوهات التشغيلية.",
        "تحليل الازدحام والطوابير وإخراج نماذج مرئية للمحاكاة.",
      ],
    },
    {
      title: "Infrastructure & GIS Integration",
      titleAr: "البنية التحتية والتكامل مع GIS",
      desc: "Integrated infrastructure solutions fully connected with GIS systems.",
      descAr: "حلول بنية تحتية متكاملة مرتبطة بأنظمة GIS.",
      img: "/images/infrastructure-gis.jpg",
      details: [
        "Stormwater drainage, sewer networks, and road infrastructure planning.",
        "GIS-based infrastructure mapping and spatial analysis.",
        "Utility coordination and infrastructure database development.",
        "Integration of civil engineering design outputs with digital maps.",
      ],
      detailsAr: [
        "تخطيط شبكات تصريف مياه الأمطار والصرف الصحي والطرق.",
        "إعداد خرائط البنية التحتية والتحليل المكاني باستخدام GIS.",
        "تنسيق المرافق وإعداد قواعد بيانات البنية التحتية.",
        "ربط مخرجات التصميم المدني بالخرائط الرقمية.",
      ],
    },
    {
      title: "Tendering, RFP & Project Documentation",
      titleAr: "إعداد مستندات الطرح والعروض الفنية",
      desc: "Preparation of RFPs, tender documents, BOQs, method statements, HSE, QA/QC, and project schedules.",
      descAr:
        "إعداد مستندات الطرح، عروض التقديم، جداول الكميات، أساليب التنفيذ، خطط السلامة والجودة، والجداول الزمنية.",
      img: "/images/tender-documents.jpg",
      details: [
        "Preparation of Request for Proposal (RFP), tender documents, and instructions to bidders.",
        "Preparation of Bills of Quantities (BOQ), quantity take-off, measurement sheets, and pricing schedules.",
        "Preparation of technical proposals, project execution methodology, method statements, and work procedures.",
        "Preparation of HSE plans, risk assessments, job safety analysis, and site safety documentation.",
        "Preparation of QA/QC plans, inspection and test plans (ITP), checklists, material submittals, and quality documentation.",
        "Preparation of project schedules using Primavera P6 and Microsoft Project.",
        "Baseline programs, activity sequencing, resource loading, cash flow planning, and progress monitoring reports.",
        "Tender review, clarification registers, compliance matrices, and technical-commercial submission support.",
      ],
      detailsAr: [
        "إعداد طلبات تقديم العروض RFP ومستندات الطرح وتعليمات مقدمي العروض.",
        "إعداد جداول الكميات BOQ وأعمال الحصر والكشف والقياس وجداول التسعير.",
        "إعداد العروض الفنية ومنهجيات التنفيذ وأساليب العمل والإجراءات التنفيذية.",
        "إعداد خطط الصحة والسلامة والبيئة HSE وتقييم المخاطر وتحليل السلامة للأنشطة والمستندات الخاصة بالموقع.",
        "إعداد خطط الجودة QA/QC وخطط الفحص والاختبار ITP ونماذج التفتيش واعتمادات المواد ومستندات ضبط الجودة.",
        "إعداد الجداول الزمنية للمشاريع باستخدام Primavera P6 و Microsoft Project.",
        "إعداد البرامج الزمنية الأساسية وتسلسل الأنشطة وتحميل الموارد والتدفقات النقدية وتقارير متابعة التقدم.",
        "مراجعة مستندات المناقصات، إعداد سجل الاستفسارات، مصفوفة المطابقة، ودعم تجهيز العرض الفني والمالي.",
      ],
    },
    {
      title: "Training & Capacity Building",
      titleAr: "التدريب وبناء القدرات",
      desc: "Professional engineering and technical training programs.",
      descAr: "برامج تدريب هندسية وفنية احترافية.",
      img: "/images/training.jpg",
      details: [
        "Training in GIS, AutoCAD, Civil 3D, and surveying applications.",
        "Transportation engineering and traffic planning courses.",
        "Traffic modeling software training including VISSIM, SIDRA, and SUMO.",
        "Practical workshops based on real engineering projects.",
      ],
      detailsAr: [
        "دورات في GIS وAutoCAD وCivil 3D وتطبيقات الرفع المساحي.",
        "دورات في هندسة وتخطيط النقل والتحليل المروري.",
        "تدريب على برامج النمذجة المرورية مثل VISSIM وSIDRA وSUMO.",
        "ورش عملية مبنية على مشاريع هندسية واقعية.",
      ],
    },
    {
      title: "Building & Structural Engineering",
      titleAr: "تصميم المباني والمنشآت",
      desc: "Design and technical studies for buildings and structural systems.",
      descAr: "تصميم ودراسات فنية للمباني والأنظمة الإنشائية.",
      img: "/images/building.jpg",
      details: [
        "Conceptual and detailed design support for buildings and civil structures.",
        "Reinforced concrete and steel structure design coordination.",
        "Structural review, quantity assessment, and technical documentation.",
        "Integration with site development, roads, utilities, and infrastructure works.",
      ],
      detailsAr: [
        "دعم التصميم الابتدائي والتفصيلي للمباني والمنشآت المدنية.",
        "تنسيق تصميم المنشآت الخرسانية والمعدنية.",
        "المراجعة الإنشائية وحصر الكميات وإعداد المستندات الفنية.",
        "الربط مع أعمال الموقع والطرق والمرافق والبنية التحتية.",
      ],
    },
  ];

  const ServicesPage = () => (
    <section className="services" id="services">
      {services.map((service, index) => (
        <div
          className="card"
          key={index}
          onClick={() => setSelectedService(service)}
        >
          <img src={service.img} alt={ar ? service.titleAr : service.title} />
          <div className="card-content">
            <h3>{ar ? service.titleAr : service.title}</h3>
            <p>{ar ? service.descAr : service.desc}</p>
            <span className="read-more">
              {ar ? "عرض التفاصيل ←" : "View Details →"}
            </span>
          </div>
        </div>
      ))}
    </section>
  );

  const AboutPage = () => (
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

  const ProjectsPage = () => (
    <section className="projects-section">
      <h2>{ar ? "المشاريع" : "Projects"}</h2>
      <p>
        {ar
          ? "سيتم قريبًا عرض نماذج من مشاريع الشركة وخبراتها الفنية في مجالات النقل والبنية التحتية والدراسات الهندسية."
          : "Selected company projects and technical experience in transport, infrastructure, and engineering studies will be published soon."}
      </p>
    </section>
  );

  const ContactPage = () => (
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

          <p>{ar ? "الهاتف:" : "Phone:"} +218914054929</p>
          <p>{ar ? "الهاتف:" : "Phone:"} +218915718567</p>
          <p>{ar ? "البريد العام:" : "General Email:"} info@sudaf.ly</p>
          <p>{ar ? "الدراسات والتصاميم:" : "Studies & Designs:"} radwan@sudaf.ly</p>

          <p>
            {ar ? "إحداثيات الموقع:" : "Coordinates:"} 32°21'47.3"N
            15°04'44.4"E
          </p>

          <a
            href="https://maps.app.goo.gl/wbtTLSKjN8kTN2269"
            target="_blank"
            rel="noreferrer"
            className="map-link"
          >
            {ar ? "فتح الموقع على خرائط Google" : "Open Location on Google Maps"}
          </a>
        </div>

        <form
          className="contact-form"
          action="https://formsubmit.co/info@sudaf.ly"
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
            required
          />

          <input
            type="email"
            name="email"
            placeholder={ar ? "البريد الإلكتروني" : "Your Email"}
            required
          />

          <textarea
            name="message"
            rows="6"
            placeholder={ar ? "اكتب رسالتك هنا" : "Write your message here"}
            required
          ></textarea>

          <button type="submit">{ar ? "إرسال الرسالة" : "Send Message"}</button>
        </form>
      </div>
    </section>
  );

  const HomePage = () => (
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
            <Link to="/services">
              <button>{ar ? "استعراض الخدمات" : "Explore Services"}</button>
            </Link>

            <Link to="/contact">
              <button className="outline">{ar ? "اتصل بنا" : "Contact Us"}</button>
            </Link>
          </div>
        </div>
      </section>

      <ServicesPage />
      <ProjectsPage />
      <ContactPage />
    </>
  );

  return (
    <div className="app" dir={ar ? "rtl" : "ltr"}>
      <header className="header">
        <Link to="/" className="logo-container">
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

        <nav>
          <Link className="nav-link" to="/">
            {ar ? "الرئيسية" : "Home"}
          </Link>

          <Link className="nav-link" to="/about">
            {ar ? "من نحن" : "About Us"}
          </Link>

          <Link className="nav-link" to="/services">
            {ar ? "الخدمات" : "Services"}
          </Link>

          <Link className="nav-link" to="/projects">
            {ar ? "المشاريع" : "Projects"}
          </Link>

          <Link className="nav-link" to="/contact">
            {ar ? "اتصل بنا" : "Contact"}
          </Link>

          <button className="lang-btn" onClick={() => setLang(ar ? "en" : "ar")}>
            {ar ? "English" : "العربية"}
          </button>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>

      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedService.img}
              alt={ar ? selectedService.titleAr : selectedService.title}
            />
            <h2>{ar ? selectedService.titleAr : selectedService.title}</h2>
            <p>{ar ? selectedService.descAr : selectedService.desc}</p>

            <h4>{ar ? "نطاق الخدمات" : "Service Scope"}</h4>
            <ul>
              {(ar ? selectedService.detailsAr : selectedService.details).map(
                (item, i) => (
                  <li key={i}>{item}</li>
                )
              )}
            </ul>

            <button onClick={() => setSelectedService(null)}>
              {ar ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;