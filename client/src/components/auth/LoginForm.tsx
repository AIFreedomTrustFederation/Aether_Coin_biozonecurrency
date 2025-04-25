import React, { useState } from 'react';
import TwoFactorAuth from './TwoFactorAuth';

const LoginForm: React.FC = () => {
  const [isTwoFactorAuthVisible, setTwoFactorAuthVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const performLogin = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
    const loginSuccess = await fakeLoginFunction();

    if (loginSuccess) {
      showTwoFactorAuth();
      } else {
        setLoginError('Login failed. Please try again.');
    }
    } catch (error) {
      setLoginError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const showTwoFactorAuth = () => {
    setTwoFactorAuthVisible(true);
  };

  const fakeLoginFunction = async () => {
    return true;
  };

  return (
    <div className="login-form">
      <button onClick={performLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {loginError && <div className="error">{loginError}</div>}
      {isTwoFactorAuthVisible && <TwoFactorAuth />}
    </div>
  );
};

export default LoginForm;
