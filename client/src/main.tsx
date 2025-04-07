// Completely simplified main.tsx 
// Only redirects to ATC AIFreedomTrust Wallet and doesn't try to render React

// Redirect to ATC AIFreedomTrust Wallet
window.location.replace('https://atc.aifreedomtrust.com/wallet');

// Fallback in case redirect fails
document.addEventListener('DOMContentLoaded', () => {
  document.body.innerHTML = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 60px auto; padding: 20px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-radius: 8px;">
      <h1 style="color: #4338ca;">AetherCoin Wallet Has Moved</h1>
      <p style="line-height: 1.6; margin-bottom: 20px;">The AetherCoin Wallet application has been relocated to the AIFreedomTrust domain.</p>
      <p style="line-height: 1.6; margin-bottom: 20px;">You should be redirected automatically to <a href="https://atc.aifreedomtrust.com/wallet" style="color: #4338ca; font-weight: 500; text-decoration: none;">https://atc.aifreedomtrust.com/wallet</a>.</p>
      <p style="line-height: 1.6;">If you are not redirected automatically, please click the link above.</p>
    </div>
  `;
});
