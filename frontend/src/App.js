import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/ranking/global')
      .then(response => {
        setRankings(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.log('Backend not connected yet:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      backgroundColor: '#0A0A0A',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '60px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        color: '#C9A84C',
        fontSize: '72px',
        fontWeight: 'bold',
        letterSpacing: '12px',
        margin: '0 0 8px 0'
      }}>
        BEST
      </h1>
      <p style={{
        color: '#555555',
        fontSize: '14px',
        letterSpacing: '4px',
        marginBottom: '60px'
      }}>
        WORLD RANKING
      </p>

      {loading ? (
        <p style={{ color: '#555555' }}>Connecting...</p>
      ) : rankings.length > 0 ? (
        rankings.map((video, index) => (
          <div key={video.video_id} style={{
            width: '600px',
            backgroundColor: '#111111',
            borderLeft: '3px solid #C9A84C',
            padding: '16px 20px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <span style={{
              color: index === 0 ? '#C9A84C' : '#333333',
              fontSize: index === 0 ? '32px' : '20px',
              fontWeight: 'bold',
              minWidth: '40px'
            }}>
              #{index + 1}
            </span>
            <div>
              <p style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontSize: '15px' }}>
                {video.title}
              </p>
              <p style={{ color: '#555555', margin: '0', fontSize: '12px' }}>
                {video.channel_name} · {video.view_count?.toLocaleString()} views
              </p>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#555555', letterSpacing: '2px' }}>
          AWAITING BACKEND CONNECTION
        </p>
      )}
    </div>
  );
}

export default App;