import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = [
  { label: 'Global',        value: 'global' },
  { label: 'Music',         value: 'music' },
  { label: 'Gaming',        value: 'gaming' },
  { label: 'Sports',        value: 'sports' },
  { label: 'Entertainment', value: 'entertainment' },
];

function App() {
  const [rankings, setRankings]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('global');

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory === 'global'
      ? 'http://localhost:8000/ranking/global'
      : `http://localhost:8000/ranking/category/${selectedCategory}`;

    axios.get(url)
      .then(res => { setRankings(res.data); setLoading(false); })
      .catch(err => { console.log('Error:', err); setLoading(false); });
  }, [selectedCategory]);

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

      <h1 style={{ color: '#C9A84C', fontSize: '72px', fontWeight: 'bold',
                   letterSpacing: '12px', margin: '0 0 8px 0' }}>
        BEST
      </h1>

      <p style={{ color: '#555555', fontSize: '14px',
                  letterSpacing: '4px', marginBottom: '40px' }}>
        WORLD RANKING
      </p>

      {/* CATEGORY FILTER */}
      <div style={{ marginBottom: '40px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            style={{
              backgroundColor: selectedCategory === cat.value ? '#C9A84C' : 'transparent',
              color:           selectedCategory === cat.value ? '#000000' : '#555555',
              border:          '1px solid',
              borderColor:     selectedCategory === cat.value ? '#C9A84C' : '#333333',
              padding:         '6px 16px',
              margin:          '0 4px',
              cursor:          'pointer',
              fontSize:        '12px',
              letterSpacing:   '2px',
              borderRadius:    '2px',
              transition:      'all 0.2s',
            }}>
            {cat.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* VIDEO LIST */}
      {loading ? (
        <p style={{ color: '#555555', letterSpacing: '2px' }}>LOADING...</p>
      ) : rankings.length > 0 ? (
        rankings.map((video) => (
          <div key={video.video_id} style={{
            width: '640px', backgroundColor: '#111111',
            borderLeft: `3px solid ${video.rank === 1 ? '#C9A84C' : '#222222'}`,
            padding: '16px 20px', marginBottom: '8px',
            display: 'flex', alignItems: 'center', gap: '20px'
          }}>

            {/* RANK NUMBER */}
            <span style={getRankStyle(video.rank)}>
              #{video.rank}
            </span>

            {/* THUMBNAIL */}
            {video.thumbnail_url && (
              <img src={video.thumbnail_url} alt=""
                   style={{ width: '80px', height: '45px',
                            objectFit: 'cover', borderRadius: '2px' }} />
            )}

            {/* VIDEO INFO */}
            <div style={{ flex: 1 }}>
              <p style={{ color: '#FFFFFF', margin: '0 0 4px 0',
                          fontSize: '14px', lineHeight: '1.3' }}>
                {video.title}
              </p>
              <p style={{ color: '#555555', margin: '0 0 8px 0', fontSize: '12px' }}>
                {video.channel_name} · {video.view_count?.toLocaleString()} views
              </p>

              {/* SCORE BAR */}
              <div style={{ width: '100%', height: '3px',
                            backgroundColor: '#222222', borderRadius: '2px' }}>
                <div style={{
                  width:           `${(video.total_score || 0) * 100}%`,
                  height:          '100%',
                  backgroundColor: (video.total_score || 0) > 0.4 ? '#C9A84C' : '#333333',
                  borderRadius:    '2px',
                  transition:      'width 0.5s ease',
                }} />
              </div>

              {/* SCORE NUMBER */}
              <p style={{ color: '#C9A84C', margin: '4px 0 0 0', fontSize: '10px',
                          letterSpacing: '1px' }}>
                BEST {video.total_score}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#555555', letterSpacing: '2px' }}>
          NO DATA AVAILABLE
        </p>
      )}
    </div>
  );
}

export default App;