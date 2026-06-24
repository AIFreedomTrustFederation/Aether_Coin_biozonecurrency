import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const TwoFactorAuth: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { verifyTwoFactor } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyTwoFactor(code);
      setError('');
      // Proceed to the next step after successful verification
    } catch {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <div>
      <h3>Two-Factor Authentication</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your 2FA code"
        />
        <button type="submit">Verify</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default TwoFactorAuth;