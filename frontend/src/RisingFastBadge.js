import React from 'react';

/**
 * RisingFastBadge — flat Brand Device pill (design pivot 2026-08-22).
 * Bordeaux fill, thin gold outline, flat Poppins Black gold text.
 */
function RisingFastBadge({ visible }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50px',
        left: 'clamp(160px, 20vw, 260px)',
        zIndex: 5,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          backgroundColor: '#5C1A1A',
          borderRadius: '10px',
          border: '1.5px solid #F0C040',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: '11px',
            letterSpacing: '0.14em',
            color: '#F0C040',
          }}
        >
          RISING FAST
        </span>
        <span style={{ fontSize: '11px', color: '#F0C040' }}>↗</span>
      </div>
    </div>
  );
}

export default RisingFastBadge;
