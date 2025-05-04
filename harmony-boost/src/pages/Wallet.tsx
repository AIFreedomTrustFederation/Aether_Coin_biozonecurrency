
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const WALLET_APP_URL = "https://atc.aifreedomtrust.com/wallet"; // Updated wallet app URL

const Wallet = () => {
  useEffect(() => {
    // Redirect to the external wallet app
    window.location.href = WALLET_APP_URL;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-forest-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-forest-800">Redirecting to Aether Wallet...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wallet;
