import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Register from './Register';

const CATEGORIES = [
  { label: 'Global',        value: 'global' },
  { label: 'Music',         value: 'music' },
  { label: 'Gaming',        value: 'gaming' },
  { label: 'Sports',        value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
];

function Rankings() {
  const [rankings, setRankings]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('global');
  const [userEmail, setUserEmail]               = useState('');
  const [discoveryScore, setDiscoveryScore]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('best_email');
    const token = localStorage.getItem('best_token');
    if (email) setUserEmail(email);
    if (token) {
      axios.get('http://localhost:8000/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setDiscoveryScore(res.data.discovery_score))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory === 'global'
      ? 'http://localhost:8000/ranking/global'
      : `http://localhost:8000/ranking/category/${selectedCategory}`;
    axios.get(url)
      .then(res => { setRankings(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCategory]);

  const handleLogout = () => {
    localStorage.removeItem('best_token');
    localStorage.removeItem('best_email');
    setUserEmail('');
    setDiscoveryScore(null);
  };

  const getRankStyle = (rank) => {
    if (rank === 1)  return { color: '#C9A84C', fontSize: '36px', fontWeight: 'bold', minWidth: '50px' };
    if (rank <= 3)   return { color: '#A8A9AD', fontSize: '28px', fontWeight: 'bold', minWidth: '50px' };
    if (rank <= 10)  return { color: '#FFFFFF', fontSize: '22px', fontWeight: 'bold', minWidth: '50px' };
    return               { color: '#555555', fontSize: '16px', fontWeight: 'normal', minWidth: '50px' };
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', paddingTop: '60px',
                  fontFamily: 'Arial, sans-serif' }}>

      {/* HEADER */}
      <div style={{ position: 'fixed', top: 0, right: 0, padding: '12px 24px',
                    display: 'flex', alignItems: 'center', gap: '16px', zIndex: 100 }}>
        {userEmail ? (
          <>
            <span style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '1px' }}>
              {userEmail}
            </span>
            {discoveryScore !== null && (
              <span style={{ color: '#555555', fontSize: '11px', letterSpacing: '1px' }}>
                DISCOVERY {discoveryScore}
              </span>
            )}
            <button onClick={handleLogout}
              style={{ backgroundColor: 'transparent', border: '1px solid #333333',
                       color: '#555555', padding: '4px 12px', cursor: 'pointer',
                       fontSize: '10px', letterSpacing: '2px' }}>
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <a href="/login"
               style={{ color: '#C9A84C', fontSize: '11px',
                        letterSpacing: '2px', textDecoration: 'none' }}>
              SIGN IN
            </a>
            <a href="/register"
               style={{ color: '#555555', fontSize: '11px',
                        letterSpacing: '2px', textDecoration: 'none' }}>
              REGISTER
            </a>
          </>
        )}
      </div>

      <h1 style={{ color: '#C9A84C', fontSize: '72px', fontWeight: 'bold',
                   letterSpacing: '12px', margin: '0 0 8px 0' }}>BEST</h1>
      <p style={{ color: '#555555', fontSize: '14px',
                  letterSpacing: '4px', marginBottom: '40px' }}>WORLD RANKING</p>

      {/* CATEGORY FILTER */}
      <div style={{ marginBottom: '40px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
            style={{ backgroundColor: selectedCategory === cat.value ? '#C9A84C' : 'transparent',
                     color: selectedCategory === cat.value ? '#000000' : '#555555',
                     border: '1px solid',
                     borderColor: selectedCategory === cat.value ? '#C9A84C' : '#333333',
                     padding: '6px 16px', margin: '0 4px', cursor: 'pointer',
                     fontSize: '12px', letterSpacing: '2px', borderRadius: '2px' }}>
            {cat.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* VIDEO LIST */}
      {loading ? (
        <p style={{ color: '#555555', letterSpacing: '2px' }}>LOADING...</p>
      ) : rankings.map(video => (
        <div key={video.video_id} style={{
          width: '640px', backgroundColor: '#111111',
          borderLeft: `3px solid ${video.rank === 1 ? '#C9A84C' : '#222222'}`,
          padding: '16px 20px', marginBottom: '8px',
          display: 'flex', alignItems: 'center', gap: '20px' }}>

          <span style={getRankStyle(video.rank)}>#{video.rank}</span>

          {video.thumbnail_url && (
            <img src={video.thumbnail_url} alt=""
                 style={{ width: '80px', height: '45px', objectFit: 'cover' }} />
          )}

          <div style={{ flex: 1 }}>
            <p style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontSize: '14px' }}>
              {video.title}
            </p>
            <p style={{ color: '#555555', margin: '0 0 8px 0', fontSize: '12px' }}>
              {video.channel_name} · {video.view_count?.toLocaleString()} views
            </p>
            <div style={{ width: '100%', height: '3px', backgroundColor: '#222222' }}>
              <div style={{ width: `${(video.total_score || 0) * 100}%`, height: '100%',
                            backgroundColor: (video.total_score || 0) > 0.4 ? '#C9A84C' : '#333333' }} />
            </div>
            <p style={{ color: '#C9A84C', margin: '4px 0 0 0',
                        fontSize: '10px', letterSpacing: '1px' }}>
              BEST {video.total_score}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('best_token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rankings />} />
        <Route path="/login" element={<Login onLogin={() => { setLoggedIn(true); window.location.href='/'; }} />} />
        <Route path="/register" element={<Register onLogin={() => { setLoggedIn(true); window.location.href='/'; }} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;