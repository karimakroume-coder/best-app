import React from 'react';

// HeaderCrest — small vintage "BEST" monogram that sits top-left in the
// SpatialMap header when the mandala UI is open. Just the brand mark —
// no interactivity, no backend calls.

function HeaderCrest({ style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      flexShrink: 0,
      ...style,
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        border: '1.5px solid #C8A951',
        background: 'radial-gradient(circle at 35% 35%, #F5E6C8 0%, #C8A951 50%, #8B6914 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          color: '#0D0800', fontSize: '14px', fontWeight: 'bold',
          lineHeight: 1, marginTop: '-1px',
        }}>
          B
        </span>
      </div>
      <span style={{
        fontFamily: "'Cinzel', 'Bebas Neue', sans-serif",
        color: '#C8A951', fontSize: '13px', letterSpacing: '4px',
        fontWeight: 700,
      }}>
        BEST
      </span>
    </div>
  );
}

export default HeaderCrest;
