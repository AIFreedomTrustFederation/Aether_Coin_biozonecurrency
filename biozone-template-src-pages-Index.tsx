import React from "react"
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import FeatureSection from "../components/FeatureSection"
import AboutSection from "../components/AboutSection"
import CosmicShiftSection from "../components/CosmicShiftSection"
import SacredGeometrySection from "../components/SacredGeometrySection"
import ConsciousnessPortal from "../components/ConsciousnessPortal"
import QuantumLoaderShowcase from "../components/QuantumLoaderShowcase"
import TechnologySection from "../components/TechnologySection"
import Footer from "../components/Footer"

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <AboutSection />
        <CosmicShiftSection />
        <SacredGeometrySection />
        <ConsciousnessPortal />
        <QuantumLoaderShowcase />
        <TechnologySection />
      </main>
      <Footer />
    </div>
  )
}

export default Index