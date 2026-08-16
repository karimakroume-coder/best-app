import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import SpatialMap from './SpatialMap';
import BNavigation from './BNavigation';
import ColorOnboarding from './ColorOnboarding';
import PersonalBest from './PersonalBest';
import Countdown from './Countdown';
import Creators from './Creators';

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
  const [currentMap, setCurrentMap]           = useState('world-best');
  const [uiOpen, setUiOpen]                  = useState(false);

  const checkColorOnboarding = () => {
    if (!localStorage.getItem('colorRanking')) {
      setShowOnboarding(true);
      return true;
    }
    return false;
  };

  // Only pass a userId when there is an actual auth token, so the
  // progressive registration gate can detect a logged-out visitor.
  const userId = localStorage.getItem('best_token') ? DEFAULT_USER_ID : null;

  useEffect(() => {
    const email = localStorage.getItem('best_email');
    const token = localStorage.getItem('best_token');
    if (email) setUserEmail(email);
    if (!token) return;
    const fetchScore = () => {
      axios.get('https://web-production-a267.up.railway.app/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setDiscoveryScore(res.data.discovery_score))
        .catch(() => {});
    };
    fetchScore();
    const interval = setInterval(fetchScore, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

      {/* SPATIAL MAP — the old fixed header has been folded into the
          Mandala Control Center (category strip, hunt/dark-mode toggles,
          profile/logout) rendered inside SpatialMap when uiOpen is true */}
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
            discoveryScore={discoveryScore ?? 0}
            currentMap={currentMap}
            setCurrentMap={setCurrentMap}
            onUIStateChange={setUiOpen}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            userEmail={userEmail}
            onLogout={handleLogout}
            onToggleDarkMode={() => setDarkMode(d => !d)}
            onToggleHunt={() => setHuntActive(a => !a)}
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
      <BNavigation
        currentMap={currentMap}
        setCurrentMap={setCurrentMap}
        uiOpen={uiOpen}
      />
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
        <Route path="/creators" element={<Creators />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;