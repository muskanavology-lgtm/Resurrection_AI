import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import UploadZone from "../components/UploadZone";

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <UploadZone />
    </>
  );
}

export default LandingPage;