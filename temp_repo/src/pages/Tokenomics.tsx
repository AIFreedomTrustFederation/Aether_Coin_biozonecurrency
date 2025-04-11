
import React from "react";
import Navbar from "@/components/Navbar";
import TokenomicsSection from "@/components/TokenomicsSection";
import Footer from "@/components/Footer";

const Tokenomics = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <TokenomicsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Tokenomics;
