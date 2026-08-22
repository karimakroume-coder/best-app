import React from 'react';

/**
 * RankNumber — flat Brand Device rank badge (design pivot 2026-08-22).
 * Rounded-rect, bordeaux fill, thin gold outline, "#N" in flat Poppins
 * Black gold with a "CONSENSUS" label divided by a thin gold rule.
 * `compact` prop shrinks it for focusMode.
 */
export default function RankNumber({ rank, compact = false }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: compact ? '20px' : '40px',
        left: compact ? '20px' : '40px',
        zIndex: 5,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '6px' : '10px',
        backgroundColor: '#5C1A1A',
        border: '1.5px solid #F0C040',
        borderRadius: compact ? '10px' : '14px',
        padding: compact ? '4px 10px' : '8px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease-out',
      }}
    >
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 900,
          fontSize: compact ? '18px' : '28px',
          color: '#F0C040',
          lineHeight: 1,
          letterSpacing: '0.02em',
        }}
      >
        #{rank}
      </span>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: compact ? '8px' : '10px',
          color: 'rgba(245,230,200,0.8)',
          letterSpacing: '0.18em',
          paddingLeft: compact ? '6px' : '10px',
          borderLeft: '1px solid rgba(240,192,64,0.4)',
        }}
      >
        CONSENSUS
      </span>
    </div>
  );
}
