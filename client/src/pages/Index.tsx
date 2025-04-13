
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FractalHeroSection from "@/components/FractalHeroSection";
import FeatureSection from "@/components/FeatureSection";
import DualitySection from "@/components/DualitySection";
import BioZoeSection from "@/components/BioZoeSection";
import SacredGeometrySection from "@/components/SacredGeometrySection";
import DashboardSection from "@/components/DashboardSection";
import PresaleSection from "@/components/PresaleSection";
import GitHubSection from "@/components/GitHubSection";
import WalletSection from "@/components/WalletSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FractalHeroSection />
        <FeatureSection />
        <DualitySection />
        <BioZoeSection />
        <SacredGeometrySection />
        <DashboardSection />
        <WalletSection />
        <GitHubSection />
        <PresaleSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
