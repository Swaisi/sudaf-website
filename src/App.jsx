import "./App.css";

function App() {
  const services = [
    {
      title: "Transportation Engineering & Planning",
      desc: "Advanced transport planning, mobility systems, and infrastructure strategies.",
      img: "/images/transport.jpg",
    },
    {
      title: "Traffic Engineering & Impact Studies",
      desc: "Comprehensive traffic analysis, modeling, and impact assessment.",
      img: "/images/traffic.jpg",
    },
    {
      title: "Roads, Highways & Corridors",
      desc: "Design and planning of road networks and international corridors.",
      img: "/images/road.jpg",
    },
    {
      title: "Ports & Maritime Transport",
      desc: "Specialized studies supporting maritime infrastructure and logistics.",
      img: "/images/port.jpg",
    },
    {
      title: "Railway Planning",
      desc: "Rail systems planning, alignment design, and operational studies.",
      img: "/images/railway.jpg",
    },
    {
      title: "Airport & Airside Infrastructure",
      desc: "Airport planning, apron design, and aviation infrastructure.",
      img: "/images/airport.jpg",
    },

    // ✅ NEW 1
    {
      title: "Traffic Simulation & Modeling",
      desc: "Advanced simulation of traffic phenomena using industry-leading software such as PTV VISSIM, SIDRA, SUMO, and other modeling platforms.",
      img: "/images/traffic.jpg",
    },

    // ✅ NEW 2
    {
      title: "Infrastructure & GIS Integration",
      desc: "Integrated infrastructure solutions including stormwater drainage, road design, sewer networks, and spatial planning fully integrated with GIS systems.",
      img: "/images/environment.jpg",
    },

    // ✅ NEW 3
    {
      title: "Training & Capacity Building",
      desc: "Professional training programs in GIS, AutoCAD, Civil 3D, traffic modeling, transportation planning, and surveying to enhance engineering capabilities.",
      img: "/images/training.jpg",
    },
  ];

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src="/images/logo.png" alt="logo" />
          <span>Sudaf Engineering</span>
        </div>

        <nav>
          <a href="#">Home</a>
          <a href="#">Services</a>
          <a href="#">Projects</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="overlay"></div>

        <div className="hero-content">
          <img src="/images/logo.png" className="hero-logo" />

          <h1>Sudaf Engineering Consultancy</h1>

          <p>
            Specialized engineering consultancy in transport planning, traffic
            studies, roads, ports, airports, railways, logistics, and
            infrastructure.
          </p>

          <div className="buttons">
            <button>Explore Services</button>
            <button className="outline">Contact Us</button>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services">
        {services.map((s, i) => (
          <div className="card" key={i}>
            <img src={s.img} />
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;