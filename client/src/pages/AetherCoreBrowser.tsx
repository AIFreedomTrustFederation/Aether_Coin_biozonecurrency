/**
 * AetherCore Browser Page
 * 
 * This page provides a full-featured browser interface with quantum-secure navigation
 * capabilities. It uses the AetherCoreBrowser component which has support for both
 * traditional HTTPS and quantum-secure HTTQS protocols.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Globe } from 'lucide-react';
import AetherCoreBrowser from '../components/browser/AetherCoreBrowser';
import { useLocation } from 'react-router-dom';

const AetherCoreBrowserPage = () => {
  const location = useLocation();
  const state = location.state as { initialUrl?: string } | null;
  const initialUrl = state?.initialUrl || 'httqs://www.AetherCore.trust';
  
  useEffect(() => {
    document.title = 'AetherCore Quantum Browser | Aetherion Wallet';
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AetherCore Quantum Browser</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the first quantum-secure web browser with support for both HTTQS and HTTPS protocols.
            Browse traditional websites and quantum-secure domains with state-of-the-art security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Quantum Secure</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Uses post-quantum cryptography with CRYSTALS-Kyber, FALCON, and SPHINCS+ algorithms
              to protect against quantum computer attacks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center mb-4">
              <Check className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Dual Protocol</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Seamlessly navigate between HTTQS and HTTPS sites with automatic protocol detection
              and security level indicators for each connection.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">FractalDNS</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Access .trust domains through FractalCoin's quantum-secure DNS system with
              built-in protection against man-in-the-middle attacks.
            </p>
          </motion.div>
        </div>

        <div className="bg-white p-1 rounded-lg shadow-md mb-6">
          <div className="h-[600px]">
            <AetherCoreBrowser initialUrl={initialUrl} />
          </div>
        </div>

        <div className="text-center text-gray-600 text-sm">
          <p>
            AetherCore Browser v1.0.0 | Powered by FractalCoin Network
          </p>
          <p className="mt-1">
            Featuring quantum-resistant security protocols and hybrid encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AetherCoreBrowserPage;