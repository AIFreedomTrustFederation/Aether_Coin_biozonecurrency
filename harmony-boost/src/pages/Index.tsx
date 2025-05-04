
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import DualitySection from "@/components/DualitySection";
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
        <FeatureSection />
        <DualitySection />
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
