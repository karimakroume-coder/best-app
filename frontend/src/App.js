import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import SpatialMap from './SpatialMap';
import ColorOnboarding from './ColorOnboarding';
import PersonalBest from './PersonalBest';
import Countdown from './Countdown';
import fireflagPng from './assets/icons/FIREFLAG.png';

const DEFAULT_USER_ID = 'a307cc62-3afd-47b0-9911-9300a934d788';

const CATEGORIES = [
  { label: 'Global',        value: 'global' },
  { label: 'Music',         value: 'music' },
  { label: 'Gaming',        value: 'gaming' },
  { label: 'Sports',        value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Morocco',       value: 'morocco' },
  { label: 'Trending',      value: 'trending' },
];

function Rankings() {
  const [rankings, setRankings]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('global');
  const [userEmail, setUserEmail]             = useState('');
  const [discoveryScore, setDiscoveryScore]   = useState(null);
  const [darkMode, setDarkMode]               = useState(false);
  const [huntActive, setHuntActive]           = useState(false);
  const [showOnboarding, setShowOnboarding]   = useState(false);

  const checkColorOnboarding = () => {
    if (!localStorage.getItem('colorRanking')) {
      setShowOnboarding(true);
      return true;
    }
    return false;
  };

  const userId = localStorage.getItem('best_token')
    ? DEFAULT_USER_ID : null;

  // Auto-scroll the category strip so the active pill is centered.
  const categoryPillRefs = useRef({});
  useEffect(() => {
    const el = categoryPillRefs.current[selectedCategory];
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedCategory]);

  useEffect(() => {
    const email = localStorage.getItem('best_email');
    const token = localStorage.getItem('best_token');
    if (email) setUserEmail(email);
    if (token) {
      axios.get('https://web-production-a267.up.railway.app/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setDiscoveryScore(res.data.discovery_score))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const base = 'https://web-production-a267.up.railway.app';
    const url = selectedCategory === 'global' || selectedCategory === 'trending'
      ? `${base}/ranking/global`
      : selectedCategory === 'morocco'
      ? `${base}/ranking/country/MA`
      : `${base}/ranking/category/${selectedCategory}`;
    axios.get(url)
      .then(res => {
        let data = res.data;
        if (selectedCategory === 'trending') {
          // Same global pool, re-ranked by velocity (views/hour) instead of
          // the composite BEST score, to surface what's rising fastest.
          data = [...data]
            .sort((a, b) => (b.velocity_score ?? 0) - (a.velocity_score ?? 0))
            .map((v, i) => ({ ...v, rank: i + 1 }));
        }
        setRankings(data);
        setLoading(false);
        console.log('Rankings received:', data.length, data[0]?.title);
      })
      .catch(err => {
        setLoading(false);
        console.error('Rankings fetch failed:', err.message, url);
      });
  }, [selectedCategory]);

  const handleLogout = () => {
    localStorage.removeItem('best_token');
    localStorage.removeItem('best_email');
    setUserEmail('');
    setDiscoveryScore(null);
  };

  return (
    <div style={{ backgroundColor: darkMode ? '#000000' : '#0A0A0A', minHeight: '100vh',
                  fontFamily: 'Arial, sans-serif', position: 'relative' }}>

      {/* HEADER */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0,
                    padding: '12px 24px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    zIndex: 100, backgroundColor: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(10,10,10,0.8)',
                    backdropFilter: 'blur(8px)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'Pacifico, cursive', color: '#C8A951',
                           fontSize: '20px', lineHeight: 1 }}>BEST</span>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                           fontSize: '10px', letterSpacing: '6px' }}>VIDEO RANKING</span>
          </div>
          <div className="category-strip"
               style={{ display: 'flex', gap: '8px', marginLeft: '16px',
                        overflowX: 'auto', scrollBehavior: 'smooth',
                        scrollbarWidth: 'none', msOverflowStyle: 'none',
                        maxWidth: '42vw' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value}
                ref={el => { categoryPillRefs.current[cat.value] = el; }}
                onClick={() => setSelectedCategory(cat.value)}
                style={{ backgroundColor: selectedCategory === cat.value
                           ? '#C8A951' : 'transparent',
                         color: selectedCategory === cat.value ? '#0D0800' : '#555',
                         border: selectedCategory === cat.value ? 'none' : '1px solid #333',
                         padding: '6px 20px', cursor: 'pointer', flexShrink: 0,
                         fontFamily: 'Bebas Neue, sans-serif', fontSize: '13px',
                         letterSpacing: '3px', borderRadius: '2px' }}>
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>
          <style>{`
            .category-strip::-webkit-scrollbar { display: none; }
          `}</style>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/personal-best"
             title="My Personal Best 100"
             onTouchEnd={(e) => { e.preventDefault(); window.location.href = '/personal-best'; }}
             style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#C8A951',
                      fontSize: '10px', letterSpacing: '3px', textDecoration: 'none',
                      backgroundColor: 'transparent', border: '1px solid #C8A951',
                      borderRadius: 0, padding: '4px 10px', cursor: 'pointer',
                      minWidth: '44px', minHeight: '44px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            MY BEST
          </a>
          <button onClick={() => setHuntActive(a => !a)}
            title={huntActive ? 'Stop hunt' : 'Start hunt'}
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                     padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                           width: '16px', height: '16px', borderRadius: '50%',
                           border: `1.5px solid ${huntActive ? '#C9A84C' : '#555'}`,
                           boxShadow: huntActive ? '0 0 6px rgba(201,168,76,0.7)' : 'none',
                           transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}>
              <span style={{ fontSize: '8px', lineHeight: 1,
                             color: huntActive ? '#C9A84C' : '#555' }}>▲</span>
            </span>
          </button>
          <button onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Dark mode on' : 'Dark mode off'}
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                     padding: '2px', display: 'flex', alignItems: 'center' }}>
            <img src={fireflagPng} alt="Toggle dark mode"
                 style={{ width: '16px', height: '16px', objectFit: 'contain',
                          filter: darkMode
                            ? 'drop-shadow(0 0 4px rgba(243,156,18,0.9)) saturate(1.5)'
                            : 'grayscale(100%) brightness(0.7) opacity(0.6)',
                          transition: 'filter 0.3s ease' }} />
          </button>
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
            darkMode={darkMode}
            huntActive={huntActive}
            onPersonalBestAdded={() => {
              setDiscoveryScore(prev => prev !== null ? prev + 50 : 50);
            }}
            onHuntComplete={() => {
              setDiscoveryScore(prev => prev !== null ? prev + 50 : 50);
              setHuntActive(false);
            }}
            onHuntStop={() => setHuntActive(false)}
            onColorAssigned={() => {
              setDiscoveryScore(prev => prev !== null ? prev + 5 : 5);
            }}
            onFlexPlaced={() => {
              setDiscoveryScore(prev => prev !== null ? prev + 10 : 10);
            }}
            onBeforeColor={checkColorOnboarding}
          />
        </div>
      )}
      {showOnboarding && <ColorOnboarding onComplete={() => setShowOnboarding(false)} />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rankings />} />
        <Route path="/login"
          element={<Login onLogin={() => { window.location.href = '/'; }} />} />
        <Route path="/register"
          element={<Register onLogin={() => { window.location.href = '/'; }} />} />
        <Route path="/personal-best" element={<PersonalBest userId={DEFAULT_USER_ID} />} />
        <Route path="/launch" element={<Countdown />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;