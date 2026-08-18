import React, { useState } from 'react';
import axios from 'axios';

function Register({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://web-production-a267.up.railway.app/auth/register', { email, password });
      localStorage.setItem('best_token', res.data.access_token);
      localStorage.setItem('best_email', email);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#F0C040', fontSize: '48px',
                   letterSpacing: '12px', marginBottom: '8px' }}>BEST</h1>
      <p style={{ color: '#555555', fontSize: '12px',
                  letterSpacing: '4px', marginBottom: '48px' }}>CREATE ACCOUNT</p>

      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '300px', padding: '12px 16px', marginBottom: '12px',
                 backgroundColor: '#111111', border: '1px solid #333333',
                 color: '#FFFFFF', fontSize: '14px', outline: 'none' }} />

      <input type="password" placeholder="Password (min 6 characters)" value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleRegister()}
        style={{ width: '300px', padding: '12px 16px', marginBottom: '24px',
                 backgroundColor: '#111111', border: '1px solid #333333',
                 color: '#FFFFFF', fontSize: '14px', outline: 'none' }} />

      {error && <p style={{ color: '#C0392B', fontSize: '12px',
                            marginBottom: '16px' }}>{error}</p>}

      <button onClick={handleRegister} disabled={loading}
        style={{ width: '332px', padding: '12px', backgroundColor: '#F0C040',
                 border: 'none', color: '#000000', fontSize: '13px',
                 letterSpacing: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
        {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
      </button>

      <p style={{ color: '#555555', fontSize: '12px', marginTop: '24px' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#F0C040', textDecoration: 'none' }}>
          Sign In
        </a>
      </p>
    </div>
  );
}

export default Register;