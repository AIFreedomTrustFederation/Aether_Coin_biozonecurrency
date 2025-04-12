/**
 * Domain Proxy Routes
 * 
 * This file defines routes that can be accessed using regular browsers
 * to proxy content that would normally be accessed through our custom HTTQS browser.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

/**
 * Proxy for atc.aifreedomtrust.com domain
 * 
 * This route simulates what would be returned when visiting atc.aifreedomtrust.com
 * through a quantum-secured browser. It allows access through regular browsers.
 */
router.get('/atc.aifreedomtrust.com/*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Freedom Trust - ATC Portal</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .security-badge {
          background-color: #10b981;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          margin: 0 auto;
        }
        .security-badge svg {
          margin-right: 5px;
        }
        main {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          main {
            grid-template-columns: 1fr 1fr;
          }
        }
        .service-card {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .service-list {
          background-color: #f3f4f6;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .service-list ul {
          padding-left: 20px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.8rem;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          margin-top: 10px;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .button-outline {
          display: inline-block;
          background-color: transparent;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          margin-top: 10px;
          transition: background-color 0.2s, color 0.2s;
        }
        .button-outline:hover {
          background-color: #3b82f6;
          color: white;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>AI Freedom Trust - ATC Portal</h1>
        <p>Welcome to the AI Freedom Trust ATC Portal</p>
        <div class="security-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Quantum-Secure Connection
        </div>
      </header>
      
      <div class="service-list">
        <h2>ATC Services</h2>
        <ul>
          <li>Aetherion Wallet Access</li>
          <li>Fractal Reserve Banking</li>
          <li>Quantum-Secure Communications</li>
          <li>AIcoin Mining Dashboard</li>
          <li>Decentralized Identity Management</li>
        </ul>
      </div>
      
      <main>
        <div class="service-card">
          <h3>Wallet Access</h3>
          <p>Access your Aetherion quantum-resistant wallet with fractal sharding security.</p>
          <p>Manage your digital assets with advanced security measures that protect against both classical and quantum computing attacks.</p>
          <a href="#" class="button">Launch Wallet</a>
        </div>
        
        <div class="service-card">
          <h3>DAPP Portal</h3>
          <p>Access decentralized applications secured by the FractalCoin network.</p>
          <p>Connect to a growing ecosystem of decentralized apps with quantum-resistant security built-in.</p>
          <a href="#" class="button">Open DAPP Portal</a>
        </div>
        
        <div class="service-card">
          <h3>Fractal Reserve Banking</h3>
          <p>Experience a new paradigm in digital asset banking with our fractal reserve system.</p>
          <p>Participate in a system designed for equitable returns regardless of when you entered.</p>
          <a href="#" class="button-outline">Learn More</a>
        </div>
        
        <div class="service-card">
          <h3>AIcoin Mining</h3>
          <p>Mine AIcoin through our revolutionary "Death & Resurrection" protocol.</p>
          <p>Contribute computing resources and earn rewards through our mathematically balanced system.</p>
          <a href="#" class="button-outline">Start Mining</a>
        </div>
      </main>
      
      <div class="footer">
        <p>ATC Portal v1.0.0 | Powered by FractalCoin Network</p>
        <p>Featuring quantum-resistant security protocols and hybrid encryption</p>
        <p><a href="/">Return to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

/**
 * Proxy for freedomtrust.com domain
 */
router.get('/freedomtrust.com/*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Freedom Trust</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .security-badge {
          background-color: #10b981;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          margin: 0 auto;
        }
        .security-badge svg {
          margin-right: 5px;
        }
        main {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.8rem;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          text-decoration: none;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Freedom Trust</h1>
        <p>Securing digital freedom through quantum-resistant technologies</p>
        <div class="security-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Quantum-Secure Connection
        </div>
      </header>
      
      <main>
        <h2>Welcome to Freedom Trust</h2>
        <p>
          Freedom Trust is dedicated to preserving digital freedom and privacy through
          the development and implementation of quantum-resistant technologies.
        </p>
        <p>
          Our mission is to create a secure digital future where everyone has access
          to privacy-preserving tools and technologies that can withstand even the
          most advanced computational threats.
        </p>
        
        <h3>Our Initiatives</h3>
        <ul>
          <li>Development of quantum-resistant cryptographic algorithms</li>
          <li>Implementation of secure digital identity solutions</li>
          <li>Creation of privacy-preserving communication protocols</li>
          <li>Research into advanced security technologies</li>
          <li>Education and awareness programs</li>
        </ul>
        
        <a href="/atc.aifreedomtrust.com" class="button">Visit ATC Portal</a>
      </main>
      
      <div class="footer">
        <p>Freedom Trust | Pioneering Quantum-Resistant Technologies</p>
        <p><a href="/">Return to Home</a></p>
      </div>
    </body>
    </html>
  `);
});

export default router;