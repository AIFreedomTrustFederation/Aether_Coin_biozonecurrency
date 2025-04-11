
import React from "react";
import Navbar from "@/components/Navbar";
import AiCoinSection from "@/components/AiCoinSection";
import Footer from "@/components/Footer";

const Aicon = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AiCoinSection />
      </main>
      <Footer />
    </div>
  );
};

export default Aicon;
