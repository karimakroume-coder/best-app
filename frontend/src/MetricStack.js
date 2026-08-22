import React from 'react';

/**
 * MetricStack — flat right-edge medallion stack (design pivot 2026-08-22).
 * Fireflag (hero metric) is a solid gold circle; FLEX / share are
 * bordeaux-fill, gold-outline circles. No gradient/emboss.
 */
function MetricItem({ icon, value, hero = false }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: hero ? '#F0C040' : '#5C1A1A',
          border: hero ? '1.5px solid #F0C040' : '1.5px solid #F0C040',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          fontSize: '15px',
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 200,
          fontSize: '12px',
          letterSpacing: '0.05em',
          color: '#F5E6C8',
          lineHeight: 1,
        }}
      >
        {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      </span>
    </div>
  );
}

function MetricStack({ fireflagCount, flexCount, shareCount }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        alignItems: 'center',
      }}
    >
      <MetricItem icon="🔥" value={fireflagCount} hero />
      <MetricItem icon="⚡" value={flexCount} />
      <MetricItem icon="↗" value={shareCount} />
    </div>
  );
}

export default MetricStack;
