import React from 'react';

// RightRailMetrics — small vertical stats strip that slides in from the
// right edge when the mandala UI is open. Shows Discovery Score, fireflag
// remaining, and rank. Positioned to not collide with the FLEX wall tab
// (which sits at 50% vertical); this sits at top-right instead.

function RightRailMetrics({ discoveryScore, fireflagRemaining, rank, style }) {
  const items = [
    { label: 'DS', value: discoveryScore ?? '—', color: '#C8A951' },
    { label: 'FF', value: fireflagRemaining ?? '—', color: '#E74C3C' },
    { label: 'RK', value: rank ? `#${rank}` : '—', color: '#F5E6C8' },
  ];

  return (
    <div style={{
      position: 'fixed', top: '70px', right: '8px', zIndex: 148,
      display: 'flex', flexDirection: 'column', gap: '6px',
      animation: 'fadeInLeft 0.3s ease-out',
      pointerEvents: 'none',
      ...style,
    }}>
      {items.map((item) => (
        <div key={item.label} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '4px 6px',
          backgroundColor: 'rgba(13,8,0,0.85)',
          border: '1px solid #333',
          borderRadius: '4px',
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#555', fontSize: '8px', letterSpacing: '2px',
          }}>
            {item.label}
          </span>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: item.color, fontSize: '14px', fontWeight: 'bold',
            lineHeight: 1.1,
          }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RightRailMetrics;
