import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  subdomain: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: string[];
  quantumSecurityLevel: number;
}

const defaultBrands: Brand[] = [
  {
    id: "aetherion",
    name: "Aetherion",
    slug: "aetherion",
    description: "The quantum-resistant blockchain ecosystem pioneering secure decentralized applications",
    logo: "/aetherion-logo.svg",
    subdomain: "atc.aifreedomtrust.com",
    colors: {
      primary: "#6a359e",
      secondary: "#4169e1",
      accent: "#8a2be2"
    },
    features: [
      "Quantum-resistant blockchain",
      "Decentralized finance ecosystem",
      "Advanced encryption",
      "Fractal reserve mechanism"
    ],
    quantumSecurityLevel: 98
  },
  {
    id: "fractalcoin",
    name: "FractalCoin",
    slug: "fractalcoin",
    description: "Revolutionary digital currency with fractal reserve technology and quantum encryption",
    logo: "/fractalcoin-logo.svg", 
    subdomain: "fractalcoin.aifreedomtrust.com",
    colors: {
      primary: "#1e3264",
      secondary: "#5a7bef",
      accent: "#00bfff"
    },
    features: [
      "Fractal reserve mechanism",
      "Quantum-secured transactions",
      "Decentralized governance",
      "Recursive validation"
    ],
    quantumSecurityLevel: 95
  },
  {
    id: "biozoe",
    name: "Biozoe",
    slug: "biozoe",
    description: "Advancing consciousness technologies through quantum computing and blockchain",
    logo: "/biozoe-logo.svg",
    subdomain: "biozoe.aifreedomtrust.com",
    colors: {
      primary: "#006400",
      secondary: "#3cb371",
      accent: "#00ff7f"
    },
    features: [
      "Quantum consciousness mapping",
      "Biofield technologies",
      "Consciousness expansion tools",
      "Regenerative health systems"
    ],
    quantumSecurityLevel: 93
  },
  {
    id: "aethercoin",
    name: "AetherCoin",
    slug: "aethercoin",
    description: "The native digital currency of the Aetherion ecosystem with advanced quantum security",
    logo: "/aethercoin-logo.svg",
    subdomain: "aethercoin.aifreedomtrust.com",
    colors: {
      primary: "#4b0082",
      secondary: "#9370db",
      accent: "#e6e6fa"
    },
    features: [
      "Instant quantum-secure transactions",
      "Zero transaction fees within ecosystem",
      "Smart contract integration",
      "Decentralized validation"
    ],
    quantumSecurityLevel: 97
  },
  {
    id: "aether-ai",
    name: "Aether AI",
    slug: "aether-ai",
    description: "Quantum-enhanced artificial intelligence platform for the Aetherion ecosystem",
    logo: "/aether-ai-logo.svg",
    subdomain: "ai.aifreedomtrust.com",
    colors: {
      primary: "#483d8b",
      secondary: "#7b68ee",
      accent: "#9370db"
    },
    features: [
      "Quantum computing optimization",
      "Decentralized AI training",
      "Blockchain-secured models",
      "Privacy-preserving inference"
    ],
    quantumSecurityLevel: 96
  }
];

export function BrandShowcaseFrame() {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  // Fetch brands from API if available
  const { data: brandsData } = useQuery({
    queryKey: ['/api/brands'],
    enabled: false, // Disabled for now, using default data
  });

  // Simulate fetching real-time quantum security metrics
  useEffect(() => {
    const simulateSecurityMetrics = () => {
      // In a real application, this would come from an API call
      const metrics: {[key: string]: number} = {};
      defaultBrands.forEach(brand => {
        // Simulate minor fluctuations in security metrics
        const baseValue = brand.quantumSecurityLevel;
        metrics[brand.id] = baseValue + (Math.random() * 2 - 1);
      });
      setSecurityMetrics(metrics);
      setLoading(false);
    };
    
    // Initial simulation
    simulateSecurityMetrics();
    
    // Update every 10 seconds
    const interval = setInterval(simulateSecurityMetrics, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Use API data if available, otherwise use default brands
  const brands = brandsData || defaultBrands;

  return (
    <div className="brand-showcase-container">
      <div className="quantum-security-banner">
        <div className="security-pulse"></div>
        <h2>Aetherion Ecosystem Quantum Security Status</h2>
        <div className="security-metrics">
          {loading ? (
            <div className="loading-container">
              <div className="quantum-loader"></div>
              <span>Syncing quantum security metrics...</span>
            </div>
          ) : (
            brands.map(brand => (
              <div key={brand.id} className="security-metric">
                <span className="metric-name">{brand.name}</span>
                <div className="metric-bar-container">
                  <div 
                    className="metric-bar" 
                    style={{
                      width: `${securityMetrics[brand.id] || brand.quantumSecurityLevel}%`,
                      background: `linear-gradient(90deg, ${brand.colors.primary}, ${brand.colors.accent})`
                    }}
                  ></div>
                </div>
                <span className="metric-value">{(securityMetrics[brand.id] || brand.quantumSecurityLevel).toFixed(1)}%</span>
              </div>
            ))
          )}
        </div>
      </div>

      <h1 className="showcase-title">Aetherion Ecosystem Brands</h1>
      
      <div className="brands-grid">
        {brands.map(brand => (
          <div 
            key={brand.id} 
            className={`brand-card ${selectedBrand?.id === brand.id ? 'selected' : ''}`}
            onClick={() => setSelectedBrand(brand)}
            style={{
              borderColor: brand.colors.primary,
              background: `linear-gradient(135deg, rgba(20, 20, 40, 0.8), rgba(10, 10, 20, 0.9))`,
              boxShadow: `0 4px 20px rgba(${parseInt(brand.colors.primary.slice(1, 3), 16)}, ${parseInt(brand.colors.primary.slice(3, 5), 16)}, ${parseInt(brand.colors.primary.slice(5, 7), 16)}, 0.3)`
            }}
          >
            <div className="brand-logo-container" style={{ background: `radial-gradient(circle, rgba(20, 20, 40, 0.4), rgba(10, 10, 20, 0.6))` }}>
              <div className="brand-logo" style={{ backgroundImage: `url(${brand.logo})` }}></div>
            </div>
            <h3 style={{ color: brand.colors.accent }}>{brand.name}</h3>
            <p className="brand-description">{brand.description}</p>
            <div className="brand-features">
              {brand.features.map((feature, index) => (
                <span key={index} className="feature-tag" style={{ background: brand.colors.primary }}>
                  {feature}
                </span>
              )).slice(0, 2)} {/* Show only the first 2 features in the card */}
              {brand.features.length > 2 && <span className="feature-more">+{brand.features.length - 2} more</span>}
            </div>
            <a 
              href={`https://${brand.subdomain}`} 
              className="brand-link"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: `linear-gradient(90deg, ${brand.colors.primary}, ${brand.colors.secondary})`,
                border: `1px solid ${brand.colors.accent}`
              }}
            >
              Visit {brand.name}
            </a>
          </div>
        ))}
      </div>

      {selectedBrand && (
        <div className="brand-detail-overlay" onClick={() => setSelectedBrand(null)}>
          <div className="brand-detail" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedBrand(null)}>×</button>
            <div className="brand-detail-header" style={{ background: `linear-gradient(135deg, ${selectedBrand.colors.primary}, ${selectedBrand.colors.secondary})` }}>
              <div className="detail-logo" style={{ backgroundImage: `url(${selectedBrand.logo})` }}></div>
              <h2>{selectedBrand.name}</h2>
            </div>
            <div className="brand-detail-content">
              <p className="detail-description">{selectedBrand.description}</p>
              <div className="security-level">
                <h4>Quantum Security Level</h4>
                <div className="security-bar-container">
                  <div 
                    className="security-bar"
                    style={{
                      width: `${securityMetrics[selectedBrand.id] || selectedBrand.quantumSecurityLevel}%`,
                      background: `linear-gradient(90deg, ${selectedBrand.colors.primary}, ${selectedBrand.colors.accent})`
                    }}
                  ></div>
                </div>
                <span className="security-value">{(securityMetrics[selectedBrand.id] || selectedBrand.quantumSecurityLevel).toFixed(1)}%</span>
              </div>
              <h4>Features</h4>
              <div className="detail-features">
                {selectedBrand.features.map((feature, index) => (
                  <div key={index} className="detail-feature">
                    <div className="feature-icon" style={{ background: selectedBrand.colors.primary }}>✓</div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <a 
                href={`https://${selectedBrand.subdomain}`} 
                className="detail-link"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: `linear-gradient(90deg, ${selectedBrand.colors.primary}, ${selectedBrand.colors.secondary})`,
                  border: `1px solid ${selectedBrand.colors.accent}`
                }}
              >
                Visit {selectedBrand.name} Portal
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .brand-showcase-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          color: #ffffff;
          font-family: 'Arial', sans-serif;
        }
        
        .quantum-security-banner {
          background: linear-gradient(135deg, rgba(10, 16, 31, 0.8), rgba(18, 26, 58, 0.9));
          border-radius: 10px;
          padding: 1rem 2rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        
        .security-pulse {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(138, 43, 226, 0.2), transparent 70%);
          right: -50px;
          top: -50px;
          animation: pulse 4s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.2; }
        }
        
        .quantum-security-banner h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(90deg, #8a2be2, #4169e1);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          position: relative;
        }
        
        .security-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        
        .security-metric {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .metric-name {
          width: 120px;
          font-size: 0.9rem;
          text-align: right;
        }
        
        .metric-bar-container {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .metric-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease-out;
        }
        
        .metric-value {
          width: 50px;
          font-size: 0.9rem;
          font-weight: bold;
        }
        
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          height: 100px;
        }
        
        .quantum-loader {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(138, 43, 226, 0.3);
          border-top: 3px solid #8a2be2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .showcase-title {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
          background: linear-gradient(90deg, #8a2be2, #4169e1);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .brands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .brand-card {
          border-radius: 10px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid transparent;
          height: 100%;
        }
        
        .brand-card:hover {
          transform: translateY(-5px);
        }
        
        .brand-card.selected {
          transform: scale(1.02);
        }
        
        .brand-logo-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .brand-logo {
          width: 60px;
          height: 60px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        
        .brand-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.8rem;
        }
        
        .brand-description {
          margin-bottom: 1.5rem;
          flex-grow: 1;
          opacity: 0.9;
          line-height: 1.5;
        }
        
        .brand-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .feature-tag {
          display: inline-block;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          color: white;
        }
        
        .feature-more {
          font-size: 0.8rem;
          opacity: 0.7;
          align-self: center;
        }
        
        .brand-link {
          padding: 0.8rem 1.2rem;
          border-radius: 5px;
          text-align: center;
          color: white;
          font-weight: bold;
          text-decoration: none;
          transition: all 0.3s ease;
          display: block;
        }
        
        .brand-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }
        
        .brand-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        
        .brand-detail {
          background: linear-gradient(135deg, rgba(20, 20, 40, 0.9), rgba(10, 10, 20, 0.95));
          border-radius: 12px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        .brand-detail-header {
          padding: 2rem;
          border-radius: 12px 12px 0 0;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .detail-logo {
          width: 80px;
          height: 80px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          padding: 0.5rem;
        }
        
        .brand-detail-header h2 {
          font-size: 2rem;
          color: white;
          margin: 0;
        }
        
        .brand-detail-content {
          padding: 2rem;
        }
        
        .detail-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        
        .security-level {
          margin-bottom: 2rem;
        }
        
        .security-level h4 {
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }
        
        .security-bar-container {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .security-bar {
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s ease-out;
        }
        
        .security-value {
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .detail-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .detail-feature {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        
        .feature-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: white;
        }
        
        .detail-link {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          text-align: center;
          color: white;
          font-weight: bold;
          text-decoration: none;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: block;
        }
        
        .detail-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        
        /* Media Queries */
        @media (max-width: 768px) {
          .brands-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
          
          .brand-detail {
            width: 95%;
          }
          
          .brand-detail-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .detail-features {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .brand-showcase-container {
            padding: 1rem;
          }
          
          .brands-grid {
            grid-template-columns: 1fr;
          }
          
          .metric-name {
            width: 90px;
            font-size: 0.8rem;
          }
          
          .showcase-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default BrandShowcaseFrame;