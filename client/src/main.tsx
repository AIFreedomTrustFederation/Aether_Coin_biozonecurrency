import React from 'react';
import ReactDOM from 'react-dom/client';
import './preview.css';

const source = 'https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency/blob/main/';
const wallet = window.location.pathname.startsWith('/wallet');
function FrontendPreview() {
  return <div className="preview-shell">
    <header><a className="brand" href="/dapp">Aetherion</a><nav aria-label="Main navigation"><a href="/dapp" aria-current={!wallet ? 'page' : undefined}>Protocol</a><a href="/wallet" aria-current={wallet ? 'page' : undefined}>Wallet</a><a href={source + 'README.md'}>Repository</a></nav></header>
    <main>
      <p className="eyebrow">AI Freedom Trust Federation · Biozoe protocol</p>
      <h1>{wallet ? 'Aetherion UI Wallet' : 'Value in service of life.'}</h1>
      <p className="intro">Unbounded monetary possibility. Bounded issuance authority. Equal human standing.</p>
      <aside role="status"><strong>Frontend-only preview</strong><p>Financial services are unavailable. This interface does not connect a wallet, sign transactions, accept deposits, or settle payments. Aetherion is not yet a live, audited mainnet.</p></aside>
      <section aria-labelledby="capabilities"><h2 id="capabilities">{wallet ? 'Wallet capabilities' : 'Aetherion in development'}</h2><div className="cards">
        <article><span className="symbol" aria-hidden="true">◈</span><h3>AetherCoin · ATC</h3><p>The native currency of the planned Aetherion Layer 1. No account balance or market price is asserted by this preview.</p><button disabled>Connect wallet — unavailable</button></article>
        <article><span className="symbol" aria-hidden="true">↗</span><h3>Consent before action</h3><p>Signing, transfers, payments, custody, and exchange require separately implemented and reviewed services.</p><button disabled>Send ATC — unavailable</button><button disabled>Make payment — unavailable</button></article>
        <article><span className="symbol" aria-hidden="true">◎</span><h3>Inspect the protocol</h3><p>Explore the deterministic reference specification, constitutional safeguards, and implementation boundaries.</p><a href={source + 'WHITEPAPER.md'}>Read the whitepaper →</a><a href={source + 'MONETARY-CONSTITUTION.md'}>Monetary constitution →</a><a href={source + 'FLIGHTPAPER.md'}>Implementation gates →</a></article>
      </div></section>
      <footer>AI may explain and propose. The authorized principal consents and signs.</footer>
    </main>
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><FrontendPreview /></React.StrictMode>);
