import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch demo accounts
    const fetchDemoAccounts = async () => {
      try {
        const response = await fetch('/api/auth/demo-accounts');
        if (response.ok) {
          const data = await response.json();
          setDemoAccounts(data.demoAccounts || []);
        }
      } catch (error) {
        console.error('Failed to fetch demo accounts:', error);
      }
    };
    fetchDemoAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    setShowDemoModal(false);

    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: demoEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
        window.location.reload();
      } else {
        setError(data.error || 'Demo login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="whatsapp-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.4.8 3.1 1.3 4.9 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.8 14.5c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8.1.1.1.3 0 .4-.1.2-.2.3-.3.4l-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.1.2.1.4.1.5-.1.1-.2.5-.6.7-.8.2-.2.3-.1.5-.1.2.1 1.3.6 1.5.7.2.1.4.2.4.3.2.2.2.8 0 1.4z"/>
            </svg>
          </div>
          <h1>Cross-Chat</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button 
            type="button" 
            className="demo-button" 
            onClick={() => setShowDemoModal(true)}
            disabled={loading}
          >
            🎭 Try Demo Account
          </button>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>

      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Choose a Demo Account</h2>
            <p className="demo-description">
              Try Cross-Chat without creating an account. Demo accounts are pre-configured and can chat in a shared group.
            </p>
            <div className="demo-accounts">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  className="demo-account-button"
                  onClick={() => handleDemoLogin(account.email)}
                  disabled={loading}
                >
                  <div className="demo-account-name">{account.displayName}</div>
                  <div className="demo-account-about">{account.about}</div>
                </button>
              ))}
            </div>
            <button 
              className="modal-close" 
              onClick={() => setShowDemoModal(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
