import React from 'react';

const MAPS = [
  { id: 'world-best', label: 'WORLD BEST', color: '#F0C040', size: 52, active: true },
  { id: 'best-map', label: 'BEST MAP', color: '#A8A9AD', size: 44 },
  { id: 'my-best', label: 'MY BEST', color: '#F5E6C8', size: 40 },
  { id: 'crew-best', label: 'CREW BEST', color: '#CD7F32', size: 36 },
  { id: 'crown', label: 'CROWN', color: '#F0C040', size: 44, hasCrown: true },
];

function BNavigation({ currentMap, setCurrentMap, uiOpen }) {
  if (!uiOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 150,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
    }}>
      {MAPS.map((map) => (
        <button
          key={map.id}
          onClick={() => setCurrentMap(map.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: currentMap === map.id ? 1 : 0.35,
            transition: 'opacity 0.3s ease',
          }}
        >
          {map.hasCrown && (
            <span style={{ fontSize: '10px', lineHeight: 1, marginBottom: '2px' }}>
              👑
            </span>
          )}
          <span style={{
            fontFamily: 'Pacifico, cursive',
            fontSize: `${map.size}px`,
            color: map.color,
            lineHeight: 1,
          }}>
            B
          </span>
          <span style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '8px',
            color: map.color,
            letterSpacing: '2px',
            lineHeight: 1,
            marginTop: '2px',
          }}>
            {map.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default BNavigation;
