import React from "react";
import { motion } from "framer-motion";

function Hero() {
  return (
    <section className="hero">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="badge">
          AI Powered Repository Intelligence
        </span>
      </motion.div>

      <motion.h1
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        Understand Any
        <span className="gradient">
          {" "}Codebase
        </span>

        <br />

        In Seconds
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Upload any repository and instantly
        get architecture analysis, security
        audits, dependency graphs,
        execution flows, CTO reports,
        AI explanations and feature planning.
      </motion.p>

      <div className="hero-buttons">
        <button className="primary-btn">
          Upload Repository
        </button>

        <button className="secondary-btn">
          Watch Demo
        </button>
      </div>

    </section>
  );
}

export default Hero;