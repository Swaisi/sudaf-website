import { useState } from "react";
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

  return (
    <div className="app" dir={ar ? "rtl" : "ltr"}>
      <header className="header">
        <div className="logo-container">
          <img src="/logo.svg" alt="Sudaf Logo" className="logo" />
          <div>
            <h2>{ar ? "سدف للاستشارات الهندسية" : "Sudaf Engineering"}</h2>
            <span>
              {ar
                ? "استشارات النقل والبنية التحتية"
                : "Transport & Infrastructure Consultancy"}
            </span>
          </div>
        </div>

        <nav>
          <a href="#home">{ar ? "الرئيسية" : "Home"}</a>
          <a href="#services">{ar ? "الخدمات" : "Services"}</a>
          <a href="#projects">{ar ? "المشاريع" : "Projects"}</a>
          <a href="#contact">{ar ? "اتصل بنا" : "Contact"}</a>
          <button className="lang-btn" onClick={() => setLang(ar ? "en" : "ar")}>
            {ar ? "English" : "العربية"}
          </button>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <img src="/logo.svg" alt="Sudaf Logo" className="hero-logo" />
          <h1>{ar ? "شركة سدف للاستشارات الهندسية" : "Sudaf Engineering Consultancy"}</h1>
          <p>
            {ar
              ? "استشارات هندسية متخصصة في تخطيط النقل، البنية التحتية، هندسة المرور، المطارات، الموانئ، السكك الحديدية، أنظمة GIS، والحلول الهندسية المتكاملة."
              : "Specialized engineering consultancy in transport planning, infrastructure, traffic engineering, airports, ports, railways, GIS systems, and integrated engineering solutions."}
          </p>
          <div className="hero-buttons">
            <a href="#services">
              <button>{ar ? "استعراض الخدمات" : "Explore Services"}</button>
            </a>
            <a href="#contact">
              <button className="outline">{ar ? "اتصل بنا" : "Contact Us"}</button>
            </a>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        {services.map((service, index) => (
          <div className="card" key={index} onClick={() => setSelectedService(service)}>
            <img src={service.img} alt={ar ? service.titleAr : service.title} />
            <div className="card-content">
              <h3>{ar ? service.titleAr : service.title}</h3>
              <p>{ar ? service.descAr : service.desc}</p>
              <span className="read-more">{ar ? "عرض التفاصيل ←" : "View Details →"}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="contact-section" id="contact">
        <h2>{ar ? "اتصل بنا" : "Contact Us"}</h2>
        <p>
          {ar
            ? "للاستشارات أو طلب الدراسات الفنية أو فرص الشراكة، يمكنكم التواصل معنا."
            : "For consultancy requests, technical studies, or partnership opportunities, contact us below."}
        </p>
        <a href="mailto:radwan@sudaf.ly" className="email-link">radwan@sudaf.ly</a>
      </section>

      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img src={selectedService.img} alt={ar ? selectedService.titleAr : selectedService.title} />
            <h2>{ar ? selectedService.titleAr : selectedService.title}</h2>
            <p>{ar ? selectedService.descAr : selectedService.desc}</p>

            <h4>{ar ? "نطاق الخدمات" : "Service Scope"}</h4>
            <ul>
              {(ar ? selectedService.detailsAr : selectedService.details).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
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