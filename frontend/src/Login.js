import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://10.159.241.236:8000/auth/login', { email, password });
      localStorage.setItem('best_token', res.data.access_token);
      localStorage.setItem('best_email', email);
      onLogin();
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#C9A84C', fontSize: '48px',
                   letterSpacing: '12px', marginBottom: '8px' }}>BEST</h1>
      <p style={{ color: '#555555', fontSize: '12px',
                  letterSpacing: '4px', marginBottom: '48px' }}>SIGN IN</p>

      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '300px', padding: '12px 16px', marginBottom: '12px',
                 backgroundColor: '#111111', border: '1px solid #333333',
                 color: '#FFFFFF', fontSize: '14px', outline: 'none' }} />

      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
        style={{ width: '300px', padding: '12px 16px', marginBottom: '24px',
                 backgroundColor: '#111111', border: '1px solid #333333',
                 color: '#FFFFFF', fontSize: '14px', outline: 'none' }} />

      {error && <p style={{ color: '#C0392B', fontSize: '12px',
                            marginBottom: '16px' }}>{error}</p>}

      <button onClick={handleLogin} disabled={loading}
        style={{ width: '332px', padding: '12px', backgroundColor: '#C9A84C',
                 border: 'none', color: '#000000', fontSize: '13px',
                 letterSpacing: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
        {loading ? 'SIGNING IN...' : 'SIGN IN'}
      </button>

      <p style={{ color: '#555555', fontSize: '12px', marginTop: '24px' }}>
        No account?{' '}
        <a href="/register" style={{ color: '#C9A84C', textDecoration: 'none' }}>
          Register
        </a>
      </p>
    </div>
  );
}

export default Login;