import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import SpatialMap from './SpatialMap';

const CATEGORIES = [
  { label: 'Global',        value: 'global' },
  { label: 'Music',         value: 'music' },
  { label: 'Gaming',        value: 'gaming' },
  { label: 'Sports',        value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
];

function Rankings() {
  const [rankings, setRankings]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('global');
  const [userEmail, setUserEmail]             = useState('');
  const [discoveryScore, setDiscoveryScore]   = useState(null);
  const [assignedColors, setAssignedColors]   = useState({});

  const userId = 'a307cc62-3afd-47b0-9911-9300a934d788';

  useEffect(() => {
    const email = localStorage.getItem('best_email');
    const token = localStorage.getItem('best_token');
    if (email) setUserEmail(email);
    if (token) {
      axios.get('http://10.159.241.236:8000/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setDiscoveryScore(res.data.discovery_score))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory === 'global'
      ? 'http://10.159.241.236:8000/ranking/global'
      : `http://10.159.241.236:8000/ranking/category/${selectedCategory}`;
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

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh',
                  fontFamily: 'Arial, sans-serif', position: 'relative' }}>

      {/* HEADER */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0,
                    padding: '12px 24px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    zIndex: 100, backgroundColor: 'rgba(10,10,10,0.8)',
                    backdropFilter: 'blur(8px)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#C9A84C', fontSize: '20px',
                         fontWeight: 'bold', letterSpacing: '6px' }}>BEST</span>
          <div style={{ display: 'flex', gap: '4px', marginLeft: '16px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                style={{ backgroundColor: selectedCategory === cat.value
                           ? '#C9A84C' : 'transparent',
                         color: selectedCategory === cat.value ? '#000' : '#444',
                         border: '1px solid',
                         borderColor: selectedCategory === cat.value ? '#C9A84C' : '#222',
                         padding: '3px 10px', cursor: 'pointer',
                         fontSize: '9px', letterSpacing: '1px', borderRadius: '2px' }}>
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {userEmail ? (
            <>
              <span style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '1px' }}>
                {userEmail}
              </span>
              {discoveryScore !== null && (
                <span style={{ color: '#555', fontSize: '10px', letterSpacing: '1px' }}>
                  DISCOVERY {discoveryScore}
                </span>
              )}
              <button onClick={handleLogout}
                style={{ backgroundColor: 'transparent', border: '1px solid #333',
                         color: '#555', padding: '3px 10px', cursor: 'pointer',
                         fontSize: '9px', letterSpacing: '2px' }}>
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <a href="/login"
                 style={{ color: '#C9A84C', fontSize: '10px',
                          letterSpacing: '2px', textDecoration: 'none' }}>
                SIGN IN
              </a>
              <a href="/register"
                 style={{ color: '#555', fontSize: '10px',
                          letterSpacing: '2px', textDecoration: 'none' }}>
                REGISTER
              </a>
            </>
          )}
        </div>
      </div>

      {/* SPATIAL MAP */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '100vh', color: '#555', letterSpacing: '4px', fontSize: '12px' }}>
          LOADING...
        </div>
      ) : (
        <div style={{ position: 'fixed', top: 0, left: 0,
                      width: '100vw', height: '100vh' }}>
          <SpatialMap
            rankings={rankings}
            userId={userId}
            onColorAssigned={(videoId, color) => {
              setAssignedColors(prev => ({...prev, [videoId]: color}));
              setDiscoveryScore(prev => prev !== null ? prev + 5 : 5);
            }}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('best_token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rankings />} />
        <Route path="/login"
          element={<Login onLogin={() => {
            setLoggedIn(true);
            window.location.href = '/';
          }} />} />
        <Route path="/register"
          element={<Register onLogin={() => {
            setLoggedIn(true);
            window.location.href = '/';
          }} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;