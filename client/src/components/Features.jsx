import React from "react";
import {
  FaProjectDiagram,
  FaShieldAlt,
  FaRobot,
  FaCode,
  FaNetworkWired,
  FaChartLine,
} from "react-icons/fa";

const features = [
  {
    icon: <FaProjectDiagram />,
    title: "Architecture Analyzer",
    desc: "Detect MVC, Microservices, Clean Architecture and project structure."
  },
  {
    icon: <FaShieldAlt />,
    title: "Security Scanner",
    desc: "Find vulnerabilities, hardcoded secrets and security risks."
  },
  {
    icon: <FaNetworkWired />,
    title: "Knowledge Graph",
    desc: "Visual dependency mapping of complete repository."
  },
  {
    icon: <FaRobot />,
    title: "AI Repository Chat",
    desc: "Ask anything about uploaded project and get instant answers."
  },
  {
    icon: <FaCode />,
    title: "Execution Flow",
    desc: "Understand request lifecycle from frontend to database."
  },
  {
    icon: <FaChartLine />,
    title: "CTO Report",
    desc: "Business readiness, scalability and technical debt analysis."
  }
];

function Features() {
  return (
    <section className="features-section">

      <h2>
        Powerful AI Features
      </h2>

      <p>
        Everything required to understand,
        improve and scale any codebase.
      </p>

      <div className="features-grid">

        {features.map((item, index) => (
          <div
            key={index}
            className="feature-card"
          >
            <div className="feature-icon">
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.desc}</p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Features;