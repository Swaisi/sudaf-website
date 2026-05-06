// ==========================
// App.jsx FINAL VERSION
// ==========================

import { useState } from "react";
import "./App.css";

function App() {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      title: "Transportation Engineering & Planning",
      desc: "Advanced transport planning, mobility systems, and infrastructure strategies.",
      details:
        "Comprehensive transportation planning studies including mobility systems, transportation master plans, strategic transport corridors, public transport integration, and sustainable urban mobility solutions.",
      img: "/images/transport.jpg",
    },

    {
      title: "Traffic Engineering & Impact Studies",
      desc: "Comprehensive traffic analysis, modeling, and impact assessment.",
      details:
        "Traffic engineering studies including LOS analysis, intersection design, traffic forecasting, transportation impact studies, signalized intersections, and operational traffic assessments.",
      img: "/images/traffic.jpg",
    },

    {
      title: "Roads, Highways & Corridors",
      desc: "Design and planning of road networks and international corridors.",
      details:
        "Road geometric design, highway engineering, pavement systems, corridor planning, interchange studies, and infrastructure integration according to international standards.",
      img: "/images/road.jpg",
    },

    {
      title: "Ports & Maritime Transport",
      desc: "Specialized studies supporting maritime infrastructure and logistics.",
      details:
        "Port engineering studies, maritime transportation planning, logistics systems, container terminal analysis, and coastal infrastructure planning.",
      img: "/images/port.jpg",
    },

    {
      title: "Railway Planning",
      desc: "Rail systems planning, alignment design, and operational studies.",
      details:
        "Railway corridor studies, station planning, rail operational analysis, alignment design, signaling integration, and transportation connectivity.",
      img: "/images/railway.jpg",
    },

    {
      title: "Airport & Airside Infrastructure",
      desc: "Airport planning, apron design, and aviation infrastructure.",
      details:
        "Airport master planning, apron and taxiway design, ICAO-based studies, airside operational planning, and aviation infrastructure consultancy.",
      img: "/images/airport.jpg",
    },

    {
      title: "Traffic Simulation & Modeling",
      desc: "Advanced simulation using PTV VISSIM, SIDRA, SUMO, and other platforms.",
      details:
        "Traffic simulation and operational modeling using international software platforms including PTV VISSIM, SIDRA, SUMO, SYNCHRO, and microscopic traffic analysis tools.",
      img: "/images/traffic.jpg",
    },

    {
      title: "Infrastructure & GIS Integration",
      desc: "Integrated infrastructure solutions fully connected with GIS systems.",
      details:
        "Stormwater drainage, sewer systems, infrastructure coordination, road networks, GIS integration, utility planning, and spatial engineering systems.",
      img: "/images/environment.jpg",
    },

    {
      title: "Training & Capacity Building",
      desc: "Professional engineering and technical training programs.",
      details:
        "Professional engineering training programs in GIS, AutoCAD, Civil 3D, transportation engineering, traffic modeling, surveying, infrastructure planning, and engineering software applications.",
      img: "/images/training.jpg",
    },

    {
      title: "Building & Structural Engineering",
      desc: "Design and technical studies for buildings and structural systems.",
      details:
        "Engineering design and consultancy for buildings, reinforced concrete structures, steel structures, industrial facilities, architectural coordination, structural review, and integrated civil engineering systems.",
      img: "/images/building.jpg",
    },
  ];

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        <div className="logo-container">
          <img src="/images/logo.png" alt="logo" className="logo" />

          <div>
            <h2>Sudaf Engineering</h2>
            <span>Transport & Infrastructure Consultancy</span>
          </div>
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

          <img
            src="/images/logo.png"
            alt="logo"
            className="hero-logo"
          />

          <h1>Sudaf Engineering Consultancy</h1>

          <p>
            Specialized engineering consultancy in transport planning,
            infrastructure, traffic engineering, airports, ports,
            railways, GIS systems, and integrated infrastructure solutions.
          </p>

          <div className="hero-buttons">
            <button>Explore Services</button>
            <button className="outline">Contact Us</button>
          </div>

        </div>

      </section>

      {/* SERVICES */}
      <section className="services">

        {services.map((service, index) => (
          <div
            className="card"
            key={index}
            onClick={() => setSelectedService(service)}
          >

            <img src={service.img} alt={service.title} />

            <div className="card-content">

              <h3>{service.title}</h3>

              <p>{service.desc}</p>

              <span className="read-more">
                View Details →
              </span>

            </div>

          </div>
        ))}

      </section>

      {/* MODAL */}
      {selectedService && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedService(null)}
        >

          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >

            <img
              src={selectedService.img}
              alt={selectedService.title}
            />

            <h2>{selectedService.title}</h2>

            <p>{selectedService.details}</p>

            <button
              onClick={() => setSelectedService(null)}
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;